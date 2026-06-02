'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SocialLinks } from '@/components/SocialLinks';

export default function Contact() {
  const socialsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);

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
            
            <form style={{ opacity: 0 }} className="max-w-md lg:max-w-xl space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Name *</label>
                <input 
                  type="text" 
                  placeholder="Your Name..." 
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="Your Email Address..." 
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Message *</label>
                <textarea 
                  placeholder="Your Message..." 
                  rows={5}
                  className="w-full border border-[#0000ff] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0000ff] transition-all bg-transparent"
                  required
                ></textarea>
              </div>
              

              
              <div>
                <button 
                  type="button" 
                  className="bg-black text-white px-10 py-3.5 font-bold text-sm hover:bg-neutral-800 transition-colors shadow-lg active:scale-95 duration-200"
                >
                  Submit
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
              src="/images/francis_sprite_background_removed.png"
              alt="Francis Sprite"
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
