import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

export default function PresentationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (videoRef.current && audioRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current.pause();
      } else {
        videoRef.current.play();
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-[#020617] w-screen h-screen overflow-hidden relative">
      {/* 
        A tela limpa:
        Apenas o vídeo e controles invisíveis/minimalistas
      */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop 
        playsInline
      >
        <source src="/videos/daig-full-demo.webm" type="video/webm" />
      </video>

      <audio ref={audioRef} loop>
        <source src="/audio/pitch.mp3" type="audio/mpeg" />
      </audio>

      {/* 
        Overlay de Interação Inicial 
        (Navegadores bloqueiam autoplay de áudio, então precisamos de um primeiro clique)
      */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50 cursor-pointer backdrop-blur-sm transition-opacity"
          onClick={togglePlay}
        >
          <div className="w-24 h-24 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] mb-6 hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-white ml-2" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
            Clique para Iniciar a Demonstração
          </h2>
        </div>
      )}

      {/* Controles Minimalistas de Áudio (canto inferior direito) */}
      {isPlaying && (
        <button 
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-blue-400" />
          )}
        </button>
      )}
    </div>
  );
}
