import { useGame } from "@/lib/stores/useGame";

export default function HUD() {
  const playerHealth = useGame((state) => state.playerHealth);
  const playerMaxHealth = useGame((state) => state.playerMaxHealth);
  const currentWeapon = useGame((state) => state.currentWeapon);
  const rifleAmmo = useGame((state) => state.rifleAmmo);
  const enemiesKilled = useGame((state) => state.enemiesKilled);
  const totalEnemies = useGame((state) => state.totalEnemies);

  const healthPercentage = (playerHealth / playerMaxHealth) * 100;
  const healthColor = healthPercentage > 60 ? 'bg-green-500' : healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Health Bar - Top Left */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 min-w-64">
        <div className="text-white font-bold mb-2">SANTÉ</div>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden border-2 border-gray-500">
          <div
            className={`h-full ${healthColor} transition-all duration-300 flex items-center justify-center`}
            style={{ width: `${healthPercentage}%` }}
          >
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {playerHealth}/{playerMaxHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Objective - Top Right */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 min-w-64">
        <div className="text-yellow-300 font-bold mb-2">OBJECTIF</div>
        <div className="text-white">
          Éliminer les Forces Coloniales : {enemiesKilled}/{totalEnemies}
        </div>
      </div>

      {/* Weapon Info - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 min-w-48">
        <div className="text-white text-center">
          <div className="text-yellow-300 font-bold text-2xl mb-2">
            {currentWeapon === "rifle" ? "FUSIL" : "LANCE"}
          </div>
          {currentWeapon === "rifle" && (
            <div className="text-xl">
              <span className="font-bold">{rifleAmmo}</span> / 30
            </div>
          )}
          {currentWeapon === "spear" && (
            <div className="text-sm text-gray-300">Arme de Mêlée</div>
          )}
          <div className="text-xs text-gray-400 mt-2">Appuyez sur Q pour changer</div>
        </div>
      </div>

      {/* Crosshair - Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-8 h-8">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-white"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-0.5 bg-white"></div>
        </div>
      </div>
    </div>
  );
}
