"use client";

import React from 'react'
import SearchBar from './search-bar'
import SearchableDropdown from './searchable-dropdown';
import Button from './button';
import LoginButton from './login-button';

function Header() {
  return (
	<div className="flex p-5 px-20 h-20 w-full justify-between bg-blue-700">
		<Button value="BruinSphere" to="/"/>
		<SearchBar width="w-1/3" height="h-13"/>
		<Button value="Review a Club" to="/review"/>
		<LoginButton/>
	</div>
  )
}

export default Header