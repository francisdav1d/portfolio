import { useState } from 'react';
import { Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Project {
  title: string;
  subtitle: string;
  vimeoId?: string; // keeping just in case
  youtubeId?: string;
  bgColor: string;
  image: string;
}

export function ProjectCard({ project }: { project: Project }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Use youtubeId if available, fallback to vimeoId if needed
  const videoId = project.youtubeId || project.vimeoId || "dQw4w9WgXcQ";

  return (
    <div 
      className="relative aspect-[3/2] overflow-hidden group cursor-pointer bg-black"
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
          <ImageWithFallback
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Background tint on hover - using the brand color #0000ff */}
          <div className="absolute inset-0 bg-[#0000ff] mix-blend-multiply z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-80"></div>
          
          {/* Custom Play Button and Text on Hover */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Minimal Play Button */}
            <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={64} strokeWidth={1} className="text-white opacity-80" />
            </div>
            
            {/* Text positioned at top left */}
            <div className="absolute top-0 left-0 p-8 flex flex-col items-start text-white w-full">
              <h3 className="text-3xl font-medium mb-1">{project.title} ✦</h3>
              <p className="text-xl opacity-90">{project.subtitle}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
