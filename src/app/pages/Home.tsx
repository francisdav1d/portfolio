import { Link } from 'react-router';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';

export function Home() {
  const projects = [
    {
      title: "SPCTR",
      subtitle: "Personal Project",
      youtubeId: "GHsqx0q20XU",
      bgColor: "bg-[#0000ff]",
      image: "https://img.youtube.com/vi/GHsqx0q20XU/maxresdefault.jpg"
    },
    {
      title: "Action",
      subtitle: "Commercial",
      youtubeId: "Aa5tlmIv0z8",
      bgColor: "bg-[#ff4500]",
      image: "https://img.youtube.com/vi/Aa5tlmIv0z8/maxresdefault.jpg"
    },
    {
      title: "Product",
      subtitle: "Tech Launch",
      youtubeId: "Ks4ikO8ByAY",
      bgColor: "bg-[#00d4ff]",
      image: "https://img.youtube.com/vi/Ks4ikO8ByAY/maxresdefault.jpg"
    },
    {
      title: "Automotive",
      subtitle: "Brand Film",
      youtubeId: "bFr3E5lxUB0",
      bgColor: "bg-[#1a1a2e]",
      image: "https://img.youtube.com/vi/bFr3E5lxUB0/maxresdefault.jpg"
    },
    {
      title: "Creative",
      subtitle: "Studio Reel",
      youtubeId: "MeW831xdOEI",
      bgColor: "bg-[#8b5cf6]",
      image: "https://img.youtube.com/vi/MeW831xdOEI/maxresdefault.jpg"
    },
    {
      title: "Event",
      subtitle: "Conference 2024",
      youtubeId: "OmKc0FYU64E",
      bgColor: "bg-[#ef4444]",
      image: "https://img.youtube.com/vi/OmKc0FYU64E/maxresdefault.jpg"
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Video Background */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden">
        <video
          src="/video/ssstwitter.com_1780259371630.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center blur-md scale-110"
        />
        {/* Overlay Text */}
        <div className="absolute top-0 left-0 w-full h-[40vh] z-10 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-black/40">
          <h1 
            className="text-white drop-shadow-2xl leading-[1.1] italic lowercase font-medium" 
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 8vh, 6rem)"
            }}
          >
            hey<br />i am<br />francis david
          </h1>
        </div>
      </div>

      {/* Content that scrolls over video */}
      <div className="relative">
        {/* Spacer to allow video to show initially */}
        <div className="h-[40vh]"></div>

        {/* Main Content Section */}
        <div className="bg-white relative z-10">
          <Nav />

          {/* Projects Grid */}
          <section id="work" className="py-12">
            <div className="w-[85%] max-w-[2000px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-black">
                {projects.map((project, index) => (
                  <ProjectCard key={index} project={project} />
                ))}
              </div>
              <div className="mt-16 text-center">
                <Link 
                  to="/work" 
                  className="inline-block text-lg md:text-2xl font-bold tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  VIEW MORE WORK
                </Link>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}
