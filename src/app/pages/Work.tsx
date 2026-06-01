import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';

export function Work() {
  // Currently showing the same 6 placeholders. 
  // You can add more projects here for the full Work page!
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
      subtitle: "Brand Film",
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
      subtitle: "Music Video",
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
      subtitle: "Conference",
      youtubeId: "OmKc0FYU64E",
      bgColor: "bg-[#ef4444]",
      image: "https://img.youtube.com/vi/OmKc0FYU64E/maxresdefault.jpg"
    },
    // Add more projects here as needed
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Nav />

      <main className="flex-grow">
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="text-5xl md:text-7xl font-medium mb-12 text-black text-center">All Work</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-black">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
