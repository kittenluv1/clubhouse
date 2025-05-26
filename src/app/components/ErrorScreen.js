function ErrorScreen({ error }) {
  return (
    <div className="min-h-[100vh] w-full">
      <div className="flex items-center justify-center pt-10 text-3xl">
        <p className="p-4 text-red-500">{error}</p>
      </div>
    </div>
  );
}

export default ErrorScreen;
