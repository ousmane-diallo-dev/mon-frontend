import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { requestPasswordReset, cancelPasswordReset } from "../api/axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Email invalide");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);
      await requestPasswordReset(trimmed);
      setRequested(true);
      toast.success("Lien de réinitialisation envoyé. Vérifiez votre email.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erreur lors de la demande";
      setRequested(false);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await cancelPasswordReset(email);
      setRequested(false);
      toast.success("Demande de réinitialisation annulée.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header simple */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire simple */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form className="space-y-4" onSubmit={handleRequest}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <span>Envoyer le lien</span>
                )}
              </button>

              {requested && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md border border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler la demande
                </button>
              )}
            </div>
          </form>

          {/* Messages de statut */}
          {requested && !serverError && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-green-800">Lien envoyé avec succès !</p>
                  <p className="text-sm text-green-600">Vérifiez votre boîte de réception.</p>
                </div>
              </div>
            </div>
          )}
          
          {serverError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <p className="font-medium text-red-800">Erreur</p>
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Lien de retour */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
