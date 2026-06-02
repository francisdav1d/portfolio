'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current?.children ? Array.from(textRef.current.children) : [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(".real-photo",
        { scale: 0.5, opacity: 0, rotation: -10 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          delay: 0.35, // Pop in EXACTLY as the fixed sprite shrinks to 0
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 50%", // Matches the fixed sprite trigger precisely
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="py-20 md:py-32 bg-white w-full overflow-hidden">
      <div className="w-[90%] md:w-[85%] lg:w-[80%] max-w-[1600px] mx-auto" ref={containerRef}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          <div ref={textRef} className="w-full lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-sm font-bold tracking-[0.2em] text-[#0000ff] uppercase mb-4">
              About Me
            </h2>
            <h3 className="font-yd text-4xl md:text-5xl lg:text-7xl leading-[1.1] mb-8 text-black">
              Crafting stories <br /> through motion.
            </h3>
            <p className="text-neutral-600 text-base md:text-lg lg:text-xl font-light leading-relaxed mb-6">
              Hey, I'm Francis. I have been editing for 4 years. I started learning editing for my own YouTube channel. I loved the process so I continued.
            </p>
            <p className="text-neutral-600 text-base md:text-lg lg:text-xl font-light leading-relaxed mb-10">
              I specialize in editing for YouTubers. Clean edits and no missed deadlines.<br />
              If that sounds like what you are looking for, let's work together!
            </p>
            
            <div>
              <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-bold text-sm tracking-widest uppercase hover:bg-[#0000ff] transition-colors duration-300">
                Let's Work
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative flex justify-center items-center mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-[#f5f5f5] rounded-3xl transform rotate-3 scale-95 -z-10"></div>
            
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto overflow-hidden bg-neutral-100 shadow-2xl flex items-center justify-center">
              
              {/* The Real Photograph (Pops in instantly) */}
              <img 
                src="/images/working.png" 
                alt="Francis David Working" 
                className="real-photo absolute inset-0 w-full h-full object-cover object-center opacity-0 z-10 grayscale contrast-125"
              />
              
              <div className="absolute inset-0 bg-[#0000ff] mix-blend-multiply opacity-10 pointer-events-none z-30"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
