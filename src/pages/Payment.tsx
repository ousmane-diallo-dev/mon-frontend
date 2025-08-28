import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPayment } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PaymentForm {
  numeroCarte: string;
  nomTitulaire: string;
  dateExpiration: string;
  codeSecurite: string;
  email: string;
  telephone: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: string[];
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [selectedMethod, setSelectedMethod] = useState<string>("carte");
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    numeroCarte: "",
    nomTitulaire: "",
    dateExpiration: "",
    codeSecurite: "",
    email: "",
    telephone: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [errors, setErrors] = useState<Partial<PaymentForm>>({});

  // Méthodes de paiement disponibles
  const paymentMethods: PaymentMethod[] = [
    {
      id: "carte",
      name: "Carte bancaire",
      icon: "💳",
      description: "Visa, Mastercard, American Express",
      fields: ["numeroCarte", "nomTitulaire", "dateExpiration", "codeSecurite"]
    },
    {
      id: "mobile",
      name: "Paiement mobile",
      icon: "📱",
      description: "Orange Money, MTN Mobile Money, Moov Money",
      fields: ["telephone"]
    },
    {
      id: "especes",
      name: "Espèces à la livraison",
      icon: "💵",
      description: "Paiement en espèces lors de la livraison",
      fields: []
    },
    {
      id: "virement",
      name: "Virement bancaire",
      icon: "🏦",
      description: "Virement vers notre compte bancaire",
      fields: ["email"]
    }
  ];

  useEffect(() => {
    // Récupérer les données de commande depuis le state de navigation
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
    } else {
      // Si pas de données de commande, rediriger vers le panier
      toast.error("❌ Aucune commande à payer");
      navigate("/cart");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name as keyof PaymentForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {};
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    
    if (!selectedMethodData) {
      toast.error("❌ Méthode de paiement invalide");
      return false;
    }

    // Validation selon la méthode sélectionnée
    if (selectedMethod === "carte") {
      if (!paymentForm.numeroCarte.trim()) {
        newErrors.numeroCarte = "Le numéro de carte est requis";
      } else if (!/^\d{16}$/.test(paymentForm.numeroCarte.replace(/\s/g, ""))) {
        newErrors.numeroCarte = "Le numéro de carte doit contenir 16 chiffres";
      }
      
      if (!paymentForm.nomTitulaire.trim()) {
        newErrors.nomTitulaire = "Le nom du titulaire est requis";
      }
      
      if (!paymentForm.dateExpiration.trim()) {
        newErrors.dateExpiration = "La date d'expiration est requise";
      } else if (!/^\d{2}\/\d{2}$/.test(paymentForm.dateExpiration)) {
        newErrors.dateExpiration = "Format: MM/YY";
      }
      
      if (!paymentForm.codeSecurite.trim()) {
        newErrors.codeSecurite = "Le code de sécurité est requis";
      } else if (!/^\d{3,4}$/.test(paymentForm.codeSecurite)) {
        newErrors.codeSecurite = "Le code doit contenir 3 ou 4 chiffres";
      }
    }
    
    if (selectedMethod === "mobile") {
      if (!paymentForm.telephone.trim()) {
        newErrors.telephone = "Le numéro de téléphone est requis";
      } else if (!/^\d{10}$/.test(paymentForm.telephone.replace(/\s/g, ""))) {
        newErrors.telephone = "Le numéro doit contenir 10 chiffres";
      }
    }
    
    if (selectedMethod === "virement") {
      if (!paymentForm.email.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentForm.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("❌ Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    if (!user) {
      toast.error("❌ Vous devez être connecté pour effectuer un paiement");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Vérification du montant avant envoi
      console.log("Type de montant:", typeof orderData.montantTotal, "Valeur:", orderData.montantTotal);
      if (
        typeof orderData.montantTotal !== "number" ||
        isNaN(orderData.montantTotal) ||
        orderData.montantTotal <= 0
      ) {
        toast.error("❌ Le montant de la commande est invalide.");
        setIsProcessing(false);
        return;
      }

      // N'envoie que les champs attendus par le backend
      const paymentData = {
        commande: orderData._id,
        montant: orderData.montantTotal,
        methode: selectedMethod
      };

      console.log("Données envoyées au backend:", paymentData);

      // Appeler l'API de paiement
      const response = await createPayment(paymentData);
      console.log("Paiement créé:", response.data);

      toast.success("✅ Paiement effectué avec succès !");
      
      // Rediriger vers la page de confirmation
      setTimeout(() => {
        navigate("/orders", { 
          state: { 
            paymentSuccess: true,
            orderId: orderData._id 
          }
        });
      }, 2000);
      
    } catch (error: any) {
      console.error("Erreur lors du paiement:", error);
      console.error("Erreur backend:", error.response?.data); // Affiche le message d'erreur du backend
      const errorMessage = error.response?.data?.message || "Erreur lors du paiement";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (!orderData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Chargement des informations de commande...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Paiement sécurisé</h1>
        <p className="text-gray-600">Finalisez votre commande en toute sécurité</p>
      </div>

      {/* Résumé de la commande */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">📋 Résumé de votre commande</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-700">Nombre d'articles:</p>
            <p className="font-semibold">{orderData.produits?.length || 0} article(s)</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Adresse de livraison:</p>
            <p className="font-semibold">{orderData.adresseLivraison}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Mode de livraison:</p>
            <p className="font-semibold">Standard (3-5 jours)</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Total à payer:</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(orderData.montantTotal)}</p>
          </div>
        </div>
      </div>

      {/* Sélection de la méthode de paiement */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔒 Choisissez votre méthode de paiement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {selectedMethod === "carte" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de carte *
                  </label>
                  <input
                    type="text"
                    name="numeroCarte"
                    value={paymentForm.numeroCarte}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      numeroCarte: formatCardNumber(e.target.value)
                    }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.numeroCarte ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroCarte && (
                    <p className="text-red-500 text-sm mt-1">{errors.numeroCarte}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du titulaire *
                  </label>
                  <input
                    type="text"
                    name="nomTitulaire"
                    value={paymentForm.nomTitulaire}
                    onChange={handleInputChange}
                    placeholder="Jean Dupont"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nomTitulaire ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.nomTitulaire && (
                    <p className="text-red-500 text-sm mt-1">{errors.nomTitulaire}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration *
                  </label>
                  <input
                    type="text"
                    name="dateExpiration"
                    value={paymentForm.dateExpiration}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      dateExpiration: formatExpirationDate(e.target.value)
                    }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateExpiration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateExpiration && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateExpiration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de sécurité *
                  </label>
                  <input
                    type="text"
                    name="codeSecurite"
                    value={paymentForm.codeSecurite}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.codeSecurite ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.codeSecurite && (
                    <p className="text-red-500 text-sm mt-1">{errors.codeSecurite}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "mobile" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={paymentForm.telephone}
                onChange={handleInputChange}
                placeholder="0123456789"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telephone && (
                <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Vous recevrez un SMS avec un code de confirmation
              </p>
            </div>
          )}

          {selectedMethod === "especes" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💵</span>
                <h3 className="font-semibold text-yellow-800">Paiement en espèces</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Vous paierez le montant de {formatPrice(orderData.montantTotal)} en espèces lors de la livraison.
                Aucune information de paiement n'est requise pour le moment.
              </p>
            </div>
          )}

          {selectedMethod === "virement" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de confirmation *
              </label>
              <input
                type="email"
                name="email"
                value={paymentForm.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 mb-2">Informations de virement :</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Banque :</strong> BICIGUI</p>
                  <p><strong>Compte :</strong> 1234567890</p>
                  <p><strong>IBAN :</strong> GN123 4567 8901 2345 6789 012</p>
                  <p><strong>BIC :</strong> BICIGNCI</p>
                  <p><strong>Référence :</strong> COMM-{Date.now()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de paiement */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Traitement du paiement...
                </>
              ) : (
                <>
                  💳 Payer {formatPrice(orderData.montantTotal)}
                </>
              )}
        </button>
          </div>
      </form>
      </div>

      {/* Informations de sécurité */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-green-600">🔒</span>
          <span className="font-semibold text-gray-700">Paiement 100% sécurisé</span>
        </div>
        <p className="text-sm text-gray-600">
          Vos informations de paiement sont protégées par un chiffrement SSL de niveau bancaire.
          Nous ne stockons jamais vos données de carte bancaire.
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default Payment;