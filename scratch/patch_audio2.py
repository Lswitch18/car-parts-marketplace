with open('src/modules/storefront/pages/PresentationPage.tsx', 'r') as f:
    content = f.read()

# Fix the toggle function
old_toggle = """  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };"""

new_toggle = """  const toggle = () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v) return;
    if (v.paused) { 
        v.play(); 
        if (a && voiceLang !== 'off') a.play().catch(e => console.error(e));
        setPlaying(true); 
    }
    else { 
        v.pause(); 
        if (a) a.pause();
        setPlaying(false); 
    }
  };"""
content = content.replace(old_toggle, new_toggle)

# Remove the automatic audio.play() from syncAudio to avoid DOMException
old_sync = """      if (playing && audio.paused) {
        audio.play().catch(e => console.error(e));
      } else if (!playing && !audio.paused) {
        audio.pause();
      }"""

new_sync = """      if (!playing && !audio.paused) {
        audio.pause();
      }"""
content = content.replace(old_sync, new_sync)

with open('src/modules/storefront/pages/PresentationPage.tsx', 'w') as f:
    f.write(content)
