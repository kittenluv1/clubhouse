"use client";

import Button from "./components/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-t from-[#CDE5FC] to-[#FFFFFF] px-4 py-50 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-gray-500">Sorry, this page does not exist.</p>
      <Button type="CTA" onClick={() => router.push("/")}>
        Go home
      </Button>
    </div>
  );
}
