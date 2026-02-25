import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

    return (
        <button
            onClick={onClick}
            className={`${className}`}
            // className='bg-gray-500  text-white border-2  text-lg px-1 py-1 rounded-xl'className={`${className}`}
            style={{ ...style, display: "block", background: "red" }}
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
        </button>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <button
            onClick={onClick}
            className={`${className}`}
            style={{ ...style, display: "block", background: "red" }}
        //className='bg-btn btn-defaultgray-500  text-white border-2 border-black text-lg px-1 py-1 rounded-xl'
        >
            <svg
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
            </svg>
        </ button>
    );
}

function tempClubCard(d) {
    return (
        <div key={d.name} className="bg-white h-[450px] text-black rounded-xl">
            <div className='h-56 bg-indigo-500 flex justify-center items-center rounded-t-xl'>
                <img src={d.img} alt="" className="h-44 w-44 rounded-full" />
            </div>

            <div className="flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-xl font-semibold">{d.name}</p>
                <p className="text-center">{d.description}</p>
                <button className='bg-indigo-500 text-white text-lg px-6 py-1 rounded-xl'>{d.categories[0]}</button>
            </div>
        </div>
    );
}

function ClubSlider() {
    const settings = {
        //dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        arrows: true,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,

    };
    return (

        <div className='w-3/4 m-auto'>
            <h2 className="text-xl font-bold text-black md:text-2xl flex-1 min-w-0 break-words">
                Club Recommendations
            </h2>
            <div className="slider-container mt-10 mb-10">
                <Slider {...settings}>
                    {data.map((d) => (
                        tempClubCard(d)
                    ))}
                </Slider>
            </div>

        </div>
    );
}

const data = [
    {
        name: `Creative Labs 1`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
    {
        name: `Creative Labs 2`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
    {
        name: `Creative Labs 3`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
    {
        name: `Creative Labs 4`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
    {
        name: `Creative Labs 5`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
    {
        name: `Creative Labs 6`,
        img: `../favicon.ico`,
        rating: 5,
        description: "We are a community of UCLA creatives working on cool projects to discover even cooler passions.",
        categories: ["Categories", "Categories"]
    },
];

export default ClubSlider;