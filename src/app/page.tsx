'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Sprite } from '@/components/Sprite';
import { HeroText } from '@/components/HeroText';

import { About } from '@/components/About';
import { Testimonials } from '@/components/Testimonials';

export default function Home() {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoContainerRef.current) return;
    gsap.fromTo(videoContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.0, ease: "power2.out", delay: 0.1 }
    );
  }, []);

  const projects = [
    {
      title: "JEOPARDY",
      youtubeId: "GHsqx0q20XU",
      image: "https://img.youtube.com/vi/GHsqx0q20XU/maxresdefault.jpg"
    },
    {
      title: "ARCADE",
      youtubeId: "Aa5tlmIv0z8",
      image: "https://img.youtube.com/vi/Aa5tlmIv0z8/maxresdefault.jpg"
    },
    {
      title: "MINI GOLF",
      youtubeId: "Ks4ikO8ByAY",
      image: "https://img.youtube.com/vi/Ks4ikO8ByAY/maxresdefault.jpg"
    },
    {
      title: "LARGEST PIZZA",
      youtubeId: "bFr3E5lxUB0",
      image: "https://img.youtube.com/vi/bFr3E5lxUB0/maxresdefault.jpg"
    },
    {
      title: "SECRET SANTA",
      youtubeId: "MeW831xdOEI",
      image: "https://img.youtube.com/vi/MeW831xdOEI/maxresdefault.jpg"
    },
    {
      title: "MUCKBANG",
      youtubeId: "OmKc0FYU64E",
      image: "https://img.youtube.com/vi/OmKc0FYU64E/maxresdefault.jpg"
    },
  ];

  return (
    <div className="min-h-screen text-black">
      {/* Fixed Full Width Rectangular Video Header */}
      <div 
        ref={videoContainerRef}
        className="fixed top-0 left-0 w-full z-0" 
        style={{ height: 'clamp(280px, 50vh, 55vh)', opacity: 0 }}
      >
        <svg className="absolute w-0 h-0">
          <filter id="directional-blur">
            <feGaussianBlur stdDeviation="0 6" />
          </filter>
        </svg>
        <video
          src="/video/Portfolio_compressed.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center scale-105"
          style={{ filter: 'url(#directional-blur)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none" />
        <HeroText />
        <Sprite />
      </div>

      {/* Spacer to show video */}
      <div className="w-full" style={{ height: 'clamp(280px, 50vh, 55vh)' }}></div>

      {/* Content that scrolls over the fixed video */}
      <div id="content-section" className="bg-white relative z-10 w-full">
        <Nav />

        {/* Projects Grid */}
        <section id="work" className="pb-8 md:pb-12 lg:pb-16 xl:pb-24 w-full">
          <div className="w-[92%] md:w-[85%] lg:w-[82%] xl:w-[79%] max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        <About />

        <Footer />
      </div>

      <Sprite variant="scroll" />
    </div>
  );
}
