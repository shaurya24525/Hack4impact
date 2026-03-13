import { atom } from 'tldraw'
import { AgentAction } from '../../../shared/types/AgentAction'
import { Streaming } from '../../../shared/types/Streaming'
import type { TldrawAgent } from '../TldrawAgent'
import { BaseAgentManager } from './BaseAgentManager'

/**
 * Manages text-to-speech for agent actions — real-time & in sync.
 *
 * Speech is triggered **immediately** when a speakable action completes.
 * A sequential queue ensures utterances never interrupt each other:
 * each sentence finishes naturally before the next begins.
 *
 * Because the LLM interleaves `message` actions between `create` / `label`
 * actions, speaking messages immediately means narration and drawing happen
 * concurrently — the user hears explanations *while* seeing shapes appear.
 *
 * Sentences are kept short (≤ 200 chars) to avoid Chrome's long-utterance
 * pause bug, with a periodic `resume()` timer as an extra safeguard.
 */
export class AgentSpeechManager extends BaseAgentManager {
	private $enabled = atom('speechEnabled', true)

	/** Sentences waiting to be spoken, played one at a time. */
	private queue: string[] = []
	private isSpeaking = false

	/**
	 * Chrome silently pauses long utterances after ~15 s.
	 * A periodic `speechSynthesis.resume()` keeps them alive.
	 */
	private resumeTimer: ReturnType<typeof setInterval> | null = null

	constructor(agent: TldrawAgent) {
		super(agent)
	}

	// ───────── basic controls ─────────

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

	/** Cancel all speech and clear the queue. */
	stop(): void {
		if (!this.isSupported()) return
		this.queue = []
		this.isSpeaking = false
		this.stopResumeTimer()
		window.speechSynthesis.cancel()
	}

	// ───────── real-time speaking ─────────

	/**
	 * Called for every completed action while drawing is in progress.
	 * Speakable text is cleaned, split into sentences, and queued.
	 * Playback starts immediately — it runs **alongside** drawing.
	 */
	handleCompletedAction(action: Streaming<AgentAction>): void {
		if (!action.complete) return
		if (!this.isEnabled() || !this.isSupported()) return

		const text = this.extractSpeakableText(action)
		if (!text) return

		const cleaned = this.cleanTextForSpeech(text)
		if (!cleaned) return

		// Split into short sentences and enqueue
		const sentences = this.splitIntoSentences(cleaned)
		for (const s of sentences) {
			this.queue.push(s)
		}

		// If nothing is currently speaking, kick off playback
		if (!this.isSpeaking) {
			this.playNext()
		}
		// Otherwise the current utterance's onend will chain to the next
	}

	// ───────── sequential playback ─────────

	private playNext(): void {
		if (this.queue.length === 0) {
			this.isSpeaking = false
			this.stopResumeTimer()
			return
		}

		this.isSpeaking = true
		const text = this.queue.shift()!
		const utterance = new SpeechSynthesisUtterance(text)

		const isSlowPaced = this.agent.accessibility.get('slowPacedMode')
		utterance.rate = isSlowPaced ? 0.8 : 1.05
		utterance.pitch = 1.0
		utterance.volume = 1.0

		utterance.onend = () => this.playNext()
		utterance.onerror = () => this.playNext()

		window.speechSynthesis.speak(utterance)
		this.startResumeTimer()
	}

	// ───────── Chrome resume workaround ─────────

	private startResumeTimer(): void {
		if (this.resumeTimer) return
		this.resumeTimer = setInterval(() => {
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.resume()
			}
		}, 5000)
	}

	private stopResumeTimer(): void {
		if (this.resumeTimer) {
			clearInterval(this.resumeTimer)
			this.resumeTimer = null
		}
	}

	// ───────── text extraction ─────────

	/**
	 * Only 'message' actions are spoken — they are the real user-facing
	 * explanations. `think` / `review` / `add-detail` are internal reasoning
	 * and must never be read aloud.
	 * In slow-paced mode, canvas actions are also narrated.
	 */
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
				if (isSlowPaced && (action as any).intent) {
					return `Creating: ${(action as any).intent}`
				}
				return null
			case 'label':
				if (isSlowPaced && (action as any).text) {
					return `Label: ${(action as any).text}`
				}
				return null
			case 'move':
				if (isSlowPaced && (action as any).intent) {
					return `Moving: ${(action as any).intent}`
				}
				return null
			case 'delete':
				if (isSlowPaced && (action as any).intent) {
					return `Removing: ${(action as any).intent}`
				}
				return null
			default:
				return null
		}
	}

	/**
	 * Strip reasoning sentences that leak from the LLM into message text.
	 */
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

	// ───────── helpers ─────────

	/**
	 * Split cleaned text into sentence-sized chunks (≤ 200 chars each)
	 * so Chrome never gets a single utterance long enough to stall.
	 */
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
		if (current.trim()) {
			result.push(current.trim())
		}
		return result
	}

	private cleanTextForSpeech(text: string): string {
		return (
			text
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
		)
	}

	reset(): void {
		this.stop()
	}
}
