"use client";

import React, { useState, useEffect } from "react";
import '../../../src/app/ratingSlider.css';
const CustomSlider = ({
  min = 1,
  max = 5,
  step = 0.5,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  const calculateFillPercentage = () => {
    return ((sliderValue - min) / (max - min)) * 100;
  };

  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="w-full py-2">
      <div className="relative mb-2">
        {/* Slider track */}
        <div className="absolute top-1/2 left-0 h-4 w-full -translate-y-1/2 transform rounded-full bg-gray-200"></div>

        {/* Filled portion */}
        <div
          className="absolute top-1/2 left-0 h-3 -translate-y-1/2 transform rounded-full bg-[#74C476]"
          style={{ width: `${calculateFillPercentage()}%` }}
        ></div>

        {/* Thumb */}
        <div
          className="absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-gray-300 bg-white shadow-md"
          style={{ left: `${calculateFillPercentage()}%` }}
        ></div>
        

        {/* Range input  */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          className="absolute top-0 left-0 z-20 h-0 w-full cursor-pointer opacity-0"
          id="sliderStyling"
        />
      </div>

      {/* Labels */}
      <div className="mt-3 flex w-full flex-col">
        {/* Number markers with exact spacing */}
        <div className="relative flex h-6 w-full">
          {steps.map((num) => {
            const percentage = ((num - min) / (max - min)) * 100;
            return (
              <div
                key={num}
                className="absolute flex flex-col items-center text-xs text-green-800"
                style={{
                  left: `${percentage}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span>{num}</span>
                {num === min && (
                  <span className="mt-2 text-green-800">{lowLabel}</span>
                )}
                {num === max && (
                  <span className="mt-2 text-green-800">{highLabel}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current value display */}
      <div className="mt-4 text-center text-xs font-medium">
        {sliderValue.toFixed(1)}
      </div>
    </div>
  );
};

export default CustomSlider;
