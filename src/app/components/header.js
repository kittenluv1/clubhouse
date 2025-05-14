"use client";

import React from 'react'
import SearchBar from './search-bar'
import Button from './button';
import { useRouter } from 'next/navigation';
import LoginButton from './login-button';
import { supabase } from '../lib/db';
import { usePathname } from 'next/navigation';

function Header() {
  const pathname = usePathname(); 
  const router = useRouter();

  const attemptReview = async () => {
	// check if user is logged in
	// if not, redirect to sign in page
	// else, redirect to review page
	const { data: { session} } = await supabase.auth.getSession();

	if (session) {
	  console.log("GO TO REVIEWS", session);
	  window.location.href = "/review";
	} else {
	  console.log("GO TO SIGN IN", session);
	  window.location.href = "/sign-in"; 
	}
  }

  return (
	<div className="grid grid-cols-13 w-full gap-4 p-3 bg-[#E0ECFD] border-b-2 border-[#272727]">
		<div className="col-span-2 col-start-2 flex justify-center mt-8 mb-4">
			<button
			onClick={() => (router.push("/"))}
			className={`p-3 self-center text-nowrap flex items-center gap-2`}
			>
				<img
				src={"/ClubHouse Logo.png"}
				alt="ClubHouse Logo"
				className="object-cover"
				/>
			</button>
		</div>
		<div className="col-span-6 mt-8 mb-4">
			{pathname !== "/" && <SearchBar width="w-full" height="h-13"/>}
		</div>
		<div className="col-span-2 flex justify-center mt-8 mb-4">
			<Button value="Review a Club" onClick={attemptReview}/>
		</div>
		<div className="flex justify-center mt-8 mb-4">
			<LoginButton/>
		</div>
	</div>
  )
}

export default Header