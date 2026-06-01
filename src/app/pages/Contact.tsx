import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';

export function Contact() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-grow">
        <section className="py-24 px-6 relative overflow-hidden bg-white">
          {/* The blue star shape */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] text-[#0000ff] transform translate-x-1/4 -translate-y-[10%] pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M 50 0 C 50 45, 55 50, 100 50 C 55 50, 50 55, 50 100 C 50 55, 45 50, 0 50 C 45 50, 50 45, 50 0 Z" />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <h2 className="text-5xl md:text-7xl font-medium mb-4 text-black">Contact</h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-800">Start a project, schedule a talk or just say hello!</p>
            
            <form className="max-w-lg space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-black">Name *</label>
                <input 
                  type="text" 
                  placeholder="Your Name..." 
                  className="w-full px-4 py-3 border border-[#0000ff] bg-transparent placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0000ff] text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-black">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="Your Email Address..." 
                  className="w-full px-4 py-3 border border-[#0000ff] bg-transparent placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0000ff] text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-black">Message *</label>
                <textarea 
                  placeholder="Your Message..." 
                  rows={5}
                  className="w-full px-4 py-3 border border-[#0000ff] bg-transparent placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0000ff] resize-none text-black"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-black">Company URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-[#0000ff] bg-transparent placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0000ff] text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-black">Time zone *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-[#0000ff] bg-transparent placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0000ff] text-black"
                />
              </div>
              
              <button 
                type="submit" 
                className="px-8 py-3 bg-[#333333] text-white font-semibold rounded hover:bg-black transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
