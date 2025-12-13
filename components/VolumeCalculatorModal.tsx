
import React, { useState, useEffect } from 'react';
import XIcon from './icons/XIcon';
import CalculatorIcon from './icons/CalculatorIcon';

interface VolumeCalculatorModalProps {
    onClose: () => void;
    onApply: (min: number, max: number) => void;
}

type Unit = 'metric' | 'imperial';
type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type AgeGroup = 'Under 30' | '30-49' | '50+';
type FitnessLevel = 'Poor' | 'Average' | 'Good' | 'Excellent';

const VolumeCalculatorModal: React.FC<VolumeCalculatorModalProps> = ({ onClose, onApply }) => {
    const [unit, setUnit] = useState<Unit>('metric');
    const [weight, setWeight] = useState<string>('');
    const [skill, setSkill] = useState<SkillLevel>('Intermediate');
    const [age, setAge] = useState<AgeGroup>('30-49');
    const [fitness, setFitness] = useState<FitnessLevel>('Average');
    const [result, setResult] = useState<{ min: number; max: number } | null>(null);

    const calculateVolume = () => {
        const weightVal = parseFloat(weight);
        if (isNaN(weightVal) || weightVal <= 0) {
            setResult(null);
            return;
        }

        // Convert to KG if imperial
        const weightKg = unit === 'imperial' ? weightVal * 0.453592 : weightVal;

        // Base Guild Factor (GF) based on skill
        // Beginner: High volume for stability/paddling
        // Intermediate: Balance
        // Advanced: Performance
        let baseGF = 0.0;
        switch (skill) {
            case 'Beginner':
                baseGF = 0.58; 
                break;
            case 'Intermediate':
                baseGF = 0.40;
                break;
            case 'Advanced':
                baseGF = 0.35;
                break;
        }

        // Age Modifier
        // Older surfers typically benefit from slightly more volume
        let ageMod = 0;
        switch (age) {
            case 'Under 30': ageMod = 0; break;
            case '30-49': ageMod = 0.01; break;
            case '50+': ageMod = 0.02; break;
        }

        // Fitness Modifier
        // Better fitness allows for slightly lower volume (more paddling power)
        // Poorer fitness requires more help
        let fitnessMod = 0;
        switch (fitness) {
            case 'Poor': fitnessMod = 0.02; break;
            case 'Average': fitnessMod = 0.01; break;
            case 'Good': fitnessMod = 0; break;
            case 'Excellent': fitnessMod = -0.01; break;
        }

        const totalGF = baseGF + ageMod + fitnessMod;
        
        // Calculate volume
        const optimalVol = weightKg * totalGF;
        
        // Define a range (e.g., +/- 1.5 Litres for precision, wider for beginners)
        const range = skill === 'Beginner' ? 3 : 1.5;

        setResult({
            min: Math.round((optimalVol - range) * 10) / 10,
            max: Math.round((optimalVol + range) * 10) / 10
        });
    };

    useEffect(() => {
        if (weight) calculateVolume();
    }, [unit, weight, skill, age, fitness]);

    const handleApply = () => {
        if (result) {
            onApply(result.min, result.max);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <CalculatorIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Volume Calculator</h2>
                        <p className="text-sm text-gray-500">Find your ideal surfboard volume</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Unit Toggle */}
                    <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setUnit('metric')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                unit === 'metric' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Metric (kg)
                        </button>
                        <button
                            onClick={() => setUnit('imperial')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                unit === 'imperial' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Imperial (lbs)
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder={unit === 'metric' ? 'e.g. 75' : 'e.g. 165'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skill Level
                            </label>
                            <select
                                value={skill}
                                onChange={(e) => setSkill(e.target.value as SkillLevel)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Age
                            </label>
                            <select
                                value={age}
                                onChange={(e) => setAge(e.target.value as AgeGroup)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="Under 30">Under 30</option>
                                <option value="30-49">30 - 49</option>
                                <option value="50+">50+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fitness
                            </label>
                            <select
                                value={fitness}
                                onChange={(e) => setFitness(e.target.value as FitnessLevel)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="Poor">Poor</option>
                                <option value="Average">Average</option>
                                <option value="Good">Good</option>
                                <option value="Excellent">Excellent</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
                        <p className="text-gray-600 text-sm uppercase tracking-wide font-semibold mb-2">Recommended Volume</p>
                        {result ? (
                            <div>
                                <span className="text-4xl font-extrabold text-blue-600">{result.min} - {result.max}</span>
                                <span className="text-xl font-bold text-blue-400 ml-1">L</span>
                            </div>
                        ) : (
                            <p className="text-gray-400 font-medium italic">Enter your weight to calculate</p>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        {result && (
                             <button
                                onClick={handleApply}
                                className="flex-1 py-3 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                            >
                                Apply to Search
                            </button>
                        )}
                        <button
                            onClick={onClose}
                             className={`${result ? 'flex-1' : 'w-full'} py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolumeCalculatorModal;
