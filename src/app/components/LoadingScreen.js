import Gradient from "./gradient";

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center text-3xl bg-gradient-to-t from-[#CDE5FC] to-[#FFFFFF]">
      <p className="z-10">Loading...</p>
    </div>
  );
}

export default LoadingScreen;
