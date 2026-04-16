"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "../components/button";
import { useAuth } from "../context/AuthContext";

const Slider = dynamic(() => import("react-slick"), { ssr: false });
/*
position: absolute;
width: 28.97px;
height: 28.97px;
left: 120.02px;
top: 428.34px;

transform: rotate(-90deg);/

box-sizing: border-box;

position: absolute;
width: 31.51px;
height: 31.51px;
left: 119px;
top: 425.8px;

background: #EEF7FE;
border: 1px solid #A4CDED;
transform: matrix(-1, 0, 0, 1, 0, 0);
*/



function NextArrow(props) {
    const { className, style, onClick } = props;
    console.log(className);
    return (
        <button
            onClick={onClick}
            // className={`${className}`}
            className={'bg-gray-500  text-white border-2  text-lg px-1 py-1 rounded-xl' + `${className}`}

            style={{ ...style, display: "block", background: "#EEF7FE" }
            }
        //style={{ border: '1px solid #A4CDED;', background: "#EEF7FE;", borderRadius: "50%" }}
        >
            <svg
                className={`h-4 w-4 transition-transform rotate-270`}
                fill="none"
                stroke="currentColor"

                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button >
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <button
            onClick={onClick}
            className={`${className}`}
            style={{ ...style, display: "block", background: "#cb2b7e" }}
        //className='bg-btn btn-defaultgray-500  text-white border-2 border-black text-lg px-1 py-1 rounded-xl'
        >
            {/* <svg
                className={`h-4 w-4 transition-transform rotate-90`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg> */}
        </ button>
    );
}

function tempClubCard(d) {
    return (
        <div key={d.OrganizationName} className="bg-white h-[450px] text-black rounded-xl">
            <div className='h-56 bg-indigo-500 flex justify-center items-center rounded-t-xl'>
                <img src={d.img} alt="" className="h-44 w-44 rounded-full" />
            </div>

            <div className="flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-xl font-semibold">{d.OrganizationName}</p>
                <p className="text-center">{d.OrganizationDescription}</p>
                <button className='bg-indigo-500 text-white text-lg px-6 py-1 rounded-xl'>{d.Category1Name}</button>
                {d.Category2Name && <button className='bg-indigo-500 text-white text-lg px-6 py-1 rounded-xl'>{d.Category2Name}</button>}
            </div>
        </div>
    );
}

function ClubSlider() {
    const slider = React.useRef(null);
    const router = useRouter();
    const { user, loading } = useAuth();
    const [data, setData] = React.useState([]);
    const [fetchError, setFetchError] = React.useState(null);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        arrows: true,
        slidesToScroll: 3,
    };

    React.useEffect(() => {
        if (!user) {
            setData([]);
            setFetchError(null);
            return;
        }

        let cancelled = false;

        async function fetchRecommendations() {
            try {
                setFetchError(null);
                const res = await fetch("/api/recommendations");
                if (!res.ok) {
                    throw new Error(`Failed to fetch recommendations: HTTP ${res.status}`);
                }
                const json = await res.json();
                if (!cancelled) {
                    setData(Array.isArray(json?.recommendations) ? json.recommendations : []);
                }
            } catch (error) {
                if (!cancelled) {
                    setFetchError(error.message || "Failed to load recommendations.");
                    setData([]);
                }
                console.error("Error fetching recommendations:", error);
            }
        }

        fetchRecommendations();

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (loading) {
        return null;
    }

    if (!user) {
        return (
            <div className="w-3/4 m-auto">
                <h2 className="text-xl italic text-gray-500 md:text-2xl text-center">
                    Please sign in to see club recommendations.
                </h2>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="w-3/4 m-auto">
                <h2 className="text-xl font-bold text-black md:text-2xl flex-1 min-w-0 break-words">
                    Recommended Clubs
                </h2>
                <p className="mt-3 text-sm text-[#6E808D]">{fetchError}</p>
            </div>
        );
    }

    return (
        <div className='w-3/4 m-auto'>
            <h2 className="text-xl font-bold text-black md:text-2xl flex-1 min-w-0 break-words">
                Recommended Clubs
            </h2>
            <div className="row" >
                <div className="column left"><Button onClick={() => slider?.current?.slickPrev()} type="gray"
                    size="small">&lt;</Button></div>
                <div className="column middle slider-container mt-10 mb-10">
                    <Slider ref={slider} {...settings}>
                        {data.map((d) => (
                            tempClubCard(d)
                        ))}
                    </Slider>
                </div>
                <div className="column right"><Button onClick={() => slider?.current?.slickNext()} type="gray"
                    size="small">&gt;</Button>
                </div>
            </div>

        </div >
    );
}

//     const data = [
//         {
//             OrganizationName: `Creative Labs 1`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1",
//         },
//         {
//             OrganizationName: `Creative Labs 2`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1",
//         },
//         {
//             OrganizationName: `Creative Labs 3`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1",
//         },
//         {
//             OrganizationName: `Creative Labs 4`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1",
//         },
//         {
//             OrganizationName: `Creative Labs 5`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1"
//         },
//         {
//             OrganizationName: `Creative Labs 6`,
//             img: `../favicon.ico`,
//             rating: 5,
//             OrganizationDescription: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
//             Category1Name: "Category 1"
//         },
//     ];

export default ClubSlider;