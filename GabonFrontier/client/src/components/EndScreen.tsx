import { useGame } from "@/lib/stores/useGame";
import { Button } from "./ui/button";

export default function EndScreen() {
  const phase = useGame((state) => state.phase);
  const restart = useGame((state) => state.restart);
  const enemiesKilled = useGame((state) => state.enemiesKilled);
  const totalEnemies = useGame((state) => state.totalEnemies);

  if (phase !== "victory" && phase !== "defeat") return null;

  const isVictory = phase === "victory";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="max-w-2xl bg-black/90 border-4 border-yellow-600 rounded-lg p-8 text-white text-center">
        <h1 className={`text-6xl font-bold mb-6 ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
          {isVictory ? "VICTOIRE !" : "VAINCU"}
        </h1>
        
        {isVictory ? (
          <div className="space-y-4 text-lg mb-8">
            <p className="text-yellow-200 text-2xl font-semibold">
              Le Village est Sauvé !
            </p>
            <p>
              Vous avez défendu votre patrie contre les forces coloniales avec succès. 
              Votre bravoure et votre courage ont protégé votre peuple et apporté l'honneur à la lutte pour l'indépendance.
            </p>
            <p>
              Grâce à des combattants pour la liberté comme vous, le Gabon a obtenu son indépendance le 17 août 1960, 
              devenant une nation souveraine libre de la domination coloniale.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-lg mb-8">
            <p className="text-yellow-200 text-2xl font-semibold">
              Vous Êtes Tombé
            </p>
            <p>
              Bien que vous ayez combattu courageusement, les forces coloniales étaient trop fortes cette fois-ci. 
              Mais la lutte pour la liberté continue.
            </p>
            <p>
              La lutte pour l'indépendance a exigé le sacrifice et la détermination de nombreux individus. 
              Essayez à nouveau de défendre votre village et de contribuer à la libération du Gabon.
            </p>
          </div>
        )}

        <div className="bg-gray-900/70 rounded-lg p-4 mb-6">
          <p className="text-xl font-semibold text-yellow-300">Statistiques de Mission</p>
          <p className="text-2xl mt-2">Ennemis Éliminés : {enemiesKilled}/{totalEnemies}</p>
        </div>

        <Button
          onClick={restart}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xl px-12 py-4"
        >
          Retour au Menu
        </Button>
      </div>
    </div>
  );
}
