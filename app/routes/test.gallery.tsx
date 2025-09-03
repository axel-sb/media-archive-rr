import { NavLink } from 'react-router'

export const images = [
	'https://remix.run/blog-images/headers/the-future-is-now.jpg',
	'https://remix.run/blog-images/headers/waterfall.jpg',
	'https://remix.run/blog-images/headers/webpack.png',
	'https://remix.run/blog-images/headers/remix-conf.jpg',
	// ... more images ...
]

export default function Gallery() {
	return (
		<div className="image-list">
			<h1>Test Gallery</h1>
			<div>
				{images.map((src, idx) => (
					<NavLink
						key={src}
						to={`/test.image/${idx}`}
						viewTransition // Enable view transitions for this link
					>
						<p>Image Number {idx}</p>
						<img className="max-w-full contain-layout" src={src} alt="" />
					</NavLink>
				))}
			</div>
		</div>
	)
}


/* Advanced Usage
You can control view transitions more precisely using either render props or the useViewTransitionState hook.

1. Using render props

<NavLink to={`/image/${idx}`} viewTransition>
  {({ isTransitioning }) => (
    <>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "none",
        }}
      >
        Image Number {idx}
      </p>
      <img
        src={src}
        style={{
          viewTransitionName: isTransitioning
            ? "image-expand"
            : "none",
        }}
      />
    </>
  )}
</NavLink>

2. Using the useViewTransitionState hook

function NavImage(props: { src: string; idx: number }) {
  const href = `/image/${props.idx}`;
  // Hook provides transition state for specific route
  const isTransitioning = useViewTransitionState(href);

  return (
    <Link to={href} viewTransition>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "none",
        }}
      >
        Image Number {props.idx}
      </p>
      <img
        src={props.src}
        style={{
          viewTransitionName: isTransitioning
            ? "image-expand"
            : "none",
        }}
      />
    </Link>
  );
}
*/
