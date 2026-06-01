'use client';

import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';

export default function Work() {
  const projects = [
    {
      title: "Project 1",
      subtitle: "Commercial",
      youtubeId: "GHsqx0q20XU",
      bgColor: "bg-[#0000ff]",
      image: "https://img.youtube.com/vi/GHsqx0q20XU/maxresdefault.jpg"
    },
    {
      title: "Project 2",
      subtitle: "Personal",
      youtubeId: "Aa5tlmIv0z8",
      bgColor: "bg-[#ff4500]",
      image: "https://img.youtube.com/vi/Aa5tlmIv0z8/maxresdefault.jpg"
    },
    {
      title: "Project 3",
      subtitle: "Tech Launch",
      youtubeId: "Ks4ikO8ByAY",
      bgColor: "bg-[#00d4ff]",
      image: "https://img.youtube.com/vi/Ks4ikO8ByAY/maxresdefault.jpg"
    },
    {
      title: "Project 4",
      subtitle: "Brand Film",
      youtubeId: "bFr3E5lxUB0",
      bgColor: "bg-[#1a1a2e]",
      image: "https://img.youtube.com/vi/bFr3E5lxUB0/maxresdefault.jpg"
    },
    {
      title: "Project 5",
      subtitle: "Studio Reel",
      youtubeId: "MeW831xdOEI",
      bgColor: "bg-[#8b5cf6]",
      image: "https://img.youtube.com/vi/MeW831xdOEI/maxresdefault.jpg"
    },
    {
      title: "Project 6",
      subtitle: "Conference 2024",
      youtubeId: "OmKc0FYU64E",
      bgColor: "bg-[#ef4444]",
      image: "https://img.youtube.com/vi/OmKc0FYU64E/maxresdefault.jpg"
    },
  ];

  return (
    <div className="bg-[#09090b] min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-grow">
        <section className="py-24">
          <div className="w-[85%] max-w-[2000px] mx-auto">
            <h1 className="text-5xl md:text-7xl font-medium mb-12 text-white text-center">All Work</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-black">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
