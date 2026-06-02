'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Sprite({ variant = 'hero' }: { variant?: 'hero' | 'scroll' | 'about' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const spriteGroupRef = useRef<HTMLDivElement>(null);
  
  // Layer refs
  const bodyRef = useRef<HTMLImageElement>(null);
  const faceRef = useRef<HTMLImageElement>(null);
  const mouthRef = useRef<HTMLImageElement>(null);
  const leftEyeRef = useRef<HTMLImageElement>(null);
  const rightEyeRef = useRef<HTMLImageElement>(null);
  const leftArmRef = useRef<HTMLImageElement>(null);
  const rightArmRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !introRef.current || !spriteGroupRef.current) return;

    const ctx = gsap.context(() => {
      // 1. INTRO & SCROLL LOGIC
      if (variant === 'hero') {
        const introTl = gsap.timeline({ delay: 0.2 });
        
        // 1. Zip in from off-screen left, tilted forward
        introTl.fromTo(introRef.current,
          { x: -1500, y: 0, opacity: 1, rotation: 15, scale: 1 }, 
          { x: 50, rotation: -15, duration: 0.4, ease: "power4.out" } // Skid forward slightly
        )
        // 2. Bounce back and settle into place
        .to(introRef.current, { x: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });

        // Animate smoke puffs popping out concurrently with the skid
        introTl.fromTo(".smoke-puff", 
          { scale: 0, opacity: 0.8, x: 0, y: 0 },
          { 
            scale: "random(2, 4)", 
            opacity: 0, 
            x: "random(-100, -200)", 
            duration: 0.6, 
            stagger: 0.05, 
            ease: "power2.out" 
          },
          "-=0.4" // Start right as it hits the brakes
        );

        gsap.to(containerRef.current, {
          scrollTrigger: {
            trigger: "#content-section",
            start: "top 45%",
            end: "top 5%",
            scrub: true,
          },
          y: 150, x: 50, opacity: 0, scale: 0.7, ease: "none",
        });
      } else if (variant === 'scroll') {
        gsap.set(containerRef.current, { opacity: 0, x: -300, y: 200, scale: 0.3, rotation: 30 });

        // Show when scrolling past hero
        ScrollTrigger.create({
          trigger: "#content-section",
          start: "top top",
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(containerRef.current, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
            } else {
              gsap.to(containerRef.current, { opacity: 0, x: -300, y: 200, scale: 0.3, rotation: 30, duration: 0.8, ease: "power3.out", overwrite: "auto" });
            }
          },
        });

        // Hide (dash into the about section) when reaching about
        ScrollTrigger.create({
          trigger: "#about",
          start: "top 50%", // Triggers right when the box is nicely centered
          onEnter: () => {
            // Dash directly at the About box (up and right) and shrink to 0
            gsap.to(containerRef.current, {
              x: typeof window !== 'undefined' ? window.innerWidth * 0.6 : 800,
              y: typeof window !== 'undefined' ? -window.innerHeight * 0.25 : -250,
              scale: 0,
              opacity: 0,
              rotation: 15,
              duration: 0.4,
              ease: "power2.in",
              overwrite: "auto"
            });
          },
          onLeaveBack: () => {
            // Burst back out of the About box and return to bottom-left
            gsap.to(containerRef.current, {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.5,
              delay: 0.2, // Wait for About sprite to start shrinking
              ease: "back.out(1.2)",
              overwrite: "auto"
            });
          }
        });
      }

      // 2. LAYER ANIMATIONS
      // 2. LAYER ANIMATIONS
      // Floating (entire group)
      gsap.to(spriteGroupRef.current, {
        y: variant === 'hero' ? "-=25" : "-=15",
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: variant === 'hero' ? 2 : 0,
      });

      // Breathing (Body scales slightly on Y axis)
      gsap.to(bodyRef.current, {
        scaleY: 1.01,
        transformOrigin: "bottom center",
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Left arm floating at shoulder pivot (Inner top edge)
      gsap.to(leftArmRef.current, {
        rotation: 4,
        transformOrigin: "48% 59%", // Exact left shoulder joint
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5,
      });
      
      // If it's the hero sprite, do a realistic rotational wave!
      if (variant === 'hero') {
        gsap.set(rightArmRef.current, { transformOrigin: "47% 59%" }); // Exact right shoulder joint

        const waveTl = gsap.timeline({ delay: 0.85 }); // Reduced delay to trigger faster after load
        waveTl.to(rightArmRef.current, { rotation: -70, duration: 0.4, ease: "power2.out" }) // Lift arm moderately high
              .to(rightArmRef.current, { rotation: -45, duration: 0.15, yoyo: true, repeat: 5, ease: "sine.inOut" }) // Wave back and forth
              .to(rightArmRef.current, { rotation: 0, duration: 0.5, ease: "power2.inOut" }); // Put arm back down
      }

      // Continuous float for right arm (delayed if hero)
      gsap.to(rightArmRef.current, {
        rotation: -4,
        transformOrigin: "47% 59%", // Exact right shoulder joint
        duration: 2.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: variant === 'hero' ? 3.1 : 0.2, // Reduced delay to match the faster wave
      });

      // Blinking Eyes (using exact eye center pivots)
      const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 4 });
      
      gsap.set(leftEyeRef.current, { transformOrigin: "38% 31%" });
      gsap.set(rightEyeRef.current, { transformOrigin: "51% 30%" });

      blinkTl.to([leftEyeRef.current, rightEyeRef.current], {
        scaleY: 0.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
      blinkTl.to([leftEyeRef.current, rightEyeRef.current], {
        scaleY: 0.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        delay: 0.5,
      });

      // 3. MOUSE PARALLAX (Face tracking)
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

        // Move face slightly
        gsap.to(faceRef.current, {
          x: x * 6,
          y: y * 6,
          duration: 0.5,
          ease: "power2.out",
        });

        // Move eyes and mouth slightly more to create 3D depth
        gsap.to([leftEyeRef.current, rightEyeRef.current, mouthRef.current], {
          x: x * 12,
          y: y * 12,
          duration: 0.5,
          ease: "power2.out",
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    });

    return () => ctx.revert();
  }, [variant]);

  const positionClass = variant === 'hero'
    ? "absolute bottom-0 right-10 md:right-32 z-10"
    : variant === 'scroll'
      ? "fixed bottom-0 left-1 md:left-5 z-50 !hidden"
      : "relative w-full h-full flex items-center justify-center";

  const sizeClass = variant === 'hero'
    ? "w-[45vw] sm:w-[35vw] md:w-[25vw] max-w-[500px]"
    : variant === 'scroll'
      ? "w-[20vw] sm:w-[15vw] md:w-[10vw] max-w-[150px]"
      : "w-[80%] max-w-[300px]";

  const initialStyle = variant === 'scroll' ? { opacity: 0 } : undefined;
  const introStyle = variant === 'hero' ? { opacity: 0 } : undefined;

  // The base path for our separated layers
  const basePath = "/images/logo_separate";

  return (
    <div ref={containerRef} className={`${positionClass} pointer-events-none`} style={initialStyle}>
      
      {/* Smoke clouds for the high-speed intro */}
      {variant === 'hero' && (
        <div className="absolute bottom-10 left-[-50px] z-0 pointer-events-none">
          <div className="smoke-puff absolute w-16 h-16 bg-white/60 rounded-full blur-md opacity-0 left-0" />
          <div className="smoke-puff absolute w-24 h-24 bg-white/60 rounded-full blur-md opacity-0 left-[-40px] bottom-[-20px]" />
          <div className="smoke-puff absolute w-12 h-12 bg-white/60 rounded-full blur-md opacity-0 left-[-80px] top-10" />
        </div>
      )}

      <div ref={introRef} className="origin-bottom" style={introStyle}>
        
        {/* Layered Sprite Group */}
        <div 
          ref={spriteGroupRef} 
          className={`relative ${sizeClass} origin-bottom`}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))',
            aspectRatio: '1 / 1.1' // roughly assuming square-ish dimensions, adjust if needed
          }}
        >
          {/* Base invisible image to establish intrinsic dimensions of the container */}
          <img src={`${basePath}/body.png`} className="w-full h-auto opacity-0" alt="spacer" />

          {/* Actual Layers */}
          <img ref={bodyRef} src={`${basePath}/body.png`} className="absolute inset-0 w-full h-full object-contain" alt="Body" />
          <img ref={faceRef} src={`${basePath}/face.png`} className="absolute inset-0 w-full h-full object-contain" alt="Face" />
          <img ref={mouthRef} src={`${basePath}/mouth.png`} className="absolute inset-0 w-full h-full object-contain" alt="Mouth" />
          <img ref={leftEyeRef} src={`${basePath}/left eye.png`} className="absolute inset-0 w-full h-full object-contain" alt="Left Eye" />
          <img ref={rightEyeRef} src={`${basePath}/right eye.png`} className="absolute inset-0 w-full h-full object-contain" alt="Right Eye" />
          {/* Arms rendered last so they appear on top of the face */}
          <img ref={leftArmRef} src={`${basePath}/left arm.png`} className="absolute inset-0 w-full h-full object-contain" alt="Left Arm" />
          <img ref={rightArmRef} src={`${basePath}/right arm.png`} className="absolute inset-0 w-full h-full object-contain" alt="Right Arm" />
        </div>

      </div>
    </div>
  );
}
