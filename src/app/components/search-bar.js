"use client";

import { useState } from 'react';
import React from 'react'

// function SearchBar({ width, height }) {
// 	const [value, setValue] = useState('');

//   return (
// 	<input 
// 		type="text" 
// 		placeholder="Search for a club"
// 		value={value}
// 		onChange={e => setValue(e.target.value)}
// 		className={`border-2 border-blue-400 bg-white text-black rounded-3xl p-1 pl-4 ${width} ${height}`}>
// 	</input>
//   )
// }

function SearchBar({ width, height, value, onChange }) {
	return (
	  <input
		type="text"
		placeholder="Search for a club"
		value={value}
		onChange={onChange}
		className={`border-2 border-blue-400 bg-white text-black rounded-3xl p-1 pl-4 ${width} ${height}`}
	  />
	);
  }

export default SearchBar