"use client";

import Google from '../components/google-sign-in'

function SignInPage() {

  return (
    <div>
      <h2 className="text-2xl my-5">Sign in with your UCLA email to leave a club review!</h2>
      <p className="my-3">To keep reviews accurate and trustworthy, only verified UCLA students can contribute. 
While your name will remain anonymous we securely store your email to help protect against spam and misuse. 
We take community integrity seriously — every review helps build a reliable resource for Bruins, by Bruins.</p>
      <Google />
    </div>
  )
}

export default SignInPage