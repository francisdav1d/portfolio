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

      // Fade out while the content covers the header: from 90% to 10% of the header's height
      // (the header is shorter on phones, so fixed viewport percentages would start it early)
      const headerHeight = () => containerRef.current?.parentElement?.offsetHeight ?? window.innerHeight / 2;
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: '#content-section',
          start: () => `top ${headerHeight() * 0.9}px`,
          end: () => `top ${headerHeight() * 0.1}px`,
          scrub: true,
          invalidateOnRefresh: true,
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
      {/* Always two lines, sized to the screen: 12% of the width on phones (up to 56px),
          then 60px growing to 128px from md up (96px at 1440, 128px at 1920 as before) */}
      <h1
        ref={titleRef}
        className="font-yd max-md:text-[min(12vw,56px)] md:text-[clamp(60px,6.7vw,128px)] font-extrabold text-white tracking-wider leading-none"
        style={{
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
          opacity: 0,
        }}
      >
        <span className="block whitespace-nowrap">Hey, I'm</span>
        <span className="block whitespace-nowrap">Francis</span>
      </h1>
    </div>
  );
}
