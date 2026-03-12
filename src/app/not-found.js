import Button from "./components/button";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-full gap-6 px-4 text-center py-50">
			<h1 className="text-6xl font-bold">404</h1>
			<p className="text-xl text-gray-500">Sorry, this page does not exist.</p>
			<Button href="/" type="CTA">
				Go home
			</Button>
		</div>
	);
}
