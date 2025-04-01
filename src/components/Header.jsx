import React from 'react'
import logo from './../assets/react.svg'
import SearchBar from './SearchBar'
import { FaFaceDizzy } from "react-icons/fa6";

function Header() {
  return (
	<div className="flex p-5 px-20 h-20 w-full justify-between bg-blue-700">
		<FaFaceDizzy className="text-white h-full w-auto"/>
		<SearchBar/>
	</div>
  )
}

export default Header