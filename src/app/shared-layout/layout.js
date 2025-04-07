import React from 'react'
import Header from '../components/header'

function Layout({ children }) {
  return (
	<div className="w-full">
		<Header/>
		<main>{children}</main>
	</div>
  )
}

export default Layout