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
	<>
		<div className="grid grid-cols-18 items-center w-full gap-4 pb-3 pt-8 bg-[#E0ECFD]">
			<div className="col-span-4 flex justify-center">
				<button
				onClick={() => (router.push("/"))}
				className={`p-3 self-center text-nowrap flex items-center gap-2`}
				>
					<img
					src={"/Logo Bar 2.png"}
					alt="ClubHouse Logo"
					className="object-cover"
					width="210"
					/>
				</button>
			</div>
			<div className="col-span-9">
				{pathname !== "/" && <SearchBar width="w-full" height="h-13"/>}
			</div>
			<div className="col-span-2 flex justify-center">
				<button
				onClick={attemptReview}
				className={`p-3 self-center text-nowrap flex items-center gap-2`}
				>
					Add a Review
				</button>
			</div>
			<div className="col-span-2 flex justify-center">
				<LoginButton/>
			</div>
		</div>
		<>{pathname !== "/" && <div className="border"/>}</>
	</>
  )
}

export default Header