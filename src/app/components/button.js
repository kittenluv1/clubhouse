"use client";

import { useRouter } from "next/navigation";

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
      className={`flex items-center gap-2 self-center rounded-4xl bg-white p-3 text-lg text-nowrap ${border ? "border border-black" : ""}`}
    >
      {avatarSrc && (
        <img
          src={avatarSrc}
          alt="Avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
      )}
      {value}
    </button>
  );
}

export default Button;
