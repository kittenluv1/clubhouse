function ErrorScreen({ error }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white text-3xl">
      <div className="absolute top-0 left-0 h-3/5 w-full bg-gradient-to-b from-[#DFEBFF] to-[#FFFFFF]" />
      <div className="absolute bottom-0 h-1/5 w-full bg-gradient-to-t from-[#DFF1F1] to-[#FFFFFF]" />
      <p className="z-10">Error: {error}</p>
    </div>
  );
}

export default ErrorScreen;
