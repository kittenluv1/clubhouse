"use client";

import Button from "./components/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center h-full gap-6 px-4 text-center py-50 min-h-screen bg-gradient-to-t from-[#CDE5FC] to-[#FFFFFF]">
			<h1 className="text-6xl font-bold">404</h1>
			<p className="text-xl text-gray-500">Sorry, this page does not exist.</p>
			<Button type="CTA" onClick={() => router.push("/")}>
				Go home
			</Button>
		</div>
	);
}
