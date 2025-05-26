function LoadingScreen() {
    return (
        <div className="w-full min-h-screen flex justify-center items-center text-3xl relative bg-white">
            <div className="absolute top-0 left-0 h-3/5 w-full bg-gradient-to-b from-[#DFEBFF] to-[#FFFFFF]"/>
            <div className="absolute bottom-0 h-1/5 w-full bg-gradient-to-t from-[#DFF1F1] to-[#FFFFFF]"/>
            <p className="z-10">Loading...</p>
        </div>
    )
};

export default LoadingScreen;