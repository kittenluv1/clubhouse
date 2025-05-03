"use client";

import { useRouter } from 'next/navigation';

// must pass in either a to or onClick prop
// if none are passed in, redirect to "/"
function Button({ value = "Click Me", to = "/", onClick = null, border = false }) {
	const router = useRouter();

  return (
	<button 
		onClick={() => onClick ? onClick() : router.push(to)}
		className={`bg-white text-lg rounded-4xl p-3 self-center text-nowrap ${border ? "border border-black" : ""}`}>
		{value}
	</button>
  )
}

export default Button