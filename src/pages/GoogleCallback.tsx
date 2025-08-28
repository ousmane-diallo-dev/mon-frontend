import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Connexion Google annulée');
          navigate('/login');
          return;
        }

        if (!code || state !== 'google_login') {
          toast.error('Erreur lors de la connexion Google');
          navigate('/login');
          return;
        }

        // Envoyer le code au backend pour échanger contre un token
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Stocker le token et les informations utilisateur
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Mettre à jour le contexte d'authentification
          login(data.user, data.token);
          
          toast.success(`Bienvenue ${data.user.nom}!`);
          
          // Rediriger selon le rôle
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          toast.error(data.message || 'Erreur lors de la connexion');
          navigate('/login');
        }
      } catch (error) {
        console.error('Erreur Google OAuth:', error);
        toast.error('Erreur de connexion');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, login]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connexion avec Google en cours...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
