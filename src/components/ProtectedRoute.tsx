import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "./Loader";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" variant="dots" />
      </div>
    );
  }
  
  // Rediriger vers la connexion si l'utilisateur n'est pas connecté
  if (!user) {
    console.log("[ProtectedRoute] Utilisateur non connecté, redirection vers /login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("[ProtectedRoute] Utilisateur connecté:", user.email, "Rôle:", user.role);
  return <Outlet />;
};

export default ProtectedRoute;