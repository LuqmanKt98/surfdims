import React, { useState } from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface ContactPageProps {
    onClose: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form:', formData);
        // Simulate form submission
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 3000); // Close after 3 seconds
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 animate-fade-in overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
                <div className="max-w-2xl mx-auto">
                    <button onClick={onClose} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition mb-6">
                        <ArrowLeftIcon />
                        Back
                    </button>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Questions & Feedback</h1>

                        {isSubmitted ? (
                            <div className="text-center p-8 bg-green-50 rounded-lg">
                                <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
                                <p className="text-green-700 mt-2">Your message has been sent successfully. We'll get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"></textarea>
                                </div>
                                <div>
                                    <button type="submit" className="w-full py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;