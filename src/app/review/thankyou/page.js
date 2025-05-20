"use client";

export default function ThankYouPage() {
  return (
    <div
      className="h-screen flex flex-col justify-center items-center">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="mb-4"
        style={{ filter: "drop-shadow(1px 2px 2px #bbb)" }}
      >
        <polygon
          points="190.0,100.0 142.8,113.9 172.8,152.9 126.5,136.4 127.8,185.6 100.0,145.0 72.2,185.6 73.5,136.4 27.2,152.9 57.2,113.9 10.0,100.0 57.2,86.1 27.2,47.1 73.5,63.6 72.2,14.4 100.0,55.0 127.8,14.4 126.5,63.6 172.8,47.1 142.8,86.1"
          fill="#f7d774"
          stroke="#222"
          strokeWidth="2"
        />
        <polyline
          points="70,100 90,120 130,80"
          fill="none"
          stroke="#222"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>


      <h1 className="text-6xl font-bold text-center mb-4">Thank you!</h1>
      <p className="text-4x1 font-semibold">Your review has been sent!</p>
    </div>
  );
}
