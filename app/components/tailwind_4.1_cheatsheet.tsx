import tailwind41Cheatsheet from "./tailwind_4.1_cheatsheet.json";

export default function Tailwind41Cheatsheet() {
	return (
		<ul className="list-disc">
			{tailwind41Cheatsheet.map((item: { title: string; children: { title: string; url: string; description: string; table: { class: string; properties: string; value: string; }[]; }[]; }, index: number) => (
				<li key={index} className="list-disc">
					<h2 className="">{item.title}</h2>
					<ul>
						{item.children.map((child, childIndex) => (
							<li key={childIndex}>{
								// Displaying child title and description
								`${child.title}: ${child.description}`
							}</li>
						))}
					</ul>
				</li>
			))}
		</ul>
	);
}