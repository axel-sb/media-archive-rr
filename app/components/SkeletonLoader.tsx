interface SkeletonLoaderProps {
	className?: string
	variant?: 'text' | 'rectangular' | 'circular'
	width?: string
	height?: string
	lines?: number
}

export default function SkeletonLoader({ 
	className = '',
	variant = 'rectangular',
	width = 'w-full',
	height = 'h-4',
	lines = 1
}: SkeletonLoaderProps) {
	const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700'
	
	const variantClasses = {
		text: 'rounded',
		rectangular: 'rounded-md',
		circular: 'rounded-full',
	}

	if (variant === 'text' && lines > 1) {
		return (
			<div className={`space-y-2 ${className}`}>
				{Array.from({ length: lines }).map((_, index) => (
					<div
						key={index}
						className={`${baseClasses} ${variantClasses[variant]} ${width} ${height}`}
						style={{
							width: index === lines - 1 ? '75%' : '100%'
						}}
					/>
				))}
			</div>
		)
	}

	return (
		<div 
			className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
		/>
	)
}

// Gallery skeleton component
export function GallerySkeleton({ count = 12 }: { count?: number }) {
	return (
		<div className="grid w-full grid-cols-6 gap-2 text-base sm:grid-cols-9 md:grid-cols-12 md:gap-2 lg:grid-cols-12 lg:gap-2">
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className="aspect-square">
					<SkeletonLoader 
						variant="rectangular" 
						className="w-full h-full"
					/>
				</div>
			))}
		</div>
	)
}

// Search results skeleton
export function SearchResultsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<SkeletonLoader variant="text" width="w-48" height="h-6" />
				<SkeletonLoader variant="text" width="w-16" height="h-6" />
			</div>
			<GallerySkeleton count={18} />
		</div>
	)
}
