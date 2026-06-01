'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Sprite({ variant = 'hero' }: { variant?: 'hero' | 'scroll' }) {
  const spriteRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !spriteRef.current || !introRef.current) return;

    const ctx = gsap.context(() => {
      if (variant === 'hero') {
        // Hero sprite intro: fly in on page load (animated on introRef to avoid conflicts)
        gsap.fromTo(introRef.current,
          {
            y: 300,
            x: 100,
            opacity: 0,
            rotation: -45,
            scale: 0.5,
          },
          {
            y: 0,
            x: 0,
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
            delay: 0.5,
          }
        );

        // Hero sprite scroll: fade/fly out as user scrolls down, and reverse (fade/fly in) as they scroll up
        gsap.to(containerRef.current, {
          scrollTrigger: {
            trigger: "#content-section",
            start: "top 55%",
            end: "top 15%",
            scrub: true,
          },
          y: 150,
          x: 50,
          opacity: 0,
          scale: 0.7,
          ease: "none",
        });

        // Gentle float on the image (separate element = no conflicts)
        gsap.to(spriteRef.current, {
          y: "-=25",
          duration: 2.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2,
        });
      } else {
        // SCROLL SPRITE: start completely hidden
        gsap.set(containerRef.current, {
          opacity: 0,
          x: -300,
          y: 200,
          scale: 0.3,
          rotation: 30,
        });

        // Only pop in when #content-section top edge hits top of viewport
        // That's the exact moment the video + hero sprite are fully covered
        ScrollTrigger.create({
          trigger: "#content-section",
          start: "top top",
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(containerRef.current, {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 1.2,
                ease: "elastic.out(1, 0.6)",
                overwrite: "auto",
              });
            } else {
              gsap.to(containerRef.current, {
                opacity: 0,
                x: -300,
                y: 200,
                scale: 0.3,
                rotation: 30,
                duration: 0.8,
                ease: "power3.out",
                overwrite: "auto",
              });
            }
          },
          onRefresh: (self) => {
            if (!self.isActive) {
              gsap.set(containerRef.current, {
                opacity: 0,
                x: -300,
                y: 200,
                scale: 0.3,
                rotation: 30,
              });
            }
          }
        });

        // Natural breathing and floating effect
        gsap.to(spriteRef.current, {
          y: "-=15",
          scale: 1.05,
          rotation: 3,
          duration: 2.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });

    return () => ctx.revert();
  }, [variant]);

  const positionClass = variant === 'hero'
    ? "absolute bottom-0 right-10 md:right-32 z-10"
    : "fixed bottom-0 left-1 md:left-5 z-50";

  const sizeClass = variant === 'hero'
    ? "w-[45vw] sm:w-[35vw] md:w-[25vw] max-w-[500px]"
    : "w-[20vw] sm:w-[15vw] md:w-[10vw] max-w-[150px]";

  const initialStyle = variant === 'scroll' ? { opacity: 0 } : undefined;
  const introStyle = variant === 'hero' ? { opacity: 0 } : undefined;

  return (
    <div ref={containerRef} className={`${positionClass} pointer-events-none`} style={initialStyle}>
      <div ref={introRef} className="origin-bottom" style={introStyle}>
        <img
          ref={spriteRef}
          src="/images/francis_sprite_background_removed.png"
          alt="Francis Sprite"
          className={`${sizeClass} origin-bottom`}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))',
          }}
        />
      </div>
    </div>
  );
}
