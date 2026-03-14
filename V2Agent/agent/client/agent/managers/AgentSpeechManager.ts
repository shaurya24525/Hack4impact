import { atom } from 'tldraw'
import { AgentAction } from '../../../shared/types/AgentAction'
import { Streaming } from '../../../shared/types/Streaming'
import type { TldrawAgent } from '../TldrawAgent'
import { BaseAgentManager } from './BaseAgentManager'

/**
 * Manages text-to-speech for agent actions using the Web Speech API.
 *
 * Speech is queued as actions complete and played back sequentially.
 * Each sentence finishes before the next begins.
 */
export class AgentSpeechManager extends BaseAgentManager {
	private $enabled = atom('speechEnabled', true)
	private queue: string[] = []
	private isSpeaking = false
	private voicesReady = false

	/**
	 * Chrome pauses long utterances after ~15s.
	 * A periodic resume() call keeps them alive.
	 */
	private resumeTimer: ReturnType<typeof setInterval> | null = null

	constructor(agent: TldrawAgent) {
		super(agent)
		this.initVoices()
	}

	/**
	 * Chrome loads voices asynchronously. We must wait for them
	 * before calling speak(), otherwise it silently does nothing.
	 */
	private initVoices(): void {
		if (!this.isSupported()) return
		const synth = window.speechSynthesis
		if (synth.getVoices().length > 0) {
			this.voicesReady = true
			return
		}
		const handler = () => {
			this.voicesReady = true
			synth.removeEventListener('voiceschanged', handler)
			// Flush anything that was queued before voices loaded
			if (this.queue.length > 0 && !this.isSpeaking) {
				this.drainQueue()
			}
		}
		synth.addEventListener('voiceschanged', handler)
		synth.getVoices() // triggers load in Chrome
	}

	isSupported(): boolean {
		return typeof window !== 'undefined' && 'speechSynthesis' in window
	}

	isEnabled(): boolean {
		return this.$enabled.get()
	}

	setEnabled(enabled: boolean): void {
		this.$enabled.set(enabled)
		if (!enabled) this.stop()
	}

	toggle(): void {
		this.setEnabled(!this.isEnabled())
	}

	stop(): void {
		if (!this.isSupported()) return
		this.queue = []
		this.isSpeaking = false
		this.stopResumeTimer()
		window.speechSynthesis.cancel()
	}

	/**
	 * Called for every completed action. Extracts speakable text,
	 * queues it, and kicks off playback if idle.
	 */
	handleCompletedAction(action: Streaming<AgentAction>): void {
		if (!action.complete) return
		if (!this.isEnabled() || !this.isSupported()) return

		const text = this.extractSpeakableText(action)
		if (!text) return
		const cleaned = this.cleanTextForSpeech(text)
		if (!cleaned) return

		const sentences = this.splitIntoSentences(cleaned)
		this.queue.push(...sentences)

		if (!this.isSpeaking && this.voicesReady) {
			this.drainQueue()
		}
	}

	// ─── Playback ───

	/**
	 * Speak sentences one at a time. Each utterance's `onend` triggers the next.
	 * No cancel() before speak() — that's the #1 cause of silent failures in Chrome.
	 */
	private drainQueue(): void {
		if (this.queue.length === 0) {
			this.isSpeaking = false
			this.stopResumeTimer()
			return
		}

		this.isSpeaking = true
		const text = this.queue.shift()!
		const synth = window.speechSynthesis
		const utterance = new SpeechSynthesisUtterance(text)

		const isSlowPaced = this.agent.accessibility.get('slowPacedMode')
		utterance.rate = isSlowPaced ? 0.8 : 1.05
		utterance.pitch = 1.0
		utterance.volume = 1.0

		// Explicitly pick a voice — Chrome's default can be muted/broken
		const voices = synth.getVoices()
		const voice =
			voices.find((v) => v.lang.startsWith('en') && v.localService) ||
			voices.find((v) => v.lang.startsWith('en')) ||
			voices[0]
		if (voice) utterance.voice = voice

		// Guard against double-advance
		let done = false
		const next = () => {
			if (done) return
			done = true
			this.drainQueue()
		}
		utterance.onend = next
		utterance.onerror = next

		synth.speak(utterance)
		this.startResumeTimer()
	}

	// ─── Chrome resume workaround ───

	private startResumeTimer(): void {
		if (this.resumeTimer) return
		this.resumeTimer = setInterval(() => {
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.resume()
			}
		}, 5_000)
	}

	private stopResumeTimer(): void {
		if (this.resumeTimer) {
			clearInterval(this.resumeTimer)
			this.resumeTimer = null
		}
	}

	// ─── Text extraction ───

	private extractSpeakableText(action: Streaming<AgentAction>): string | null {
		const isSlowPaced = this.agent.accessibility.get('slowPacedMode')

		switch (action._type) {
			case 'message':
				return this.stripReasoning((action as any).text ?? '')
			case 'think':
			case 'review':
			case 'add-detail':
				return null
			case 'create':
				return isSlowPaced && (action as any).intent
					? `Creating: ${(action as any).intent}`
					: null
			case 'label':
				return isSlowPaced && (action as any).text
					? `Label: ${(action as any).text}`
					: null
			case 'move':
				return isSlowPaced && (action as any).intent
					? `Moving: ${(action as any).intent}`
					: null
			case 'delete':
				return isSlowPaced && (action as any).intent
					? `Removing: ${(action as any).intent}`
					: null
			default:
				return null
		}
	}

	private stripReasoning(text: string): string | null {
		const sentences = text.split(/(?<=[.!?])\s+/)
		const kept = sentences.filter((s) => {
			const lower = s.trimStart().toLowerCase()
			return !(
				lower.startsWith('the user wants') ||
				lower.startsWith('the user is asking') ||
				lower.startsWith('i should') ||
				lower.startsWith('i need to') ||
				lower.startsWith("i'll ") ||
				lower.startsWith('i will now') ||
				lower.startsWith('let me think') ||
				lower.startsWith('let me analyze') ||
				lower.startsWith('let me consider') ||
				lower.startsWith('my plan is') ||
				lower.startsWith('my approach') ||
				lower.startsWith('first, i need to') ||
				lower.startsWith('now i need to') ||
				lower.startsWith('looking at this')
			)
		})
		const result = kept.join(' ').trim()
		return result || null
	}

	// ─── Helpers ───

	private splitIntoSentences(text: string): string[] {
		const raw = text.match(/[^.!?]+[.!?]+\s*/g) || [text]
		const result: string[] = []
		let current = ''
		for (const segment of raw) {
			if (current.length + segment.length > 200 && current) {
				result.push(current.trim())
				current = ''
			}
			current += segment
		}
		if (current.trim()) result.push(current.trim())
		return result
	}

	private cleanTextForSpeech(text: string): string {
		return text
			.replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
			.replace(/^#{1,6}\s+/gm, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/```[\s\S]*?```/g, '')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
			.replace(/\n{2,}/g, '. ')
			.replace(/\n/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim()
	}

	reset(): void {
		this.stop()
	}
}
