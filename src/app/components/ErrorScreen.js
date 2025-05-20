function ErrorScreen({error}) {
    return (
        <div className="w-full min-h-[100vh]">
            <div className="absolute top-0 left-0 h-5/6 w-full bg-[#DFEBFF] -z-10"/>
            <div className="absolute top-5/6 left-0 h-1/6 w-full bg-gradient-to-b from-[#DFEBFF] to-[#DFF1F1] -z-10"/>
            <div className="flex justify-center items-center text-3xl pt-10">
                <p className="p-4 text-red-500">{error}</p>
            </div>
        </div>
    )
};

export default ErrorScreen;