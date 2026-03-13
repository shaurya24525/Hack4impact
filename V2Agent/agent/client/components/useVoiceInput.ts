import { useCallback, useRef, useState } from 'react'

interface SpeechRecognitionEvent {
	results: SpeechRecognitionResultList
	resultIndex: number
}

interface SpeechRecognitionErrorEvent {
	error: string
}

/**
 * Hook for voice input using Web Speech API.
 * Returns state and controls for microphone-based dictation.
 */
export function useVoiceInput(onResult: (transcript: string) => void) {
	const [isListening, setIsListening] = useState(false)
	const recognitionRef = useRef<any>(null)

	const isSupported =
		typeof window !== 'undefined' &&
		('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

	const startListening = useCallback(() => {
		if (!isSupported) return

		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
		const recognition = new SpeechRecognition()

		recognition.continuous = false
		recognition.interimResults = false
		recognition.lang = 'en-US'

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			const last = event.results.length - 1
			const transcript = event.results[last][0].transcript.trim()
			if (transcript) {
				onResult(transcript)
			}
		}

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			if (event.error !== 'no-speech' && event.error !== 'aborted') {
				console.warn('Speech recognition error:', event.error)
			}
			setIsListening(false)
		}

		recognition.onend = () => {
			setIsListening(false)
			recognitionRef.current = null
		}

		recognitionRef.current = recognition
		recognition.start()
		setIsListening(true)
	}, [isSupported, onResult])

	const stopListening = useCallback(() => {
		if (recognitionRef.current) {
			recognitionRef.current.stop()
			recognitionRef.current = null
		}
		setIsListening(false)
	}, [])

	const toggleListening = useCallback(() => {
		if (isListening) {
			stopListening()
		} else {
			startListening()
		}
	}, [isListening, startListening, stopListening])

	return {
		isListening,
		isSupported,
		startListening,
		stopListening,
		toggleListening,
	}
}
