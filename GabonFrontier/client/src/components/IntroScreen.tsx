import { useGame } from "@/lib/stores/useGame";
import { Button } from "./ui/button";

export default function IntroScreen() {
  const start = useGame((state) => state.start);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-green-900 via-yellow-800 to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-4xl bg-black/80 backdrop-blur-sm rounded-lg p-8 text-white h-screen max-h-screen overflow-y-auto">
        <h1 className="text-5xl font-bold mb-6 text-center text-yellow-300">
          Combattant pour la Liberté : Gabon 1960
        </h1>
        
        <div className="space-y-4 text-lg mb-8">
          <p className="text-yellow-200 font-semibold text-center text-xl mb-4">
            La Lutte pour l'Indépendance
          </p>
          
          <p>
            À la fin des années 1950 et au début des années 1960, le Gabon s'est battu pour son indépendance face au régime colonial français. 
            Après des décennies d'exploitation et de suppression culturelle, le peuple gabonais a exigé sa 
            liberté et sa souveraineté.
          </p>
          
          <p>
            Le 17 août 1960, le Gabon a officiellement obtenu son indépendance de la France, devenant une nation souveraine. 
            Cette lutte faisait partie d'une vague plus large de décolonisation en Afrique, où les nations ont repris 
            leur autonomie et leur identité culturelle.
          </p>
          
          <p className="text-yellow-200">
            Vous incarnez un citoyen tribal gabonais défendant votre patrie et luttant pour la liberté. 
            Armé d'armes traditionnelles et de fusils capturés, vous devez protéger votre village contre les forces coloniales.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Contrôles</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-yellow-200">Mouvement</p>
              <p>W/A/S/D ou Touches Flèches</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-200">Regarder Autour</p>
              <p>Souris</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-200">Tirer/Attaquer</p>
              <p>Clic Gauche</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-200">Changer d'Arme</p>
              <p>Touche Q</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-200">Sauter</p>
              <p>Barre d'Espace</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-200">Lancer Grenade</p>
              <p>Touche E</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="font-semibold">Objectif de Mission :</p>
          <p>Défendez votre village en éliminant toutes les forces coloniales (0/5 ennemis)</p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={start}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xl px-12 py-6"
          >
            Commencer la Mission
          </Button>
        </div>
      </div>
    </div>
  );
}
