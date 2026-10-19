'use client';

import { preload } from 'react-dom';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Sprite } from '@/components/Sprite';
import { HeroText } from '@/components/HeroText';
import { HeroVideo } from '@/components/HeroVideo';

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

  // Fetch the header's first frame up front so it shows instantly while the video buffers
  preload('/video/poster.jpg', { as: 'image', fetchPriority: 'high' });

  const projects = [
    {
      title: "PWR HOUSE",
      youtubeId: "t1hOURfsLu0",
      image: "/images/thumbnails/pwr_house.jpg"
    },
    {
      title: "JEOPARDY",
      youtubeId: "GHsqx0q20XU",
      image: "/images/thumbnails/jeopardy.jpg"
    },
    {
      title: "ARCADE",
      youtubeId: "Aa5tlmIv0z8",
      image: "/images/thumbnails/arcade.jpg"
    },
    {
      title: "MINI GOLF",
      youtubeId: "Ks4ikO8ByAY",
      image: "/images/thumbnails/mini_golf.jpg"
    },
    {
      title: "LARGEST PIZZA",
      youtubeId: "bFr3E5lxUB0",
      image: "/images/thumbnails/largest_pizza.jpg"
    },
    {
      title: "SECRET SANTA",
      youtubeId: "MeW831xdOEI",
      image: "/images/thumbnails/secret_santa.jpg"
    },
  ];

  const streamerProjects = [
    {
      title: "Acai Bowl Date",
      youtubeId: "3N-dTiSjfWg",
      image: "/images/thumbnails/acai_bowl_date.jpg"
    },
    {
      title: "Day with GYM BADDIE",
      youtubeId: "hEb0hNxA0YM",
      image: "/images/thumbnails/gym_baddie.jpg"
    },
    {
      title: "Workout with Toria",
      youtubeId: "tbY8VKjh3TI",
      image: "/images/thumbnails/workout_with_toria.jpg"
    },
    {
      title: "Jasontheween and Cinna",
      youtubeId: "MrzdE7HW4Ac",
      image: "/images/thumbnails/jasontheween_cinna.jpg",
      startSeconds: 199
    },
  ];

  return (
    // --hero-h: the video header height (shorter on phones), shared by the header, its spacer and the sprite
    <div className="min-h-screen text-black max-md:[--hero-h:max(260px,38vh)] md:[--hero-h:clamp(280px,50vh,55vh)]">
      {/* Fixed Full Width Rectangular Video Header */}
      <div
        ref={videoContainerRef}
        className="fixed top-0 left-0 w-full z-0"
        style={{ height: 'var(--hero-h)', opacity: 0 }}
      >
        <svg className="absolute w-0 h-0">
          <filter id="directional-blur">
            <feGaussianBlur stdDeviation="0 6" />
          </filter>
        </svg>
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none" />
        <HeroText />
        <Sprite />
      </div>

      {/* Spacer to show video */}
      <div className="w-full" style={{ height: 'var(--hero-h)' }}></div>

      {/* Content that scrolls over the fixed video */}
      <div id="content-section" className="bg-white relative z-10 w-full">
        <Nav />

        {/* Projects Grid */}
        <section id="work" className="scroll-mt-16 md:scroll-mt-0 w-full">
          <div className="w-[92%] md:w-[85%] lg:w-[82%] xl:w-[79%] max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} priority={index < 2} />
              ))}
            </div>
          </div>
        </section>

        {/* Streamer Grid */}
        <section id="streamer" className="pb-8 md:pb-12 lg:pb-16 xl:pb-24 w-full">
          <div className="w-[92%] md:w-[85%] lg:w-[82%] xl:w-[79%] max-w-[2000px] mx-auto">
            {/* More space above than below, so the heading reads as the start of the stream grid.
                Padding is full size on a 1920-wide monitor and shrinks quickly on narrower laptop screens.
                The text has no descenders, so it's nudged down 0.13em to sit evenly on its padding */}
            <div className="text-center pt-[clamp(3.5rem,calc(13vw_-_122px),8rem)] pb-[clamp(2.5rem,calc(8vw_-_74px),5rem)]">
              <h3 className="font-yd text-4xl md:text-5xl lg:text-6xl leading-none translate-y-[0.13em] text-black">
                Stream VODs
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {streamerProjects.map((project, index) => (
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
