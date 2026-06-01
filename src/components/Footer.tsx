'use client';

import { Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-6 bg-white w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-10">
          <div className="flex gap-8 items-center text-gray-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
            </a>
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.824 5.232 5.326h-7.398c.116 1.949 1.674 2.87 3.522 2.87 1.499 0 2.4-1.009 2.894-1.637l.949 2.036zm-4.159-3.21c-.149-1.146-1.048-2.008-2.29-2.008-1.228 0-2.079.846-2.274 2.008h4.564zm-15.326-4.607h-4.241v10.817h4.284c1.332 0 2.405-.237 3.221-.71.815-.472 1.222-1.162 1.222-2.068 0-1.282-.705-2.049-2.115-2.302v-.108c.954-.252 1.693-.974 1.693-2.052 0-.848-.362-1.503-1.085-1.963-.724-.46-1.72-.692-2.986-.692zm-1.135 6.467h-2.106v-3.738h1.996c1.696 0 2.544.755 2.544 2.264 0 .493-.162.868-.485 1.126-.324.258-.809.387-1.455.387zm1.192 3.655h-3.298v-3.864h2.518c.843 0 1.432.148 1.767.444.335.297.502.731.502 1.303 0 1.373-.801 2.059-2.403 2.059z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <Instagram size={28} strokeWidth={1.5} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              <Youtube size={30} strokeWidth={1.5} />
            </a>
            <a href="mailto:hello@example.com" className="hover:text-black transition-colors">
              <Mail size={28} strokeWidth={1.5} />
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Copyright © 2022-2024 TempoMotions Motion designer
          </p>
        </div>
      </div>
    </footer>
  );
}
