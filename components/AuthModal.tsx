

import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import { COUNTRIES } from '../countries';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (email: string, pass: string) => void;
    onSignup: (name: string, email: string, pass: string, country: string) => void;
    authReason?: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onSignup, authReason }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0].code);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(email, password);
        } else {
            onSignup(name, email, password, country);
        }
    };

    const defaultAuthReason = 'Login or sign-up to save favourites and create listings.';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <div className="text-center text-gray-800 font-semibold mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {authReason || defaultAuthReason}
                </div>
                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setIsLogin(true)} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Login
                        </button>
                        <button onClick={() => setIsLogin(false)} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Sign Up
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <select value={country} onChange={e => setCountry(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                    </div>
                    {isLogin && <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>}

                    <div>
                        <button type="submit" className="w-full py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                            {isLogin ? 'Login' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;