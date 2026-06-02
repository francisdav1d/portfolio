'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SocialLinks } from '@/components/SocialLinks';

export default function Contact() {
  const socialsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const form = e.currentTarget;
    const data = new FormData(form);
    
    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!formRef.current || !spriteRef.current || !socialsRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Socials entrance animation (fades and slides down from under the Nav)
      gsap.fromTo(socialsRef.current,
        { 
          y: -25, 
          opacity: 0 
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.0, 
          ease: "power3.out", 
          delay: 0.1 
        }
      );

      // 2. Staggered fade & slide up for form container contents (Title, Subtitle, Form)
      const formElements = formRef.current?.children;
      if (formElements) {
        gsap.fromTo(Array.from(formElements),
          { 
            y: 35, 
            opacity: 0 
          },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.0, 
            ease: "power3.out", 
            stagger: 0.15,
            delay: 0.3,
          }
        );
      }

      // 3. Sprite entrance (smooth elastic glide from the right)
      gsap.fromTo(spriteRef.current,
        { 
          x: 150, 
          opacity: 0, 
          scale: 0.85, 
          rotation: 8 
        },
        { 
          x: 0, 
          opacity: 1, 
          scale: 1, 
          rotation: 0, 
          duration: 1.6, 
          ease: "elastic.out(1, 0.75)", 
          delay: 0.4 
        }
      );

      // 4. Continuous gentle floating on the sprite
      gsap.to(spriteRef.current, {
        y: "-=25",
        duration: 3.0,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2.0,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col overflow-x-hidden">
      <Nav />
      
      <main className="flex-grow w-[90%] md:w-[88%] lg:w-[85%] max-w-[2000px] mx-auto pt-0 pb-8 md:pb-12 flex flex-col relative min-h-[75vh]">
        
        {/* Top Prominent Social Links Bar - Placed right below Nav menu */}
        <div 
          ref={socialsRef}
          style={{ opacity: 0 }} 
          className="w-full py-2 mb-4"
        >
          <SocialLinks />
        </div>

        {/* Content Row (Form + Sprite) */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between">
          
          {/* Left Form Side */}
          <div ref={formRef} className="w-full md:w-[45%] z-10">
            <h1 
              style={{ opacity: 0 }} 
              className="text-4xl md:text-5xl lg:text-6xl font-medium mb-3 md:mb-4 tracking-tight"
            >
              Contact
            </h1>
            <p 
              style={{ opacity: 0 }} 
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 lg:mb-12 text-neutral-600"
            >
              Start a project, schedule a talk or just say hello!
            </p>
            
            <form style={{ opacity: 0 }} onSubmit={handleSubmit} className="max-w-md lg:max-w-xl space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Name *</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Name..." 
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                  disabled={status === 'submitting' || status === 'success'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Your Email Address..." 
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                  disabled={status === 'submitting' || status === 'success'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Message *</label>
                <textarea 
                  name="message"
                  placeholder="Your Message..." 
                  rows={5}
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                  disabled={status === 'submitting' || status === 'success'}
                ></textarea>
              </div>
              
              {status === 'error' && (
                <p className="text-red-500 text-sm font-bold">Oops! There was a problem submitting your form.</p>
              )}
              {status === 'success' && (
                <p className="text-[#0000ff] text-sm font-bold">Thanks for reaching out! I'll get back to you soon.</p>
              )}
              
              <div>
                <button 
                  type="submit" 
                  disabled={status === 'submitting' || status === 'success'}
                  className="bg-black text-white px-10 py-3.5 font-bold text-sm hover:bg-neutral-800 transition-colors shadow-lg active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Submit'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sprite Section with soft blue ambient glow */}
          <div className="hidden md:flex w-1/2 items-center justify-center relative select-none pointer-events-none min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
            {/* Ambient brand color back-glow */}
            <div className="absolute w-[400px] h-[400px] bg-[#0000ff]/10 rounded-full blur-[90px] -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
            
            <img
              ref={spriteRef}
              src="/images/calling.png"
              alt="Francis Calling"
              className="w-[60vw] md:w-[22vw] lg:w-[25vw] xl:w-[28vw] max-w-[560px] object-contain origin-bottom"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 255, 0.12)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15))',
                opacity: 0, // starts hidden in HTML to prevent FOUC loading flash
              }}
            />
          </div>
        </div>
      </main>

      <Footer hideSocials />
    </div>
  );
}
