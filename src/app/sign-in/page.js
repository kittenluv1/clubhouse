import GoogleSignIn from "../components/google-sign-in";
import Button from "../components/button";

function SignInPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">      <img
      src="/signinbg.svg"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      aria-hidden="true"
    />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-64px)] px-6 md:px-30 gap-8 md:gap-0 py-12 md:py-0">
        {/* left */}
        <div className="flex flex-col justify-start flex-1 max-w-sm md:pr-10 text-center md:text-left md:self-start md:pt-20">
          <h1 className="text-4xl font-bold text-black mb-2">Hello!</h1>
          <h2 className="text-2xl font-semibold text-[#6E808D]">Start your journey with us</h2>

          <div className="relative w-70 h-64 mt-8">
            <img src="/blueflower.svg" className="absolute left-10 top-8 w-36 h-30" />
            <img src="/greenflower.svg" className="absolute left-45 top-0 w-30 h-26" />
            <img src="/pinkflower.svg" className="absolute left-35 top-33 w-36 h-26" />
          </div>
        </div>

        {/* right */}
        <div className="bg-white rounded-3xl shadow-md px-20 py-36 flex flex-col items-center text-center max-w-lg w-full">
          <h2 className="text-2xl font-bold text-black mb-2">
            Sign in or create your account
          </h2>
          <p className="text-sm text-[#6E808D] mb-8 leading-relaxed">
            To keep reviews accurate and trustworthy, only verified UCLA
            students can contribute.{" "}
          </p>

          <GoogleSignIn />
        </div>
      </div>
    </div>

  );
}

export default SignInPage;