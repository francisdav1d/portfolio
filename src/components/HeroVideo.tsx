'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Autoplay may already have started before React attached the playing handler.
    const video = videoRef.current;
    if (video && !video.paused && video.readyState >= 2) setPlaying(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* A real image stays visible while autoplay is buffering or unavailable. */}
      <img
        src="/video/poster.jpg"
        alt=""
        fetchPriority="high"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        style={{ filter: 'url(#directional-blur)' }}
      />
      <video
        ref={videoRef}
        src="/video/Portfolio_compressed.mp4"
        poster="/video/poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onPlaying={() => setPlaying(true)}
        onEmptied={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        style={{ filter: 'url(#directional-blur)', opacity: playing ? 1 : 0 }}
      />
    </div>
  );
}
