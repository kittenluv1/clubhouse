"use client";

import { useRouter } from 'next/navigation';

function Button({ value, to }) {
	const router = useRouter();

	const handleClick = () => {
		router.push(to); // Replace '/your-route' with the desired path
	};


  return (
	/* this can probably be implemented with a <Link> because all it does is route */
	<button 
		onClick={handleClick}
		className="!bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1">
		{value}
	</button>
  )
}

export default Button