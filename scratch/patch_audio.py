import re

with open('src/modules/storefront/pages/PresentationPage.tsx', 'r') as f:
    content = f.read()

# Replace Speech API logic with Audio Sync logic
old_logic = """  // Web Speech API Narrator
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCueChange = (e: Event) => {
      if (voiceLang === 'off') return;
      
      const track = e.target as TextTrack;
      if (!track.activeCues || track.activeCues.length === 0) return;
      
      // Get the current subtitle text
      const cue = track.activeCues[0] as VTTCue;
      const text = cue.text;
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak the new subtitle
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = 1.05; // slightly faster to fit the video timing
      
      // Try to find a good native voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(voiceLang.split('-')[0]));
      if (voice) utterance.voice = voice;
      
      window.speechSynthesis.speak(utterance);
    };

    // Attach listener to all text tracks
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].addEventListener('cuechange', handleCueChange);
    }
    
    return () => {
      window.speechSynthesis.cancel();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', handleCueChange);
      }
    };
  }, [voiceLang]);
  
  // Stop TTS when video is paused
  useEffect(() => {
    if (!playing) window.speechSynthesis.cancel();
  }, [playing]);"""

new_logic = """  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Sync High-Quality Neural Audio with Video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    
    const syncAudio = () => {
      if (voiceLang === 'off') {
        audio.pause();
        return;
      }
      
      // Keep audio time in sync with video time
      if (Math.abs(audio.currentTime - video.currentTime) > 0.2) {
        audio.currentTime = video.currentTime;
      }
      
      if (playing && audio.paused) {
        audio.play().catch(e => console.error(e));
      } else if (!playing && !audio.paused) {
        audio.pause();
      }
    };
    
    video.addEventListener('timeupdate', syncAudio);
    video.addEventListener('seeked', syncAudio);
    
    return () => {
      video.removeEventListener('timeupdate', syncAudio);
      video.removeEventListener('seeked', syncAudio);
    };
  }, [playing, voiceLang]);
  
  // Update Audio source when language changes
  useEffect(() => {
    if (audioRef.current && videoRef.current) {
      if (voiceLang !== 'off') {
        audioRef.current.src = voiceLang === 'pt-BR' ? '/videos/demo-pt.mp3' : '/videos/demo-ja.mp3';
        audioRef.current.currentTime = videoRef.current.currentTime;
        if (playing) audioRef.current.play().catch(e => console.error(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [voiceLang]);"""

content = content.replace(old_logic, new_logic)

# Replace window.speechSynthesis.cancel() in the Off button
old_btn = """<button onClick={(e) => { e.stopPropagation(); setVoiceLang('off'); window.speechSynthesis.cancel(); }} style={{ background: voiceLang === 'off' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>Off</button>"""
new_btn = """<button onClick={(e) => { e.stopPropagation(); setVoiceLang('off'); }} style={{ background: voiceLang === 'off' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>Off</button>"""
content = content.replace(old_btn, new_btn)

# Add <audio ref={audioRef} /> inside the component return
old_ret = """return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', background: '#000', cursor: hovered ? 'auto' : 'none' }}
         onMouseEnter={() => setHovered(true)}"""

new_ret = """return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', background: '#000', cursor: hovered ? 'auto' : 'none' }}
         onMouseEnter={() => setHovered(true)}>
      <audio ref={audioRef} preload="auto" />"""

content = content.replace(old_ret, new_ret)

with open('src/modules/storefront/pages/PresentationPage.tsx', 'w') as f:
    f.write(content)
print("Audio patched")
