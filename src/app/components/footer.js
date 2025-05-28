"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* <div className="border"/> */}
      <footer className="h-auto overflow-hidden bg-[#DFF1F1] p-15 break-words lg:px-30 lg:py-15">
        <h3 className="mb-5 text-lg">
          Have questions or feedback? Want to collaborate?
        </h3>
        <p>We’d love to hear from you!</p>
        <p>
          Whether you’re a student with suggestions, a club rep hoping to update
          your listing, or just curious about how we verify reviews — reach out
          anytime.
        </p>
        <br />
        <a href="mailto:clubhouseucla@gmail.com" target="_blank">
          <img src="/email.svg" alt="email icon" className="inline-block w-6" />
          &nbsp;clubhouseucla@gmail.com
        </a>
        <br />
        <a href="https://www.instagram.com/clubhouseucla/" target="_blank">
          <img
            src="/instagram.svg"
            alt="instagram icon"
            className="inline-block w-6"
          />
          &nbsp;@clubhouseucla
        </a>
        <br />
        <a
          href="https://www.linkedin.com/company/clubhouseucla/about/"
          target="_blank"
        >
          <img
            src="/linkedin.svg"
            alt="linkedin icon"
            className="inline-block w-6"
          />
          &nbsp;LinkedIn
        </a>
        <br />
        <br />
        <p>
          Let’s build a more transparent, connected UCLA community — together.
        </p>
      </footer>
    </>
  );
}
