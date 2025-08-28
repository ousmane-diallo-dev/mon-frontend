import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { verifyPasswordResetToken, resetPassword } from "../api/axios";

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setValid(false);
        return;
      }
      try {
        setLoading(true);
        await verifyPasswordResetToken(token);
        setValid(true);
      } catch (err: any) {
        setValid(false);
        toast.error(err?.response?.data?.message || "Token invalide ou expiré");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  useEffect(() => {
    // Indicateur simple de force (longueur + diversité)
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    setStrength(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setLoading(true);
      await resetPassword(token, password, confirm);
      toast.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Lien invalide ou expiré</h2>
          <p className="text-gray-600">Veuillez refaire une demande de réinitialisation.</p>
          <Button onClick={() => navigate("/forgot-password")} className="mt-4">Nouvelle demande</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez un nouveau mot de passe
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                🔒 Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Au moins 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre"
              />
              <div className="mt-2 h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${
                    strength <= 1 ? "bg-red-500 w-1/4" : strength === 2 ? "bg-yellow-500 w-2/4" : strength === 3 ? "bg-blue-500 w-3/4" : "bg-green-500 w-full"
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
                🔐 Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Répétez le mot de passe"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading} disabled={loading || valid === false}>
            {loading ? "Réinitialisation..." : "Réinitialiser"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
