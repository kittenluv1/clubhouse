import Gradient from "./gradient";

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-t from-[#CDE5FC] to-[#FFFFFF] text-3xl">
      <p className="z-10">Loading...</p>
    </div>
  );
}

export default LoadingScreen;
