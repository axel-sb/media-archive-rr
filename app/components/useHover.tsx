import React, { useEffect } from 'react'

export function useHover() {
	const [isHovering, setIsHovering] = React.useState(false)
	const ref = React.useRef<HTMLElement>(null)

	const handleMouseOver = () => setIsHovering(true)
	const handleMouseOut = () => setIsHovering(false)

	useEffect(() => {
		const node = ref.current
		if (node) {
			node.addEventListener('mouseover', handleMouseOver)
			node.addEventListener('mouseout', handleMouseOut)
			return () => {
				node.removeEventListener('mouseover', handleMouseOver)
				node.removeEventListener('mouseout', handleMouseOut)
			}
		}
	}, []) // Changed to empty dependency array

	return [ref, isHovering]
}
