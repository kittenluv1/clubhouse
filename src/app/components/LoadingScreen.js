import Gradient from "./gradient";

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white text-3xl">
      <Gradient />
      <p className="z-10">Loading...</p>
    </div>
  );
}

export default LoadingScreen;
