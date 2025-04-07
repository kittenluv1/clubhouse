import React from 'react'
import SearchBar from './search-bar'
import Button from './button';
import { FaFaceDizzy } from "react-icons/fa6";

function Header() {
  return (
	<div className="flex p-5 px-20 h-20 w-full justify-between bg-blue-700">
		<Button value="BruinSphere" to="/"/>
		<SearchBar/>
		<Button value="Review a Club" to="/"/>
		<FaFaceDizzy className="text-white h-full w-auto"/>
	</div>
  )
}

export default Header