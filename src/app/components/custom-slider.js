import "../../../src/app/ratingSlider.css";

const CustomSlider = ({
  min = 1,
  max = 5,
  step = 0.5,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
}) => {
  // slider does not maintain its own state; instead, when the slider value changes, the parent component updates the state and passes the updated value back to this component.
  const sliderValue = value;

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
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
        <div className="absolute top-1/2 left-0 h-4 w-full -translate-y-1/2 transform rounded-full bg-[#E5EBF1]"></div>

        {/* Filled portion */}
        <div
          className="absolute top-1/2 left-0 h-4 -translate-y-1/2 transform rounded-full bg-[#B8DF64]"
          style={{ width: `${calculateFillPercentage()}%` }}
        ></div>

        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8DF64] shadow-md"
          style={{ left: `${calculateFillPercentage()}%` }}
        ></div>

        {/* Range input  */}
        <input
          id="sliderStyling"
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          className="absolute top-1/2 left-0 z-20 h-8 w-full -translate-y-1/2 cursor-pointer opacity-0"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Labels */}
      <div className="mt-8 flex w-full flex-col">
        {/* Number markers with exact spacing */}
        <div className="relative flex h-6 w-full">
          {steps.map((num) => {
            const percentage = ((num - min) / (max - min)) * 100;
            return (
              <div
                key={num}
                className="absolute flex flex-col items-center text-xs text-[#6E808D]"
                style={{
                  left: `${percentage}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span>{num}</span>
                {num === min && (
                  <span className="mt-2 text-[#6E808D]">{lowLabel}</span>
                )}
                {num === max && (
                  <span className="mt-2 text-[#6E808D]">{highLabel}</span>
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
