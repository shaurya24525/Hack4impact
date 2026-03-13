import { atom } from 'tldraw'
import type { TldrawAgent } from '../TldrawAgent'
import { BaseAgentManager } from './BaseAgentManager'

/**
 * Manages screen + audio recording of an agent session.
 *
 * Flow:
 *  1. User arms recording via the 🔴 button (sets isArmed = true).
 *  2. On form submit (user gesture) `requestStream()` is called — this shows
 *     the browser's screen-picker dialog. Select "Tab" + "Share tab audio"
 *     to capture TTS speech as well.
 *  3. When the agent starts working, `startRecording()` is called.
 *  4. When the agent finishes (or is cancelled), `stopRecording()` is called,
 *     which stops the MediaRecorder and immediately triggers a file download.
 */
export class AgentRecordingManager extends BaseAgentManager {
	private $isArmed = atom('recordingArmed', false)
	private $isRecording = atom('recordingActive', false)

	private mediaStream: MediaStream | null = null
	private mediaRecorder: MediaRecorder | null = null
	private chunks: Blob[] = []

	constructor(agent: TldrawAgent) {
		super(agent)
	}

	// ───────── state accessors ─────────

	isSupported(): boolean {
		return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia
	}

	/** Whether the user has enabled recording for the next prompt. */
	isArmed(): boolean {
		return this.$isArmed.get()
	}

	/** Whether a recording is currently in progress. */
	isRecording(): boolean {
		return this.$isRecording.get()
	}

	/** Toggle armed state. Disarming mid-recording stops it. */
	toggleArmed(): void {
		const next = !this.$isArmed.get()
		this.$isArmed.set(next)
		if (!next) {
			this.stopRecording()
		}
	}

	// ───────── lifecycle ─────────

	/**
	 * Must be called inside a user-gesture handler (e.g. form submit).
	 * Shows the browser's screen/tab share picker and stores the stream.
	 * Returns true if the user granted access, false if they cancelled.
	 */
	async requestStream(): Promise<boolean> {
		if (!this.isSupported()) return false
		// Release any existing stream first
		this.releaseStream()
		try {
			this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
				video: { frameRate: { ideal: 30 } } as MediaTrackConstraints,
				audio: true,
			})
			// If the user stops sharing via browser's "Stop sharing" button, clean up
			this.mediaStream.getVideoTracks()[0].addEventListener('ended', () => this.stopRecording())
			return true
		} catch {
			// User dismissed the dialog or permission denied
			this.$isArmed.set(false)
			return false
		}
	}

	/**
	 * Start recording. Call this when the agent begins working.
	 * Requires a stream to already be available from `requestStream()`.
	 */
	startRecording(): void {
		if (!this.mediaStream || this.$isRecording.get()) return

		this.chunks = []

		const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
			? 'video/webm;codecs=vp9,opus'
			: MediaRecorder.isTypeSupported('video/webm')
				? 'video/webm'
				: ''

		this.mediaRecorder = mimeType
			? new MediaRecorder(this.mediaStream, { mimeType })
			: new MediaRecorder(this.mediaStream)

		this.mediaRecorder.ondataavailable = (e) => {
			if (e.data.size > 0) this.chunks.push(e.data)
		}

		// Collect a chunk every 250ms so we always have data even if stop() is called quickly
		this.mediaRecorder.start(250)
		this.$isRecording.set(true)
	}

	/**
	 * Stop recording. Triggers an automatic file download when done.
	 * Safe to call even if not currently recording.
	 */
	stopRecording(): void {
		if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
			this.cleanup()
			return
		}

		this.mediaRecorder.onstop = () => {
			this.downloadRecording()
			this.cleanup()
		}
		this.mediaRecorder.stop()
	}

	// ───────── internals ─────────

	private downloadRecording(): void {
		if (this.chunks.length === 0) return

		const mimeType = this.mediaRecorder?.mimeType || 'video/webm'
		const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
		const blob = new Blob(this.chunks, { type: mimeType })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = `feynman-session-${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	private releaseStream(): void {
		this.mediaStream?.getTracks().forEach((t) => t.stop())
		this.mediaStream = null
	}

	private cleanup(): void {
		this.releaseStream()
		this.mediaRecorder = null
		this.chunks = []
		this.$isRecording.set(false)
		this.$isArmed.set(false)
	}

	reset(): void {
		this.stopRecording()
	}
}
