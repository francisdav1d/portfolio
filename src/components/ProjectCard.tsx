'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  youtubeId?: string;
  image: string;
}

export function ProjectCard({ project, index = 0 }: { project: Project, index?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoId = project.youtubeId || "dQw4w9WgXcQ";

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

  return (
    <div 
      ref={cardRef}
      className="relative aspect-[16/10] overflow-hidden group cursor-pointer bg-gray-100"
      onClick={() => setIsPlaying(true)}
    >
      {isPlaying ? (
        <iframe
          className="w-full h-full object-cover"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
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
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-[#0000ff] mix-blend-multiply opacity-0 group-hover:opacity-70 transition-opacity duration-500 ease-out"></div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-start p-4 md:p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out translate-y-3 group-hover:translate-y-0 text-white pointer-events-none">
            <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium">{project.title}</h3>
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out scale-95 group-hover:scale-100 text-white pointer-events-none">
            <svg className="w-10 h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
