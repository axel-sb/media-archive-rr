import type { ReactNode } from 'react'

interface ToggleButtonProps {
	onToggle: () => void
	children?: ReactNode
	className?: string
	isActive?: boolean
}

export default function ToggleButton({
	onToggle,
	children,
	className = '',
	isActive = false,
}: ToggleButtonProps) {
	return (
		<button
			className={`btn-toggle block z-50 ${className} ${
				isActive ? 'opacity-80' : 'opacity-100'
			}`}
			onClick={onToggle}
		>
			{children}
		</button>
	)
}
