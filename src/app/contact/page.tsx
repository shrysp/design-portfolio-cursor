"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useState } from 'react';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({
        name: '',
        email: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex justify-center">
      <main className="w-full max-w-[800px] px-4">
        <h1 className="text-3xl font-bold mt-8 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-700 mb-6">
          Have a project in mind or want to chat? Feel free to reach out!
        </p>
        
        {/* Contact information */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">Contact Information</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <a href="mailto:hello@example.com" className="text-blue-500 hover:underline">hello@example.com</a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Location:</span>
                <span>San Francisco, CA</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Availability:</span>
                <span>Open to freelance & full-time opportunities</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">Connect</h2>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                <span className="sr-only">Twitter</span>
                T
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                L
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                <span className="sr-only">Dribbble</span>
                D
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                <span className="sr-only">GitHub</span>
                G
              </a>
            </div>
          </div>
        </motion.div>
        
        {/* Contact form */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Send a Message</h2>
          
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              Thank you for your message! I'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
        
        <div className="fixed flex items-center justify-center left-0 right-0 bottom-8 z-10">
          <Navbar />
        </div>
      </main>
    </div>
  );
} 