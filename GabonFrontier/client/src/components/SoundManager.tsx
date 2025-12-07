import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export default function SoundManager() {
  const setBackgroundMusic = useAudio((state) => state.setBackgroundMusic);
  const setHitSound = useAudio((state) => state.setHitSound);
  const setSuccessSound = useAudio((state) => state.setSuccessSound);

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    setSuccessSound(success);

    console.log("Sound system initialized");
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
}
