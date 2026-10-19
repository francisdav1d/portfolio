'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  youtubeId?: string;
  startSeconds?: number;
  image?: string;
}

export function ProjectCard({ project, index = 0, priority = false }: { project: Project, index?: number, priority?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoId = project.youtubeId;

  useGSAP(() => {
    gsap.fromTo(cardRef.current, 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none none"
        }
      }
    );
  }, { scope: cardRef });

  // No video yet: an empty slot. Neighbouring slots alternate shades so they read as
  // separate cards in the 2-column grid.
  if (!videoId || !project.image) {
    const isLight = (index + Math.floor(index / 2)) % 2 === 1;

    return (
      <div
        ref={cardRef}
        className={`relative aspect-video overflow-hidden flex items-center justify-center ${isLight ? 'bg-neutral-50' : 'bg-neutral-100'}`}
      >
        <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-gray-400">
          Coming soon
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="@container relative aspect-video overflow-hidden group cursor-pointer bg-gray-100"
    >
      {isPlaying ? (
        <iframe
          className="w-full h-full object-cover"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1${project.startSeconds ? `&start=${project.startSeconds}` : ''}`}
          title={project.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <>
          <img
            src={project.image}
            alt={project.title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-[#0000ff] mix-blend-multiply opacity-0 group-hover:opacity-70 transition-opacity duration-500 ease-out"></div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-start p-4 md:p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out translate-y-3 group-hover:translate-y-0 text-white pointer-events-none">
            {/* Uppercase in CSS so every card's title looks the same however it's typed */}
            <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium uppercase">{project.title}</h3>
          </div>
          <button
            type="button"
            aria-label={`Play ${project.title}`}
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 z-20 flex w-full h-full items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#0000ff]"
          >
            {/* The viewBox is cropped to the triangle, so its height is the triangle's height:
                11% of the card's width (cqw), growing and shrinking with the card */}
            <svg
              className="h-[clamp(32px,11cqw,96px)] w-auto text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110"
              viewBox="8 5.14 11 14"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
