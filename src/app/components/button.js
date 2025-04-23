"use client";

import { useRouter } from 'next/navigation';

function Button({ value, to }) {
	const router = useRouter();

  return (
	/* this can probably be implemented with a <Link> because all it does is route */
	<button 
		onClick={() => router.push(to)}
		className="!bg-blue-700 !border-blue-600 text-white !text-lg !rounded-xl !py-1">
		{value}
	</button>
  )
}

export default Button