import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

import { useI18n } from '@/modules/shared/lib/i18n';

export default function PresentationPage() {
  const { language } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync audio source based on language
  const audioSrc = language === 'pt' ? '/audio/pitch_pt.mp3' : '/audio/pitch_ja.mp3';
  const overlayText = language === 'pt' ? 'Clique para Iniciar a Demonstração' : 'クリックしてデモを開始';

  useEffect(() => {
    // Se o áudio já estiver tocando e o idioma mudar, o src muda
    // O navegador deve carregar o novo áudio
    if (audioRef.current && isPlaying) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.load();
      if (wasPlaying) {
         audioRef.current.play().catch(() => {});
      }
    }
  }, [audioSrc]);

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

      <audio ref={audioRef} loop key={audioSrc}>
        <source src={audioSrc} type="audio/mpeg" />
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
          <div className="w-24 h-24 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.5)] mb-6 hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-white ml-2" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]">
            {overlayText}
          </h2>
        </div>
      )}

      {/* Controles Minimalistas de Áudio (canto inferior direito) */}
      {isPlaying && (
        <button 
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-black/80 hover:border-[#00E5FF] transition-all shadow-[0_0_15px_rgba(0,229,255,0)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          )}
        </button>
      )}
    </div>
  );
}
