const About = () => (
  <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
    <h1 className="text-3xl font-bold mb-6 text-blue-900">À propos d’ElectroPro Guinée</h1>
    <p className="mb-4 text-gray-700">
      <strong>ElectroPro Guinée</strong> est votre partenaire de confiance pour l’achat de matériel électrique en Guinée, destiné aux professionnels et aux particuliers.
    </p>
    <p className="mb-4 text-gray-700">
      Nous proposons tout le nécessaire pour vos installations électriques : prises, câbles, interrupteurs, disjoncteurs, tableaux électriques, domotique, outillage, accessoires et équipements de protection.
    </p>
    <ul className="list-disc pl-6 mb-4 text-gray-700">
      <li>Large choix de produits adaptés à tous les besoins et tous les projets</li>
      <li>Matériel certifié pour installations domestiques et industrielles</li>
      <li>Service client réactif et professionnel</li>
      <li>Accompagnement personnalisé pour vos projets électriques</li>
      <li>Livraison rapide partout en Guinée</li>
    </ul>
    <p className="mb-4 text-gray-700">
      Basés à Conakry, nous travaillons avec les plus grandes marques pour garantir la qualité et la sécurité de vos installations électriques.
    </p>
    <div className="mt-8 text-blue-900 font-semibold">
      Pour toute question ou demande de devis, <a href="/contact" className="underline text-blue-700 hover:text-blue-900">contactez-nous</a>.
    </div>
  </div>
);

export default About;