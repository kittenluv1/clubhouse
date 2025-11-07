import GoogleSignIn from "../components/google-sign-in";

function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center p-30">
      <img
        src="/envelope.png"
        className="mb-6 align-middle leading-none w-25"
      />
      <h2 className="mb-4 text-center text-4xl font-bold">
        Sign in with your UCLA email
      </h2>
      <p className="font-medium text-[#6E808D] mb-10">
        To keep reviews accurate and trustworthy, only verified UCLA students can contribute. <br />
        While your name will remain anonymous, we securely store your email to help protect against spam and misuse. <br />
        We take community integrity seriously — every review helps build a reliable resource for Bruins, by Bruins.
      </p>
      <div className="h-10 flex-none">
        <GoogleSignIn />
      </div>
    </div>
  );
}

export default SignInPage;
