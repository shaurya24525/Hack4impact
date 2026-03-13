import { useCallback } from 'react'
import { useValue } from 'tldraw'
import { AccessibilitySettings } from '../agent/managers/AgentAccessibilityManager'
import { useAgent } from '../agent/TldrawAgentAppProvider'

export function AccessibilityPanel() {
	const agent = useAgent()
	const settings = useValue('a11ySettings', () => agent.accessibility.getSettings(), [agent])

	const toggle = useCallback(
		(key: keyof AccessibilitySettings) => {
			agent.accessibility.toggle(key)
		},
		[agent]
	)

	return (
		<div className="a11y-panel">
			<div className="a11y-panel-header">
				<span className="a11y-icon">&#9855;</span>
				<span>Accessibility</span>
			</div>

			<div className="a11y-section">
				<div className="a11y-section-title">Language &amp; Understanding</div>
				<ToggleRow
					label="Simple Language (ELI10)"
					description="Explains everything in plain, easy words"
					checked={settings.simplifyLanguage}
					onChange={() => toggle('simplifyLanguage')}
				/>
				<ToggleRow
					label="Simplified Diagrams"
					description="Only basic shapes: boxes, arrows, text"
					checked={settings.simplifiedDiagrams}
					onChange={() => toggle('simplifiedDiagrams')}
				/>
			</div>

			<div className="a11y-section">
				<div className="a11y-section-title">Display</div>
				<ToggleRow
					label="Dyslexia-Friendly Font"
					description="Uses OpenDyslexic typeface"
					checked={settings.dyslexiaFont}
					onChange={() => toggle('dyslexiaFont')}
				/>
				<ToggleRow
					label="High Contrast"
					description="Stronger colors and bigger text"
					checked={settings.highContrast}
					onChange={() => toggle('highContrast')}
				/>
			</div>

			<div className="a11y-section">
				<div className="a11y-section-title">Visual Guidance</div>
				<ToggleRow
					label="Zoom to New Shapes"
					description="Auto-focuses on each new element"
					checked={settings.zoomToShape}
					onChange={() => toggle('zoomToShape')}
				/>
				<ToggleRow
					label="Highlight New Shapes"
					description="Pulse animation on newly created shapes"
					checked={settings.highlightNewShapes}
					onChange={() => toggle('highlightNewShapes')}
				/>
				<ToggleRow
					label="Focus Mode"
					description="Dims other shapes to reduce overload"
					checked={settings.focusMode}
					onChange={() => toggle('focusMode')}
				/>
			</div>

			<div className="a11y-section">
				<div className="a11y-section-title">Pacing</div>
				<ToggleRow
					label="Slow Narrated Mode"
					description="Pauses and narrates each step"
					checked={settings.slowPacedMode}
					onChange={() => toggle('slowPacedMode')}
				/>
				<ToggleRow
					label="Step-by-Step Mode"
					description="Builds diagram one piece at a time"
					checked={settings.stepByStepMode}
					onChange={() => toggle('stepByStepMode')}
				/>
			</div>
		</div>
	)
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: {
	label: string
	description: string
	checked: boolean
	onChange: () => void
}) {
	return (
		<label className="a11y-toggle-row">
			<div className="a11y-toggle-text">
				<span className="a11y-toggle-label">{label}</span>
				<span className="a11y-toggle-desc">{description}</span>
			</div>
			<div className={`a11y-toggle-switch ${checked ? 'active' : ''}`} onClick={onChange}>
				<div className="a11y-toggle-thumb" />
			</div>
		</label>
	)
}
