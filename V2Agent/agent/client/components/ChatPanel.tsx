import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { useValue } from 'tldraw'
import { useAgent } from '../agent/TldrawAgentAppProvider'
import { AccessibilityPanel } from './AccessibilityPanel'
import { ChatHistory } from './chat-history/ChatHistory'
import { ChatInput } from './ChatInput'
import { TodoList } from './TodoList'


export function ChatPanel() {
	const agent = useAgent()
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const [showA11y, setShowA11y] = useState(false)

	const speechEnabled = useValue('speechEnabled', () => agent.speech.isEnabled(), [agent])
	const speechSupported = agent.speech.isSupported()

	const handleToggleSpeech = useCallback(() => {
		agent.speech.toggle()
	}, [agent])

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault()
			if (!inputRef.current) return
			const formData = new FormData(e.currentTarget)
			const value = formData.get('input') as string

			// If the user's message is empty, just cancel the current request (if there is one)
			if (value === '') {
				agent.cancel()
				return
			}

			// Clear the chat input (context is cleared after it's captured in requestAgentActions)
			inputRef.current.value = ''

			// Sending a new message to the agent should interrupt the current request
			agent.interrupt({
				input: {
					agentMessages: [value],
					bounds: agent.editor.getViewportPageBounds(),
					source: 'user',
					contextItems: agent.context.getItems(),
				},
			})
		},
		[agent]
	)

	const handleNewChat = useCallback(() => {
		agent.reset()
	}, [agent])

	return (
		<div className="chat-panel tl-theme__dark">
			<div className="chat-header">
				<button className="new-chat-button" onClick={handleNewChat}>
					+
				</button>
				{speechSupported && (
					<button
						className="speech-toggle-button"
						onClick={handleToggleSpeech}
						title={speechEnabled ? 'Disable voice' : 'Enable voice'}
					>
						{speechEnabled ? '🔊' : '🔇'}
					</button>
				)}
				<button
					className={`a11y-header-button ${showA11y ? 'active' : ''}`}
					onClick={() => setShowA11y((v) => !v)}
					title="Accessibility settings"
				>
					&#9855;
				</button>
			</div>
			{showA11y && <AccessibilityPanel />}
			<ChatHistory agent={agent} />
			<div className="chat-input-container">
				<TodoList agent={agent} />
				<ChatInput handleSubmit={handleSubmit} inputRef={inputRef} />
			</div>
		</div>
	)
}
