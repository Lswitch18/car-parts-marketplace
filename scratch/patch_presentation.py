import re

with open('src/modules/storefront/pages/PresentationPage.tsx', 'r') as f:
    content = f.read()

# Add state and Speech API logic to DemoVideoPlayer
player_logic_old = """const DemoVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);"""

player_logic_new = """const DemoVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false); // Video audio
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  
  // TTS Voiceover state
  const [voiceLang, setVoiceLang] = useState<'pt-BR' | 'ja-JP' | 'off'>('pt-BR');
  
  // Web Speech API Narrator
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

content = content.replace(player_logic_old, player_logic_new)

# Add VTT tracks to video element
video_elem_old = """<source src="/videos/daig-full-demo.webm" type="video/webm" />
          <source src="/videos/daig-full-demo.mp4" type="video/mp4" />
        </video>"""

video_elem_new = """<source src="/videos/daig-full-demo.webm" type="video/webm" />
          <source src="/videos/daig-full-demo.mp4" type="video/mp4" />
          <track kind="subtitles" srcLang="pt" src="/videos/demo-pt.vtt" label="Português" default={voiceLang === 'pt-BR'} />
          <track kind="subtitles" srcLang="ja" src="/videos/demo-ja.vtt" label="日本語" default={voiceLang === 'ja-JP'} />
        </video>"""

content = content.replace(video_elem_old, video_elem_new)

# Add Narrator UI Selector inside controls overlay
controls_old = """<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>"""

controls_new = """<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Locutor IA Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 4px', fontSize: 10, fontWeight: 600 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', padding: '0 6px' }}>Narrador IA:</div>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('pt-BR'); }} style={{ background: voiceLang === 'pt-BR' ? '#00E5FF' : 'transparent', color: voiceLang === 'pt-BR' ? '#000' : 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>PT</button>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('ja-JP'); }} style={{ background: voiceLang === 'ja-JP' ? '#00E5FF' : 'transparent', color: voiceLang === 'ja-JP' ? '#000' : 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>JP</button>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('off'); window.speechSynthesis.cancel(); }} style={{ background: voiceLang === 'off' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>Off</button>
            </div>"""

content = content.replace(controls_old, controls_new)

# Update Chapters
chap_old = """const chapters = [
    { label: 'Dashboard', pct: 0 },
    { label: 'Catálogo', pct: 17 },
    { label: 'Produto', pct: 34 },
    { label: 'Upload IA', pct: 50 },
    { label: 'Chat', pct: 67 },
    { label: 'Stripe', pct: 83 },
  ];"""

chap_new = """const chapters = [
    { label: 'Cadastro', pct: 0 },
    { label: 'Dashboard', pct: 15 },
    { label: 'Catálogo', pct: 26 },
    { label: 'Produto', pct: 40 },
    { label: 'Upload IA', pct: 55 },
    { label: 'Chat', pct: 70 },
    { label: 'Stripe T+4', pct: 85 },
  ];"""

content = content.replace(chap_old, chap_new)

with open('src/modules/storefront/pages/PresentationPage.tsx', 'w') as f:
    f.write(content)

print('Patch applied successfully')
