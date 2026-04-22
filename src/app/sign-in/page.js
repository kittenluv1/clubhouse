"use client";

import GoogleSignIn from "../components/google-sign-in";
import Button from "../components/button";
import { useState, useEffect } from "react";

function SignInPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", minHeight: "100vh", overflow: "hidden" }}>
      <img
        src="/signinbg.svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        aria-hidden="true"
      />

      {isMobile ? (
        // mobile :3
        <div style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "10vw 6vw 10vw",
          boxSizing: "border-box",
        }}>
          {/* top text */}
          <h1 style={{ fontSize: "9vw", fontWeight: "bold", color: "black", margin: "0 0 2vw 0", textAlign: "center" }}>
            Hello!
          </h1>
          <h2 style={{ fontSize: "4.5vw", color: "#6E808D", fontWeight: "normal", margin: "0 0 8vw 0", textAlign: "center" }}>
            Start your journey with us
          </h2>

          {/* flowers */}
          <div style={{ position: "relative", width: "80vw" }}>
            {/* blue flower */}
            <img
              src="/blueflower.svg" className="transition-transform duration-500 ease-in-out hover:-rotate-90"
              style={{ position: "absolute", left: "-8vw", top: "-6vw", width: "18vw", height: "18vw", zIndex: 2 }}
            />
            {/* green flower — bottom right */}
            <img
              src="/greenflower.svg" className="transition-transform duration-500 ease-in-out hover:-rotate-90"
              style={{ position: "absolute", right: "-4vw", bottom: "-6vw", width: "16vw", height: "16vw", zIndex: 2 }}
            />

            {/* white card */}
            <div style={{
              position: "relative",
              zIndex: 1,
              background: "white",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "4vw 2vw",
            }}>
              <img src="/clubhouse-logo-mobile.svg" style={{ width: "25vw", height: "auto", marginBottom: "3vw" }} />
              <h2 style={{ fontSize: "5.5vw", fontWeight: "bold", color: "black", margin: "0 0 2vw 0" }}>
                Sign in to Clubhouse
              </h2>
              <p style={{ fontSize: "3.2vw", color: "#6E808D", lineHeight: 1.6, marginBottom: "5vw" }}>
                To keep reviews accurate and trustworthy, only verified UCLA students can contribute.
              </p>
              <div style={{ paddingBottom: "8vw"}}>
                <GoogleSignIn />
              </div>
            </div>
          </div>
        </div>

      ) : (
        // desktop #big
        <div style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          width: "100vw",
          minHeight: "100vh",
          padding: "0 4vw",
          boxSizing: "border-box",
        }}>
          {/* left */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            paddingTop: "4vw",
            paddingLeft: "8vw",
          }}>
            <h1 style={{ fontSize: "4vw", fontWeight: "bold", color: "black", margin: 0 }}>
              Hello!
            </h1>
            <h2 style={{ fontSize: "2vw", color: "#6E808D", fontWeight: "normal", margin: 0 }}>
              Start your journey with us
            </h2>
            <div style={{ position: "relative", width: "22vw", height: "18vw", marginTop: "3vw" }}>
              <img src="/blueflower.svg" className="transition-transform duration-500 ease-in-out hover:-rotate-90"
                style={{ position: "absolute", left: "2vw", top: "2vw", width: "10vw", height: "9vw" }} />
              <img src="/greenflower.svg" className="transition-transform duration-500 ease-in-out hover:-rotate-90"
                style={{ position: "absolute", left: "12vw", top: "0", width: "9vw", height: "8vw" }} />
              <img src="/pinkflower.svg" className="transition-transform duration-500 ease-in-out hover:-rotate-90"
                style={{ position: "absolute", left: "8vw", top: "9vw", width: "10vw", height: "8vw" }} />
            </div>
          </div>

          {/* right */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "4vw",
          }}>
            <div style={{
              background: "white",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "38vw",
              padding: "5vw 4vw",
            }}>
              <img src="/clubhouse-logo-mobile.svg" style={{ width: "9vw", height: "auto" }} />
              <h2 style={{ fontSize: "2.4vw", fontWeight: "bold", color: "black", margin: "1.5vw 0 0.5vw" }}>
                Sign in to Clubhouse
              </h2>
              <p style={{ fontSize: "1vw", color: "#6E808D", lineHeight: 1.6, marginBottom: "2vw" }}>
                To keep reviews accurate and trustworthy,
                <br />
                only verified UCLA students can contribute.
              </p>
              <GoogleSignIn />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignInPage;