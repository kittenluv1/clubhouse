"use client";

import React, { useState, useEffect } from 'react';

const CustomSlider = ({ 
  min = 1, 
  max = 5, 
  step = 0.5, 
  value, 
  onChange,
  lowLabel = "Low",
  highLabel = "High"
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
    <div className="w-full] py-2">
      <div className="relative mb-2">
        {/* Slider track */}
        <div className="absolute top-1/2 left-0 w-full h-4 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Filled portion */}
        <div 
          className="absolute top-1/2 left-0 h-3 bg-green-600 rounded-full transform -translate-y-1/2" 
          style={{ width: `${calculateFillPercentage()}%` }}
        ></div>
        
        {/* Thumb */}
        <div 
          className="absolute top-1/2 w-5 h-5 bg-white border border-gray-300 rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 z-10"
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
          className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-20"
        />
      </div>
      
      {/* Labels */}
      <div className="flex flex-col w-full mt-3">
        {/* Number markers with exact spacing */}
        <div className="relative w-full flex h-6">
          {steps.map((num) => {
            const percentage = ((num - min) / (max - min)) * 100;
            return (
              <div 
                key={num} 
                className="absolute flex flex-col items-center text-xs text-green-800"
                style={{ 
                  left: `${percentage}%`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                <span>{num}</span>
                {num === min && (
                  <span className="text-green-800 mt-2">{lowLabel}</span>
                )}
                {num === max && (
                  <span className="text-green-800 mt-2">{highLabel}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current value display */}
      <div className="text-center text-xs font-medium mt-4">
        {sliderValue.toFixed(1)}
      </div> 
    </div>
  );
};

export default CustomSlider;