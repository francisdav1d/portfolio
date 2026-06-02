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
      gsap.fromTo(titleRef.current, 
        {
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          delay: 0.6,
        }
      );

      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: '#content-section',
          start: 'top 45%',
          end: 'top 5%',
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
        className="font-yd text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold text-white tracking-wider leading-none max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl"
        style={{
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
          opacity: 0,
        }}
      >
        Hey, I'm Francis
      </h1>
    </div>
  );
}
