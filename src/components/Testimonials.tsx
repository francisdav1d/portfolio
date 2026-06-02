'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VerifiedBadge = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#3ea6ff] fill-current inline-block ml-1" aria-hidden="true">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1L7 11.8l2.8 2.7L17 7.4l1.4 1.4-8.6 8.5z" />
  </svg>
);

const testimonials = [
  {
    name: "FootballExplained",
    subs: "6.49K subscribers",
    text: "“Good communication, very clear and good editing. Knows exactly what's been asked. Great person to ❤️”",
    avatar: "https://ui-avatars.com/api/?name=Football&background=fff&color=000&size=100&rounded=true&font-size=0.6",
  },
  {
    name: "Jose's Tech",
    subs: "1.68K subscribers",
    text: "“Francis is punctual, open to make revisions, and has a lot of skills in editing. The only issue I've found with him was that communication is sometimes hard because his English needs work. Other than that, once he understands he does an amazing job in editing. Overall, a great and talented editor.”",
    avatar: "https://ui-avatars.com/api/?name=JT&background=333&color=fff&size=100&rounded=true",
  },
  {
    name: "MagicHustler",
    subs: "47 subscribers",
    text: "“Francis totally killed it with the video editing - way better than I expected! Seriously recommend hiring him if you need video work done. He's legit good at what he does.”",
    avatar: "https://ui-avatars.com/api/?name=MH&background=ffd700&color=000&size=100&rounded=true",
  }
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.testimonial-item');

    gsap.fromTo(items,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%",
        }
      }
    );
  }, []);

  return (
    <section id="testimonials" className="py-16 md:py-20 lg:py-24 bg-white text-black w-full border-t border-neutral-100 flex flex-col justify-center relative">
      <div className="w-[90%] md:w-[95%] lg:w-[90%] max-w-[1600px] mx-auto" ref={containerRef}>

        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-sm font-bold tracking-[0.2em] text-[#0000ff] uppercase mb-4">
            Testimonials
          </h2>
          <h3 className="font-yd text-4xl md:text-5xl lg:text-6xl text-black">
            Client Feedback.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-item bg-neutral-50 border border-neutral-200 rounded-3xl p-8 md:p-10 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">

              {/* Header: Avatar + Info */}
              <div className="flex gap-4 md:gap-5 items-center mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h4 className="font-sans font-bold text-[16px] md:text-[18px] text-black tracking-tight">
                      {t.name}
                    </h4>
                    <VerifiedBadge />
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="flex-grow">
                <p className="font-sans text-[15px] md:text-[17px] leading-relaxed text-neutral-700 font-medium italic">
                  {t.text}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
