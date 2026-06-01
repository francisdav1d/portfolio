'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation on load
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.6,
      });

      // 2. Scroll Trigger for smooth fade out & parallax on scroll down, with reverse on scroll up
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: '#content-section',
          start: 'top 55%',
          end: 'top 15%',
          scrub: true,
        },
        y: -100,
        opacity: 0,
        scale: 0.95,
        ease: 'none',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6 select-none pointer-events-none"
    >
      {/* Modern Bold Lowercase Title */}
      <h1 
        ref={titleRef}
        className="font-syne text-5xl sm:text-7xl md:text-9xl font-extrabold text-white tracking-tighter lowercase leading-none max-w-4xl"
        style={{
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
        }}
      >
        hey, i am francis
      </h1>
    </div>
  );
}
