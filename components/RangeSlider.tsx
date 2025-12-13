import React, { useCallback, useEffect, useState, useRef } from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    step: number;
    values: { minVal: number, maxVal: number };
    onChange: (values: { minVal: number, maxVal: number }) => void;
    unit?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step, values, onChange, unit }) => {
    const { minVal, maxVal } = values;
    const range = useRef<HTMLDivElement>(null);

    const [minInputVal, setMinInputVal] = useState(minVal.toString());
    const [maxInputVal, setMaxInputVal] = useState(maxVal.toString());

    const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

    useEffect(() => {
        if (parseFloat(minInputVal) !== minVal) {
            setMinInputVal(minVal.toString());
        }
        if (parseFloat(maxInputVal) !== maxVal) {
            setMaxInputVal(maxVal.toString());
        }
    }, [minVal, maxVal, minInputVal, maxInputVal]);


    const handleMinSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(event.target.value), maxVal - step);
        onChange({ minVal: value, maxVal });
    };

    const handleMaxSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(event.target.value), minVal + step);
        onChange({ minVal, maxVal: value });
    };
    
    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMinInputVal(e.target.value);
        const numericVal = parseFloat(e.target.value);
        if (!isNaN(numericVal) && numericVal >= min && numericVal <= maxVal) {
            onChange({ minVal: numericVal, maxVal: maxVal });
        }
    };
    
    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxInputVal(e.target.value);
        const numericVal = parseFloat(e.target.value);
        if (!isNaN(numericVal) && numericVal <= max && numericVal >= minVal) {
            onChange({ minVal: minVal, maxVal: numericVal });
        }
    };
    
    const stepMin = (direction: 'up' | 'down') => {
        const newValue = parseFloat((minVal + (direction === 'up' ? step : -step)).toPrecision(15));
        if (newValue >= min && newValue <= maxVal) {
            onChange({ minVal: newValue, maxVal });
        }
    };
    
    const stepMax = (direction: 'up' | 'down') => {
        const newValue = parseFloat((maxVal + (direction === 'up' ? step : -step)).toPrecision(15));
        if (newValue <= max && newValue >= minVal) {
            onChange({ minVal, maxVal: newValue });
        }
    };
    
    const InputWithSteppers = ({ value, onInputChange, onStep, unitLabel }: { value: string, onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onStep: (d: 'up'|'down') => void, unitLabel?: string }) => (
        <div className="flex items-center w-[8.5rem] bg-gray-100 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <input
                type="number"
                value={value}
                onChange={onInputChange}
                step={step}
                className="w-full bg-transparent py-1.5 pl-3 pr-1 text-gray-800 font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-gray-500 font-sans text-sm pr-1">{unitLabel}</span>
            <div className="flex flex-col border-l border-gray-300 h-full">
                <button type="button" onClick={() => onStep('up')} className="h-5 w-6 text-gray-600 hover:text-black rounded-tr-md flex items-center justify-center text-xs hover:bg-gray-200" aria-label="Increase">▲</button>
                <button type="button" onClick={() => onStep('down')} className="h-5 w-6 text-gray-600 hover:text-black rounded-br-md flex items-center justify-center text-xs hover:bg-gray-200" aria-label="Decrease">▼</button>
            </div>
        </div>
    );
    
    return (
        <div>
            <div className="relative h-5 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    onChange={handleMinSliderChange}
                    className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-10 slider-thumb"
                    style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    onChange={handleMaxSliderChange}
                    className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none slider-thumb"
                    style={{ zIndex: 4 }}
                />

                <div className="relative w-full h-1">
                    <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
                    <div
                        ref={range}
                        className="absolute h-1 bg-blue-500 rounded-full"
                        style={{ left: `${getPercent(minVal)}%`, right: `${100 - getPercent(maxVal)}%` }}
                    />
                </div>
            </div>
             <style>{`
                .slider-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background-color: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                    margin-top: -9px;
                }
                .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background-color: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                }
            `}</style>
            <div className="flex justify-between items-center mt-3">
                <InputWithSteppers value={minInputVal} onInputChange={handleMinInputChange} onStep={stepMin} unitLabel={unit} />
                <div className="text-gray-400 font-semibold">-</div>
                <InputWithSteppers value={maxInputVal} onInputChange={handleMaxInputChange} onStep={stepMax} unitLabel={unit} />
            </div>
        </div>
    );
};

export default RangeSlider;
