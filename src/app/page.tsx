'use client';

import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Sprite } from '@/components/Sprite';
import { HeroText } from '@/components/HeroText';

export default function Home() {
  const projects = [
    {
      title: "SPCTR",
      subtitle: "Personal Project",
      youtubeId: "GHsqx0q20XU",
      image: "https://img.youtube.com/vi/GHsqx0q20XU/maxresdefault.jpg"
    },
    {
      title: "Action",
      subtitle: "Commercial",
      youtubeId: "Aa5tlmIv0z8",
      image: "https://img.youtube.com/vi/Aa5tlmIv0z8/maxresdefault.jpg"
    },
    {
      title: "Product",
      subtitle: "Tech Launch",
      youtubeId: "Ks4ikO8ByAY",
      image: "https://img.youtube.com/vi/Ks4ikO8ByAY/maxresdefault.jpg"
    },
    {
      title: "Automotive",
      subtitle: "Brand Film",
      youtubeId: "bFr3E5lxUB0",
      image: "https://img.youtube.com/vi/bFr3E5lxUB0/maxresdefault.jpg"
    },
    {
      title: "Creative",
      subtitle: "Studio Reel",
      youtubeId: "MeW831xdOEI",
      image: "https://img.youtube.com/vi/MeW831xdOEI/maxresdefault.jpg"
    },
    {
      title: "Event",
      subtitle: "Conference 2024",
      youtubeId: "OmKc0FYU64E",
      image: "https://img.youtube.com/vi/OmKc0FYU64E/maxresdefault.jpg"
    },
  ];

  return (
    <div className="min-h-screen text-black">
      {/* Fixed Full Width Rectangular Video Header */}
      <div className="fixed top-0 left-0 w-full z-0" style={{ height: '55vh' }}>
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
      <div className="w-full" style={{ height: '55vh' }}></div>

      {/* Content that scrolls over the fixed video */}
      <div id="content-section" className="bg-white relative z-10 w-full">
        <Nav />

        {/* Projects Grid */}
        <section id="work" className="pb-12 md:pb-24 w-full">
          <div className="w-[90%] md:w-[79%] max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <Sprite variant="scroll" />
    </div>
  );
}
