"use client";

import React from 'react'
import SearchBar from './search-bar'
import Button from './button';
import LoginButton from './login-button';
import { supabase } from '../lib/db';
import { usePathname } from 'next/navigation';

function Header() {
  const pathname = usePathname(); 

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
	<div className="grid grid-cols-13 w-full gap-4 p-3">
		<div className="col-span-2 col-start-2 flex justify-center">
			<Button value="ClubHouse" to="/"/>
		</div>
		<div className="col-span-6">
			{pathname !== "/" && <SearchBar width="w-full" height="h-13"/>}
		</div>
		<div className="col-span-2 flex justify-center">
			<Button value="Review a Club" onClick={attemptReview}/>
		</div>
		<div className="flex justify-center">
			<LoginButton/>
		</div>
	</div>
  )
}

export default Header