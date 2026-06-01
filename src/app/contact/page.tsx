'use client';

import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Nav />
      
      <main className="flex-grow w-[85%] max-w-[2000px] mx-auto py-16 flex flex-col md:flex-row relative">
        {/* Left Form Side */}
        <div className="w-full md:w-1/2 z-10">
          <h1 className="text-6xl font-medium mb-4 tracking-tight">Contact</h1>
          <p className="text-xl mb-12">Start a project, schedule a talk or just say hello!</p>
          
          <form className="max-w-xl space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Name *</label>
              <input 
                type="text" 
                placeholder="Your Name..." 
                className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Email Address *</label>
              <input 
                type="email" 
                placeholder="Your Email Address..." 
                className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Message *</label>
              <textarea 
                placeholder="Your Message..." 
                rows={5}
                className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff]"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Company URL</label>
              <input 
                type="url" 
                className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Time zone *</label>
              <input 
                type="text" 
                className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff]"
                required
              />
            </div>
            
            <button 
              type="button" 
              className="bg-[#2a2a2a] text-white px-8 py-3 font-bold text-sm hover:bg-black transition-colors"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Right Diamond Side */}
        <div className="hidden md:block w-full md:w-1/2 absolute right-0 top-0 h-full pointer-events-none">
          <div 
            className="w-full h-full bg-[#0000ff] opacity-100"
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              transform: 'scale(1.2) translateX(20%)'
            }}
          ></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
