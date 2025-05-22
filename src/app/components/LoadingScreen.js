import Gradient from "./gradient";

function LoadingScreen() {
    return (
        <div className="w-full min-h-screen flex justify-center items-center text-3xl relative">
            <Gradient/>
            <p>Loading...</p>
        </div>
    )
};

export default LoadingScreen;