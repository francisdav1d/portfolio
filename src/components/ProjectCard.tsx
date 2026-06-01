'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  subtitle: string;
  youtubeId?: string;
  image: string;
}

export function ProjectCard({ project, index = 0 }: { project: Project, index?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoId = project.youtubeId || "dQw4w9WgXcQ";

  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none reverse"
      }
    });
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
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-[#0000ff] mix-blend-multiply opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-start p-4 md:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
            <h3 className="text-2xl md:text-4xl font-medium mb-1">{project.title} ✦</h3>
            <p className="text-lg md:text-2xl opacity-90">{project.subtitle}</p>
          </div>
        </>
      )}
    </div>
  );
}
