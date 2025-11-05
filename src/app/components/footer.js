"use client";
// import { usePathname } from "next/navigation";

export default function Footer() {
  // const pathname = usePathname();

  return (
    <>
      <footer className="flex w-full flex-col gap-8 bg-[#C4E1FC] p-15 pt-20 break-words md:py-10 lg:flex-row lg:justify-between lg:gap-12 lg:px-20 lg:py-15">
        {/* contact us */}
        <div className="w-full flex-1 md:px-10 md:py-10 lg:max-w-120 lg:py-20 lg:pl-10">
          <h3 className="mb-5 text-2xl font-bold">Contact Us</h3>
          <p>
            Have questions or feedback? Want to collaborate? The clubhouse
            community would love to hear from you, we’re here to help!
          </p>
          <br />
          <p>
            Contact us at{" "}
            <a
              href="mailto:clubhouseucla@gmail.com"
              target="_blank"
              className="underline"
            >
              clubhouseucla@gmail.com
            </a>
          </p>
        </div>
        {/* connect and bear */}
        {/* <div className="flex flex-1 flex-col justify-between md:flex-row"> */}
        <div className="py-10 md:px-10 lg:py-20">
          <h3 className="mb-5 text-2xl font-bold">Connect</h3>
          <div className="grid auto-cols-max grid-flow-col gap-2">
            <a href="https://www.instagram.com/clubhouseucla/" target="_blank">
              <img
                src="/instagram.svg"
                alt="instagram icon"
                className="inline-block w-8"
              />
            </a>
            <a
              href="https://www.linkedin.com/company/clubhouseucla/about/"
              target="_blank"
            >
              <img
                src="/linkedin.svg"
                alt="linkedin icon"
                className="inline-block w-8"
              />
            </a>
            <a href="https://www.tiktok.com/@clubhouseucla" target="_blank">
              <img
                src="/tiktok.svg"
                alt="tiktok icon"
                className="inline-block w-8"
              />
            </a>
            <a
              href="https://www.reddit.com/user/clubhouseucla/"
              target="_blank"
            >
              <img
                src="/reddit.svg"
                alt="reddit icon"
                className="inline-block w-8"
              />
            </a>
          </div>
        </div>
        {/* bear */}
        <div className="flex shrink-0 items-center justify-center md:py-10 lg:justify-end lg:p-0">
          <img src="/Bear.svg" alt="bear icon" />
        </div>
        {/* </div> */}
      </footer>
    </>
  );
}
