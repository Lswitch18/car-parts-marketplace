import { CalculateMetadataFunction, Composition, Series, OffthreadVideo, Audio, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, staticFile } from "remotion";
import React from "react";
import propsData from "../public/props.json";

type Effect = {
  animation_type: string;
  scale_start: number;
  scale_end: number;
  text_animation: string;
  rotate_y?: number;
};

type Scene = {
  id: string;
  voiceover: string;
  overlay_text: string;
  strategic_pause: number;
  duration_frames: number;
  audio_src: string;
  effects: Effect;
};

type Props = {
  scenes: Scene[];
};

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
    const totalDuration = propsData.scenes.reduce((acc: number, s: any) => acc + s.duration_frames, 0);
    return {
      props: { scenes: propsData.scenes as Scene[] },
      durationInFrames: totalDuration > 0 ? totalDuration : 60,
    };
};

export const MyComposition = () => {
  return (
    <Composition
      id="Main"
      component={VideoOrchestrator}
      durationInFrames={60} 
      fps={30}
      width={1280}
      height={720}
      calculateMetadata={calculateMetadata}
      defaultProps={{ scenes: [] }}
    />
  );
};

const AnimatedBadge: React.FC<{ text: string }> = ({ text }) => {
    const frame = useCurrentFrame();
    
    if(!text) return null;

    // Fade in gracefully
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const yOffset = interpolate(spring({ frame, fps: 30, config: { damping: 14 } }), [0, 1], [30, 0]);

    return (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '50px', zIndex: 50 }}>
            <div style={{
                transform: `translateY(${yOffset}px)`,
                opacity: opacity,
                fontSize: '24px',
                fontWeight: 500,
                fontFamily: '"Inter", "Roboto", sans-serif',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '1px',
                padding: '12px 24px',
                background: 'rgba(2, 6, 23, 0.65)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0, 229, 255, 0.1)',
                borderRadius: '100px',
                backdropFilter: 'blur(16px)'
            }}>
                {text}
            </div>
        </AbsoluteFill>
    );
};

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    
    // Very subtle zoom in the entire frame
    const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.05]);
    
    // Smooth 3D tilt
    let rotateY = 0;
    if (scene.effects.animation_type === '3d_tilt' && scene.effects.rotate_y) {
        rotateY = interpolate(spring({ frame, fps, config: { mass: 2, damping: 200 } }), [0, 1], [0, scene.effects.rotate_y]);
    } else {
        // Default subtle motion if no tilt
        rotateY = interpolate(frame, [0, durationInFrames], [0, 2]);
    }

    return (
        <AbsoluteFill style={{ 
            background: 'radial-gradient(circle at 50% 30%, #061838 0%, #020617 100%)',
            overflow: 'hidden' 
        }}>
            {/* Animated subtle grid or background texture could go here */}
            
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                perspective: '1500px',
                transform: `scale(${bgScale})`
            }}>
                <div style={{
                    width: '85%', height: '85%',
                    transform: `rotateY(${rotateY}deg) rotateX(1deg)`,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(0,229,255,0.1)',
                    background: '#000',
                    transition: 'transform 0.1s'
                }}>
                    <OffthreadVideo src={staticFile(`videos/${scene.id}.webm`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
            <Audio src={staticFile(`audio/${scene.id}.mp3`)} />
            <AnimatedBadge text={scene.overlay_text} />
        </AbsoluteFill>
    );
};

export const VideoOrchestrator: React.FC<Props> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) return <AbsoluteFill style={{background:'black', color: 'white', justifyContent:'center', alignItems:'center'}}>Carregando Scripts de IA...</AbsoluteFill>;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.duration_frames || 60}>
            <SceneRenderer scene={scene} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
