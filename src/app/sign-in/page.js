import GoogleSignIn from "../components/google-sign-in";

function SignInPage() {
  return (
    <div className="relative pt-10 md:pt-20 bg-transparent">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-[#CDE5FC]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#F7D7E2]/40 blur-3xl" />

      <div className="relative z-10 hidden min-h-[calc(100vh-84px)] grid-cols-2 items-center gap-10 px-6 md:grid lg:px-12 xl:px-20">
        <div className="flex flex-col items-start justify-center pl-4 lg:pl-16">
          <h1 className="text-[clamp(2.75rem,4vw,5rem)] font-bold tracking-tight text-black">
            Hello!
          </h1>
          <h2 className="text-[clamp(1.1rem,1.9vw,2rem)] font-normal text-[#6E808D]">
            Start your journey with us
          </h2>

          <div className="relative mt-10 h-[18vw] min-h-56 w-[22vw] min-w-[18rem] max-w-[30rem]">
            <img
              src="/onboarding/blueflower.svg"
              alt="Blue flower decoration"
              className="absolute left-[2vw] top-[2vw] h-[9vw] w-[10vw] min-h-24 min-w-28 max-h-40 max-w-44 transition-transform duration-500 ease-in-out hover:-rotate-90"
            />
            <img
              src="/onboarding/greenflower.svg"
              alt="Green flower decoration"
              className="absolute left-[12vw] top-0 h-[8vw] w-[9vw] min-h-20 min-w-24 max-h-36 max-w-40 transition-transform duration-500 ease-in-out hover:-rotate-90"
            />
            <img
              src="/onboarding/pinkflower.svg"
              alt="Pink flower decoration"
              className="absolute left-[8vw] top-[9vw] h-[8vw] w-[10vw] min-h-20 min-w-28 max-h-36 max-w-44 transition-transform duration-500 ease-in-out hover:-rotate-90"
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex w-full max-w-xl flex-col items-center rounded-[1.5rem] bg-white px-8 py-10 text-center shadow-[0_4px_32px_rgba(0,0,0,0.1)] ring-1 ring-black/5 lg:px-12 lg:py-14">
            <img
              src="/clubhouse-logo-mobile.svg"
              alt="Clubhouse logo"
              className="h-auto w-28 md:w-32 lg:w-36"
            />
            <h2 className="mt-6 text-[clamp(1.75rem,2.4vw,3rem)] font-bold tracking-tight text-black">
              Sign in to Clubhouse
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6E808D] md:text-base">
              To keep reviews accurate and trustworthy,
              <br />
              only verified UCLA students can contribute.
            </p>
            <div className="mt-8">
              <GoogleSignIn />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-84px)] items-center justify-center px-4 py-10 md:hidden">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <h1 className="text-[clamp(3rem,12vw,4.75rem)] font-bold tracking-tight text-black">
            Hello!
          </h1>
          <h2 className="mt-2 text-[clamp(1.15rem,4.2vw,1.5rem)] font-normal text-[#6E808D]">
            Start your journey with us
          </h2>

          <div className="relative mt-8 w-[min(82vw,22rem)]">
            <img
              src="/onboarding/blueflower.svg"
              alt="Blue flower decoration"
              className="absolute left-[-8vw] top-[-6vw] h-[18vw] w-[18vw] min-h-24 min-w-24 max-h-40 max-w-40 transition-transform duration-500 ease-in-out hover:-rotate-90"
            />
            <img
              src="/onboarding/greenflower.svg"
              alt="Green flower decoration"
              className="absolute bottom-[-6vw] right-[-4vw] h-[16vw] w-[16vw] min-h-20 min-w-20 max-h-36 max-w-36 transition-transform duration-500 ease-in-out hover:-rotate-90"
            />

            <div className="relative z-10 flex flex-col items-center rounded-[1.5rem] bg-white px-5 py-7 text-center shadow-[0_4px_32px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
              <img
                src="/clubhouse-logo-mobile.svg"
                alt="Clubhouse logo"
                className="mb-4 h-auto w-24"
              />
              <h2 className="text-[clamp(1.45rem,5.5vw,2rem)] font-bold tracking-tight text-black">
                Sign in to Clubhouse
              </h2>
              <p className="mt-3 max-w-xs text-[clamp(0.95rem,3.2vw,1rem)] leading-6 text-[#6E808D]">
                To keep reviews accurate and trustworthy, only verified UCLA students can contribute.
              </p>
              <div className="pb-2 pt-6">
                <GoogleSignIn />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;