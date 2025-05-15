"use client";

import { useRouter } from 'next/navigation';

// must pass in either a to or onClick prop
// if none are passed in, redirect to "/"
function Button({
  value = "Click Me",
  to = "/",
  onClick = null,
  border = false,
  avatarSrc = null, // New prop
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => (onClick ? onClick() : router.push(to))}
      className={`bg-white text-lg rounded-4xl p-3 self-center text-nowrap flex items-center gap-2 ${border ? "border border-black" : ""}`}
    >
      {avatarSrc && (
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
      {value}
    </button>
  );
}

export default Button;