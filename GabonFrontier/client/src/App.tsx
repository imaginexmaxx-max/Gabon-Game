import { useEffect, useState } from "react";
import { useGame } from "./lib/stores/useGame";
import IntroScreen from "./components/IntroScreen";
import GameScene from "./components/GameScene";
import HUD from "./components/HUD";
import EndScreen from "./components/EndScreen";
import SoundManager from "./components/SoundManager";
import "@fontsource/inter";

function App() {
  const phase = useGame((state) => state.phase);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showCanvas && (
        <>
          {phase === "intro" && <IntroScreen />}
          
          {phase === "playing" && (
            <>
              <GameScene />
              <HUD />
            </>
          )}
          
          {(phase === "victory" || phase === "defeat") && (
            <>
              <GameScene />
              <EndScreen />
            </>
          )}
          
          <SoundManager />
        </>
      )}
    </div>
  );
}

export default App;
