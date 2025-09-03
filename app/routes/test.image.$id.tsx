import { Link } from 'react-router'
import type { Route } from './+types/test.image.$id'
import { images } from './test.gallery'

export default function Image({ params }: Route.ComponentProps) {
	return (
		<div className="image-detail">
			<Link to="./test.gallery" viewTransition>
				Back to Test Gallery
			</Link>
			<h1>Image Number {params.id}</h1>
			<img src={images[Number(params.id)]} alt="" />
		</div>
	)
}
