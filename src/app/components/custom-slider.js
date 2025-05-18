import React, { useState, useEffect } from 'react';

const CustomSlider = ({ 
  min = 1, 
  max = 5, 
  step = 0.1, 
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

  return (
    <div className="w-full py-2">
      <div className="relative w-full mb-2">
        {/* Slider track */}
        <div className="absolute top-1/2 left-0 w-full h-4 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Filled portion */}
        <div 
          className="absolute top-1/2 left-0 h-3 bg-green-800 rounded-full transform -translate-y-1/2" 
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
      <div className="flex w-full text-xs mt-3">
        {/* Number labels */}
        <div className="flex justify-between w-full text-green-800">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-col items-center ">
              <span>{num}</span>
              {num === 1 && (
                <span className="text-green-800 mt-2">{lowLabel}</span>
              )}
              {num === 5 && (
                <span className="text-green-800 mt-2">{highLabel}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      
       <div className="text-center text-xs font-medium mt-1">
        {sliderValue.toFixed(1)}
      </div> 
    </div>
  );
};

export default CustomSlider;