import { CalculateMetadataFunction, Composition, Series, Video, Audio, spring, useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, staticFile } from "remotion";
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
      fps={60}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};

const AnimatedText: React.FC<{ text: string, type: string }> = ({ text, type }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    if(!text) return null;

    let yOffset = 0;
    let opacity = 1;
    let skew = 0;

    if (type === "spring_up") {
        yOffset = interpolate(spring({ frame, fps, config: { damping: 12 } }), [0, 1], [100, 0]);
        opacity = interpolate(frame, [0, 15], [0, 1]);
    } else if (type === "glitch") {
        skew = frame % 10 === 0 ? 15 : frame % 7 === 0 ? -15 : 0;
        opacity = frame % 5 === 0 ? 0.8 : 1;
    } else if (type === "neon_pulse") {
        opacity = interpolate(Math.sin(frame / 5), [-1, 1], [0.5, 1]);
    }

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <div style={{
                transform: `translateY(${yOffset}px) skewX(${skew}deg)`,
                opacity: opacity,
                fontSize: '100px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                color: 'white',
                textShadow: '0 0 20px #00E5FF, 0 0 40px #00E5FF',
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
            }}>
                {text}
            </div>
        </AbsoluteFill>
    );
};

const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    
    const scale = interpolate(frame, [0, durationInFrames], [scene.effects.scale_start, scene.effects.scale_end]);
    
    let rotateY = 0;
    if (scene.effects.animation_type === '3d_tilt' && scene.effects.rotate_y) {
        rotateY = interpolate(spring({ frame, fps, config: { mass: 2 } }), [0, 1], [0, scene.effects.rotate_y]);
    }

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                perspective: '1000px'
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    transform: `scale(${scale}) rotateY(${rotateY}deg)`,
                    transition: 'transform 0.1s'
                }}>
                    <Video src={staticFile(`videos/${scene.id}.webm`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
            <Audio src={staticFile(`audio/${scene.id}.mp3`)} />
            <AnimatedText text={scene.overlay_text} type={scene.effects.text_animation} />
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
