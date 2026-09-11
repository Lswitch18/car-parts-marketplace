import json
import os

PROPS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "remotion_studio", "public", "props.json"))

class EffectAgent:
    def __init__(self):
        self.effect_map = {
            "scene1_hero": {
                "animation_type": "cinematic_pan",
                "scale_start": 1.0,
                "scale_end": 1.15,
                "text_animation": "spring_up"
            },
            "scene2_dash": {
                "animation_type": "3d_tilt",
                "rotate_y": -15, # Simula um monitor visto de lado
                "scale_start": 1.2,
                "scale_end": 1.2,
                "text_animation": "glitch"
            },
            "scene3_catalog": {
                "animation_type": "static_zoom",
                "scale_start": 1.1,
                "scale_end": 1.1,
                "text_animation": "none"
            },
            "scene4_ai": {
                "animation_type": "dynamic_focus",
                "scale_start": 1.1,
                "scale_end": 1.3, # Focus agressivo para mostrar a IA lendo os dados
                "text_animation": "neon_pulse"
            },
            "scene5_checkout": {
                "animation_type": "3d_tilt",
                "rotate_y": 10,
                "scale_start": 1.1,
                "scale_end": 1.1,
                "text_animation": "spring_up"
            }
        }

    def run(self):
        print("✨ [Effect Agent] Injetando vetores de animação, GSAP/Spring configs e tilts 3D...")
        
        with open(PROPS_PATH, "r") as f:
            data = json.load(f)
            
        for scene in data["scenes"]:
            scene["effects"] = self.effect_map.get(scene["id"], {})
            
        with open(PROPS_PATH, "w") as f:
            json.dump(data, f, indent=4)
            
        print("✅ [Effect Agent] Efeitos visuais e direções de câmera matematicamente injetados.")

if __name__ == "__main__":
    EffectAgent().run()
