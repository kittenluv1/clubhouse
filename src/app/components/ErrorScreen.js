function ErrorScreen({error}) {
    return (
        <div className="w-full min-h-[100vh]">
            <div className="flex justify-center items-center text-3xl pt-10">
                <p className="p-4 text-red-500">{error}</p>
            </div>
        </div>
    )
};

export default ErrorScreen;