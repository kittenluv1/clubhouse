import React from 'react'
import Header from '../components/header'

function Layout({ children }) {
  return (
	<div className="flex flex-col min-h-screen">
		<Header/>
		<main className="grow">{children}</main>
		<footer className="bg-gray-200 h-auto py-15 px-30">
			<h3 className="text-lg mb-5">Have questions or feedback? Want to collaborate?</h3>
			<p>We’d love to hear from you!</p>
			<p>Whether you’re a student with suggestions, a club rep hoping to update your listing, or just curious about how we verify reviews — reach out anytime.</p>
			<br/>
			<p>Email: clubhouseucla@gmail.com</p>
			<p>Instagram: INSTAGRAM</p>
			<p>LinkedIn: LINKEDIN</p>
			<br/>
			<p>Let’s build a more transparent, connected UCLA community — together.</p>
		</footer>
	</div>
  )
}

export default Layout