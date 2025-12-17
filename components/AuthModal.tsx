import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '../types';
import { COUNTRIES } from '../countries';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import XIcon from './icons/XIcon';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0]?.code || 'US');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError(null);
            setSuccessMessage(null);
            setEmail('');
            setPassword('');
            setName('');
            setCountry(COUNTRIES[0]?.code || 'US');
        }
    }, [isOpen, initialView]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccessMessage("Login Successful!");
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error("Login error", error);
            let errorMessage = "Failed to login.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed login attempts. Please try again later.";
            }
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const newUser: User = {
                id: user.uid,
                name: name,
                email: email,
                country: country,
                favs: [],
                alerts: [],
                avatar: `https://i.pravatar.cc/150?u=${email}`,
                location: '',
                isBlocked: false,
                isVerified: false,
                createdAt: new Date().toISOString(),
                role: 'user'
            };

            await setDoc(doc(db, "users", user.uid), newUser);

            setSuccessMessage("Account created successfully!");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error("Signup error", error);
            let errorMessage = "Failed to create account.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already in use.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password should be at least 6 characters.";
            } else if (error.message && error.message.includes("offline")) {
                errorMessage = "Network error: Verify your internet connection and try again.";
            } else {
                errorMessage = error.message;
            }
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
                >
                    <XIcon />
                </button>

                <div className="p-8 overflow-y-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {view === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500">
                            {view === 'login'
                                ? 'Sign in to access your account'
                                : 'Join our community of surfers'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded text-sm flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <p>{successMessage}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={view === 'login' ? handleLogin : handleSignup}>
                        {view === 'signup' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {view === 'signup' && (
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    id="country"
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {view === 'signup' && <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters.</p>}
                        </div>

                        {view === 'login' && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 text-gray-600">Remember me</label>
                                </div>
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !!successMessage}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-600">
                            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                className="font-bold text-blue-600 hover:text-blue-500 transition"
                            >
                                {view === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;