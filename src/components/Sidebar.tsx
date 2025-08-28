import { Link } from "react-router-dom";

const Sidebar = () => (
  <aside className="bg-blue-50 p-6 rounded-lg shadow w-full md:w-64">
    <nav className="flex flex-col gap-4">
      <Link to="/admin" className="font-semibold text-blue-900 hover:underline">Dashboard</Link>
      <Link to="/UserList" className="font-semibold text-blue-900 hover:underline">Utilisateurs</Link>
      <Link to="/category" className="font-semibold text-blue-900 hover:underline">Catégories</Link>
      <Link to="/products" className="font-semibold text-blue-900 hover:underline">Produits</Link>
      <Link to="/orders" className="font-semibold text-blue-900 hover:underline">Commandes</Link>
    </nav>
  </aside>
);

export default Sidebar;