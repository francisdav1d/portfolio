'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { Instagram, Youtube, Mail } from 'lucide-react';

export function SocialLinks({ className = "" }: { className?: string }) {
  const mailTextRef = useRef<HTMLSpanElement>(null);
  const mailIconRef = useRef<HTMLDivElement>(null);
  const mailPillRef = useRef<HTMLAnchorElement>(null);

  const handleMailEnter = () => {
    gsap.to(mailIconRef.current, {
      rotation: 12,
      scale: 1.1,
      color: "#0000ff",
      duration: 0.45,
      ease: "back.out(2.5)",
      overwrite: "auto",
    });

    gsap.to(mailPillRef.current, {
      borderColor: "#0000ff",
      backgroundColor: "rgba(0, 0, 255, 0.04)",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.fromTo(mailTextRef.current,
      { 
        x: -20, 
        opacity: 0,
        maxWidth: 0,
        marginLeft: 0,
      },
      {
        x: 0,
        opacity: 1,
        maxWidth: "220px",
        marginLeft: "10px",
        paddingRight: "6px",
        duration: 0.5,
        ease: "power4.out",
        overwrite: "auto",
      }
    );
  };

  const handleMailLeave = () => {
    gsap.to(mailIconRef.current, {
      rotation: 0,
      scale: 1,
      color: "#737373", 
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(mailPillRef.current, {
      borderColor: "#e5e5e5", 
      backgroundColor: "#f5f5f5", 
      duration: 0.35,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    gsap.to(mailTextRef.current, {
      x: -15,
      maxWidth: 0,
      opacity: 0,
      marginLeft: "0px",
      paddingRight: "0px",
      duration: 0.35,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 md:gap-8 text-neutral-400 select-none ${className}`}>
      <a 
        ref={mailPillRef}
        href="mailto:hello@francisdavid.me" 
        onMouseEnter={handleMailEnter}
        onMouseLeave={handleMailLeave}
        className="flex items-center h-[46px] px-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <div ref={mailIconRef} className="text-neutral-500 flex items-center justify-center origin-center">
          <Mail size={24} strokeWidth={1.5} />
        </div>
        <span 
          ref={mailTextRef}
          className="text-xs md:text-sm font-bold font-sans tracking-tight text-neutral-800 block overflow-hidden whitespace-nowrap"
          style={{ maxWidth: 0, opacity: 0, marginLeft: 0 }}
        >
          hello@francisdavid.me
        </span>
      </a>
      <a href="https://x.com/francisdav1d" target="_blank" rel="noopener noreferrer" className="hover:text-[#0000ff] hover:scale-110 active:scale-95 transition-all duration-300">
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px] fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
      </a>
      <a href="https://www.instagram.com/francisdav1d/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0000ff] hover:scale-110 active:scale-95 transition-all duration-300">
        <Instagram size={32} strokeWidth={1.5} />
      </a>
      <a href="https://www.youtube.com/@FFrancisDavid" target="_blank" rel="noopener noreferrer" className="hover:text-[#0000ff] hover:scale-110 active:scale-95 transition-all duration-300">
        <Youtube size={34} strokeWidth={1.5} />
      </a>
      <a href="https://www.behance.net/francisdav1d" target="_blank" rel="noopener noreferrer" className="hover:text-[#0000ff] hover:scale-110 active:scale-95 transition-all duration-300">
        <svg viewBox="0 0 24 24" className="w-[32px] h-[32px] fill-current"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.824 5.232 5.326h-7.398c.116 1.949 1.674 2.87 3.522 2.87 1.499 0 2.4-1.009 2.894-1.637l.949 2.036zm-4.159-3.21c-.149-1.146-1.048-2.008-2.29-2.008-1.228 0-2.079.846-2.274 2.008h4.564zm-15.326-4.607h-4.241v10.817h4.284c1.332 0 2.405-.237 3.221-.71.815-.472 1.222-1.162 1.222-2.068 0-1.282-.705-2.049-2.115-2.302v-.108c.954-.252 1.693-.974 1.693-2.052 0-.848-.362-1.503-1.085-1.963-.724-.46-1.72-.692-2.986-.692zm-1.135 6.467h-2.106v-3.738h1.996c1.696 0 2.544.755 2.544 2.264 0 .493-.162.868-.485 1.126-.324.258-.809.387-1.455.387zm1.192 3.655h-3.298v-3.864h2.518c.843 0 1.432.148 1.767.444.335.297.502.731.502 1.303 0 1.373-.801 2.059-2.403 2.059z"/></svg>
      </a>
    </div>
  );
}
