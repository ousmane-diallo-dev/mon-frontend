const Services = () => {
  const services = [
    { title: "Conseil technique", desc: "Accompagnement dans le choix du matériel adapté à vos besoins." },
    { title: "Installation", desc: "Réseau d’installateurs partenaires certifiés." },
    { title: "Livraison rapide", desc: "Options express et suivi en temps réel." },
    { title: "SAV & Garantie", desc: "Support réactif et pièces de rechange officielles." },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">🔧 Nos services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{s.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;


