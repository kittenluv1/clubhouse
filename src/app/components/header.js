"use client";

import React from 'react'
import SearchBar from './search-bar'
import Button from './button';
import LoginButton from './login-button';
import { supabase } from '../lib/db';

function Header() {

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
	<div className="flex p-5 px-20 h-20 w-full justify-between bg-blue-700">
		<Button value="BruinSphere" to="/"/>
		<SearchBar width="w-1/3" height="h-13"/>
		<Button value="Review a Club" onClick={attemptReview}/>
		<LoginButton/>
	</div>
  )
}

export default Header