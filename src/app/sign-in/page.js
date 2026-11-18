import GoogleSignIn from "../components/google-sign-in";

const Intro = () => (
  <>
    <h1 className="text-[clamp(2.75rem,4vw,5rem)] font-bold tracking-tight text-black">
      Hello!
    </h1>
    <h2 className="text-[clamp(1.1rem,1.9vw,2rem)] font-normal text-[#6E808D]">
      Start your journey with us
    </h2>
  </>
);

const Decorations = () => (
  <>
    <img
      src="/onboarding/blueflower.svg"
      alt="Blue flower decoration"
      className="absolute top-[2vw] left-[2vw] h-[9vw] max-h-40 min-h-24 w-[10vw] max-w-44 min-w-28 transition-transform duration-500 ease-in-out hover:-rotate-90 max-md:top-[-6vw] max-md:left-[-8vw] max-md:h-[18vw] max-md:max-h-40 max-md:min-h-24 max-md:w-[18vw] max-md:max-w-40 max-md:min-w-24"
    />
    <img
      src="/onboarding/greenflower.svg"
      alt="Green flower decoration"
      className="absolute top-0 left-[12vw] h-[8vw] max-h-36 min-h-20 w-[9vw] max-w-40 min-w-24 transition-transform duration-500 ease-in-out hover:-rotate-90 max-md:top-auto max-md:right-[-4vw] max-md:bottom-[-6vw] max-md:left-auto max-md:h-[16vw] max-md:max-h-36 max-md:min-h-20 max-md:w-[16vw] max-md:max-w-36 max-md:min-w-20"
    />
    <img
      src="/onboarding/pinkflower.svg"
      alt="Pink flower decoration"
      className="absolute top-[9vw] left-[8vw] h-[8vw] max-h-36 min-h-20 w-[10vw] max-w-44 min-w-28 transition-transform duration-500 ease-in-out hover:-rotate-90 max-md:hidden"
    />
  </>
);

const SignInCard = () => (
  <div className="relative z-10 flex w-full max-w-xl flex-col items-center rounded-3xl bg-white px-5 py-7 text-center shadow-[0_4px_32px_rgba(0,0,0,0.1)] ring-1 ring-black/5 md:px-8 md:py-10 lg:px-12 lg:py-14">
    <img
      src="/clubhouse-logo-mobile.svg"
      alt="Clubhouse logo"
      className="mb-4 h-auto w-24 md:mb-0 md:w-32 lg:w-36"
    />
    <h2 className="mt-0 text-[clamp(1.45rem,5.5vw,2rem)] font-bold tracking-tight text-black md:mt-6 md:text-[clamp(1.75rem,2.4vw,3rem)]">
      Sign in to Clubhouse
    </h2>
    <p className="mt-3 max-w-md text-[clamp(0.95rem,3.2vw,1rem)] leading-6 text-[#6E808D] md:text-base">
      To keep reviews accurate and trustworthy,{" "}
      <span className="lg:block">
        only verified UCLA students can contribute.
      </span>
    </p>
    <div className="pt-6 pb-2 md:mt-8 md:p-0">
      <GoogleSignIn />
    </div>
  </div>
);

function SignInPage() {
  return (
    <div className="relative bg-transparent pt-10 md:pt-20">
      <div className="pointer-events-none absolute top-16 -left-20 h-64 w-64 rounded-full bg-[#CDE5FC]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#F7D7E2]/40 blur-3xl" />
      <div className="relative z-10 flex min-h-[calc(100vh-84px)] flex-col items-center justify-center px-4 py-10 md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-6 lg:px-12 xl:px-20">
        <div className="flex w-full max-w-sm flex-col items-center text-center md:max-w-none md:items-start md:pl-4 md:text-left lg:pl-16">
          <Intro />
          <div className="relative mt-8 h-[18vw] min-h-56 w-[min(82vw,22rem)] max-w-120 min-w-[18rem] max-md:hidden md:mt-10 md:w-[22vw]">
            <Decorations />
          </div>
        </div>
        <div className="flex w-full max-w-sm items-center justify-center md:max-w-none">
          <div className="relative w-full">
            <div className="absolute inset-x-0 -inset-y-8 md:hidden">
              <Decorations />
            </div>
            <SignInCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
