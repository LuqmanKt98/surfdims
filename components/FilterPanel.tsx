
import React from 'react';
import { FilterState, Condition, FinSystem, FinSetup } from '../types';
import { FIN_SYSTEMS_OPTIONS, FIN_SETUP_OPTIONS, SLIDER_RANGES } from '../constants';
import { COUNTRIES } from '../countries';
import XIcon from './icons/XIcon';
import RangeSlider from './RangeSlider';
import HeartIcon from './icons/HeartIcon';
import CalculatorIcon from './icons/CalculatorIcon';

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClose: () => void;
    onSaveSearch: () => void;
    isLoggedIn: boolean;
    isVerified: boolean;
    onOpenVolumeCalculator: () => void;
}

const FilterInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClose, onSaveSearch, isLoggedIn, isVerified, onOpenVolumeCalculator }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleDimensionChange = (
        minField: keyof FilterState,
        maxField: keyof FilterState,
        values: { minVal: number; maxVal: number }
    ) => {
        onFilterChange({
            ...filters,
            [minField]: values.minVal,
            [maxField]: values.maxVal,
        });
    };


    const handleReset = () => {
        onFilterChange({
            ...filters,
            brand: '',
            finSystem: 'All',
            finSetup: 'All',
            minLength: SLIDER_RANGES.length.min,
            maxLength: SLIDER_RANGES.length.max,
            minWidth: SLIDER_RANGES.width.min,
            maxWidth: SLIDER_RANGES.width.max,
            minThickness: SLIDER_RANGES.thickness.min,
            maxThickness: SLIDER_RANGES.thickness.max,
            minVolume: SLIDER_RANGES.volume.min,
            maxVolume: SLIDER_RANGES.volume.max,
        });
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                    <button 
                        onClick={handleReset} 
                        className="text-sm text-blue-600 italic hover:underline focus:outline-none"
                    >
                        Reset
                    </button>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 lg:hidden">
                    <XIcon />
                </button>
            </div>
            <div className="space-y-6">
                <FilterInput label="Keyword/s">
                    <input type="text" name="brand" value={filters.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]" />
                </FilterInput>

                <FilterInput label="Country">
                    <select name="country" value={filters.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                        <option value="All">All Countries</option>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                </FilterInput>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <p className="block text-sm font-medium text-gray-600">Volume (Litres)</p>
                        <button
                            onClick={onOpenVolumeCalculator}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 focus:outline-none"
                        >
                            <CalculatorIcon className="h-3 w-3" />
                            Vol Calculator
                        </button>
                    </div>
                    <RangeSlider
                        min={SLIDER_RANGES.volume.min}
                        max={SLIDER_RANGES.volume.max}
                        step={SLIDER_RANGES.volume.step}
                        values={{ minVal: filters.minVolume, maxVal: filters.maxVolume }}
                        onChange={(values) => handleDimensionChange('minVolume', 'maxVolume', values)}
                        unit="L"
                    />
                </div>
                
                 <div className="space-y-2">
                    <p className="block text-sm font-medium text-gray-600">Length (Feet)</p>
                     <RangeSlider
                        min={SLIDER_RANGES.length.min}
                        max={SLIDER_RANGES.length.max}
                        step={SLIDER_RANGES.length.step}
                        values={{ minVal: filters.minLength, maxVal: filters.maxLength }}
                        onChange={(values) => handleDimensionChange('minLength', 'maxLength', values)}
                        unit="'"
                    />
                </div>

                 <div className="space-y-2">
                    <p className="block text-sm font-medium text-gray-600">Width (Inches)</p>
                     <RangeSlider
                        min={SLIDER_RANGES.width.min}
                        max={SLIDER_RANGES.width.max}
                        step={SLIDER_RANGES.width.step}
                        values={{ minVal: filters.minWidth, maxVal: filters.maxWidth }}
                        onChange={(values) => handleDimensionChange('minWidth', 'maxWidth', values)}
                        unit='"'
                    />
                </div>

                 <div className="space-y-2">
                    <p className="block text-sm font-medium text-gray-600">Thickness (Inches)</p>
                     <RangeSlider
                        min={SLIDER_RANGES.thickness.min}
                        max={SLIDER_RANGES.thickness.max}
                        step={SLIDER_RANGES.thickness.step}
                        values={{ minVal: filters.minThickness, maxVal: filters.maxThickness }}
                        onChange={(values) => handleDimensionChange('minThickness', 'maxThickness', values)}
                        unit='"'
                    />
                </div>

                <FilterInput label="Fin Setup">
                     <select name="finSetup" value={filters.finSetup} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                        <option value="All">All</option>
                        {FIN_SETUP_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                    </select>
                </FilterInput>
                
                <FilterInput label="Fin System">
                     <select name="finSystem" value={filters.finSystem} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                        <option value="All">All</option>
                        {FIN_SYSTEMS_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                    </select>
                </FilterInput>
                
                <button 
                    onClick={handleReset} 
                    className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                    Reset Filters
                </button>
                <button 
                    onClick={onSaveSearch} 
                    className="w-full py-2 px-4 bg-[#49b9ce] text-white font-semibold rounded-md hover:bg-[#41a5b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49b9ce] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!isLoggedIn || !isVerified}
                    title={!isLoggedIn ? "Log in to save search alerts" : !isVerified ? "Please verify your account to save alerts" : "Save this search as an alert"}
                >
                    <HeartIcon isFilled={false} className="h-5 w-5" />
                    Save Search Alert
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
