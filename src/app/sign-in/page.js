import GoogleSignIn from "../components/google-sign-in";

function SignInPage() {
  return (
    <div className="flex h-135 flex-col items-center justify-center p-10 text-center lg:p-30">
      <h2 className="my-6 text-3xl">
        Sign in with your UCLA email to leave a club review!
      </h2>
      <p>
        To keep reviews accurate and trustworthy, only verified UCLA students
        can contribute.
      </p>
      <p>
        While your name will remain anonymous, we securely store your email to
        help protect against spam and misuse.{" "}
      </p>
      <p>
        We take community integrity seriously — every review helps build a
        reliable resource for Bruins, by Bruins.
      </p>
      <div className="0 my-10 h-10 flex-none">
        <GoogleSignIn />
      </div>
      <MobileNavbar />
    </div>
  );
}

export default SignInPage;
