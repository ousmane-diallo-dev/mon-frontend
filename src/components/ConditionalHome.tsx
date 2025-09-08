import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from '../pages/HomePage';

const ConditionalHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers /products (catalogue)
    if (user) {
      navigate('/products', { replace: true });
    }
  }, [user, navigate]);

  // Si non connecté, afficher la HomePage
  return user ? null : <HomePage />;
};

export default ConditionalHome;
