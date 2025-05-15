'use client'
import { usePathname } from "next/navigation"

export default function Footer() {
    const pathname = usePathname();

    return (
        <>
        <div>
            {pathname === "/" && <div className="mb-80"/>}
        </div>
        <footer className="bg-gray-200 h-auto py-15 px-30 mt-20 bg-gradient-to-b from-[#FFFFFF] to-[#DCE8FF] -z-10">
          <h3 className="text-lg mb-5">Have questions or feedback? Want to collaborate?</h3>
          <p>We’d love to hear from you!</p>
          <p>Whether you’re a student with suggestions, a club rep hoping to update your listing, or just curious about how we verify reviews — reach out anytime.</p>
          <br />
          <p>Email: clubhouseucla@gmail.com</p>
          <p>Instagram: INSTAGRAM</p>
          <p>LinkedIn: LINKEDIN</p>
          <br />
          <p>Let’s build a more transparent, connected UCLA community — together.</p>
        </footer>
        </>
    )
}