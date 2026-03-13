import { atom } from 'tldraw'
import type { TldrawAgent } from '../TldrawAgent'
import { BaseAgentManager } from './BaseAgentManager'

/**
 * All accessibility settings, persisted and reactive.
 */
export interface AccessibilitySettings {
	/** Use simple language ("Explain like I'm 10") */
	simplifyLanguage: boolean
	/** Only use basic shapes (boxes + arrows + text) for diagrams */
	simplifiedDiagrams: boolean
	/** Use OpenDyslexic font throughout the UI */
	dyslexiaFont: boolean
	/** High contrast colors */
	highContrast: boolean
	/** Auto-zoom to each new shape after creation */
	zoomToShape: boolean
	/** Pulse/highlight newly created shapes */
	highlightNewShapes: boolean
	/** Slow paced mode: pause between actions with narration */
	slowPacedMode: boolean
	/** Step-by-step: wait for user "Next" between diagram steps */
	stepByStepMode: boolean
	/** Focus mode: blur non-active shapes to reduce overload */
	focusMode: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
	simplifyLanguage: false,
	simplifiedDiagrams: false,
	dyslexiaFont: false,
	highContrast: false,
	zoomToShape: false,
	highlightNewShapes: true,
	slowPacedMode: false,
	stepByStepMode: false,
	focusMode: false,
}

/**
 * Manages accessibility features for the agent.
 * Provides reactive settings that drive visual, auditory, and cognitive aids.
 */
export class AgentAccessibilityManager extends BaseAgentManager {
	private $settings = atom<AccessibilitySettings>('accessibilitySettings', { ...DEFAULT_SETTINGS })

	constructor(agent: TldrawAgent) {
		super(agent)
		this.loadFromStorage()
	}

	/** Get all current settings. */
	getSettings(): AccessibilitySettings {
		return this.$settings.get()
	}

	/** Get a single setting value. */
	get<K extends keyof AccessibilitySettings>(key: K): AccessibilitySettings[K] {
		return this.$settings.get()[key]
	}

	/** Update one or more settings. */
	update(partial: Partial<AccessibilitySettings>): void {
		this.$settings.update((prev) => {
			const next = { ...prev, ...partial }
			this.saveToStorage(next)
			this.applyDOMEffects(next)
			return next
		})
	}

	/** Toggle a boolean setting. */
	toggle(key: keyof AccessibilitySettings): void {
		const current = this.get(key)
		if (typeof current === 'boolean') {
			this.update({ [key]: !current } as Partial<AccessibilitySettings>)
		}
	}

	/**
	 * Build extra instructions to inject into the agent's prompt
	 * based on current accessibility settings.
	 */
	getPromptInstructions(): string {
		const settings = this.getSettings()
		const instructions: string[] = []

		if (settings.simplifyLanguage) {
			instructions.push(
				'IMPORTANT: The user has cognitive accessibility needs. Use very simple, clear language. Explain everything as if speaking to a 10-year-old. Avoid jargon, technical terms, and complex sentences. Use short sentences and common words. When describing concepts, use concrete everyday analogies.'
			)
		}

		if (settings.simplifiedDiagrams) {
			instructions.push(
				'IMPORTANT: Only use simple shapes for diagrams: rectangles (geo), arrows, and text labels. Do not use complex layouts, many colors, or intricate designs. Keep diagrams clean with maximum 5-7 elements. Use large shapes (minimum 250px) with big text labels. Leave generous spacing between elements (at least 100px gaps).'
			)
		}

		if (settings.slowPacedMode) {
			instructions.push(
				'IMPORTANT: The user needs a slow, paced experience. Before each drawing action, include a message action explaining what you are about to draw and why. Be descriptive: "Now I am going to draw a box that represents the input step. This is where data enters our system." After completing the diagram, provide a summary message walking through the entire diagram step by step.'
			)
		}

		if (settings.stepByStepMode) {
			instructions.push(
				'IMPORTANT: Break your work into small steps. Create only ONE shape or element at a time, then send a message explaining what you just created and what comes next. Wait for the user to respond before continuing. Build the diagram piece by piece so the user can follow along.'
			)
		}

		return instructions.join('\n\n')
	}

	/** Apply CSS classes to the document based on settings. */
	private applyDOMEffects(settings: AccessibilitySettings): void {
		if (typeof document === 'undefined') return
		const root = document.documentElement

		root.classList.toggle('a11y-dyslexia-font', settings.dyslexiaFont)
		root.classList.toggle('a11y-high-contrast', settings.highContrast)
		root.classList.toggle('a11y-focus-mode', settings.focusMode)
	}

	/** Persist settings to localStorage. */
	private saveToStorage(settings: AccessibilitySettings): void {
		try {
			localStorage.setItem('feynman-a11y-settings', JSON.stringify(settings))
		} catch {
			// localStorage unavailable
		}
	}

	/** Load settings from localStorage on init. */
	private loadFromStorage(): void {
		try {
			const stored = localStorage.getItem('feynman-a11y-settings')
			if (stored) {
				const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>
				const merged = { ...DEFAULT_SETTINGS, ...parsed }
				this.$settings.set(merged)
				this.applyDOMEffects(merged)
			}
		} catch {
			// localStorage unavailable or corrupted
		}
	}

	reset(): void {
		this.$settings.set({ ...DEFAULT_SETTINGS })
		this.applyDOMEffects(DEFAULT_SETTINGS)
		this.saveToStorage(DEFAULT_SETTINGS)
	}
}
