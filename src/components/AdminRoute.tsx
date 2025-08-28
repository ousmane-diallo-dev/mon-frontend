import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { user } = useAuth();
  
  console.log("[AdminRoute] Vérification de l'accès admin");
  console.log("[AdminRoute] User:", user);
  console.log("[AdminRoute] User role:", user?.role);
  
  if (!user) {
    console.log("[AdminRoute] Pas d'utilisateur, redirection vers /login");
    return <Navigate to="/login" />;
  }
  
  if (user.role !== "admin") {
    console.log("[AdminRoute] Utilisateur non admin, redirection vers /");
    return <Navigate to="/" />;
  }
  
  console.log("[AdminRoute] Accès admin autorisé, affichage du composant");
  return <Outlet />;
};

export default AdminRoute;