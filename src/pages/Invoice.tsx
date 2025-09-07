import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getInvoice } from "../api/axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = () => {
  const location = useLocation();
  const [search] = useSearchParams();
  const orderId = search.get('orderId');
  const [invoice, setInvoice] = useState<any>((location.state as any)?.invoice || null);

  useEffect(() => {
    (async () => {
      if (invoice || !orderId) return;
      try {
        const res = await getInvoice(orderId);
        const order = res.data?.data || res.data;
        const inv = {
          id: `FA-${String(order._id).slice(-8).toUpperCase()}`,
          date: new Date(order.createdAt || order.dateCommande || Date.now()).toLocaleDateString(),
          customer: { name: `${order.client?.prenom || ''} ${order.client?.nom || ''}`.trim() || 'Client', email: order.client?.email || '' },
          items: (order.produits || []).map((it: any) => ({ nom: it.produit?.nom, quantite: it.quantite, prix: it.prixUnitaire })),
          total: order.montantTotal || 0,
        };
        setInvoice(inv);
      } catch {
        setInvoice({ id: "FA-0001", date: new Date().toLocaleDateString(), customer: { name: "Client", email: "" }, items: [], total: 0 });
      }
    })();
  }, [orderId, invoice]);

  const data = invoice || { id: "FA-0001", date: new Date().toLocaleDateString(), customer: { name: "Client", email: "" }, items: [], total: 0 };

  const exportToPDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`Facture-${data.id}.pdf`);
  };

  return (
    <>
      <style>{`
        @media print {
          header, .header, nav, .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="w-full min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="no-print flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🧾 Facture {data.id}</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              <button 
                onClick={exportToPDF} 
                className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter PDF
              </button>
            </div>
          </div>

          <div id="invoice-content" className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
            {/* En-tête de la facture */}
            <div className="mb-8 border-b-2 border-blue-600 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src="/electropro-chic-logo.svg" alt="ElectroPro" className="w-16 h-16" />
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600">ElectroPro</h2>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Matériel Électrique Professionnel</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">📍 Conakry, République de Guinée</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">📞 +224 625 14 74 22</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">✉️ electroproguinee@gmail.com</p>
                    </div>
                  </div>
                </div>
                <div className="text-right bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-blue-600 mb-2">FACTURE</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-semibold">N°:</span> {data.id}</p>
                    <p className="text-sm"><span className="font-semibold">Date:</span> {data.date}</p>
                    <p className="text-sm"><span className="font-semibold">Client:</span> {data.customer.name}</p>
                    {data.customer.email && <p className="text-sm"><span className="font-semibold">Email:</span> {data.customer.email}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Détail des articles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 rounded-l-lg">Produit</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Quantité</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Prix unitaire</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-right rounded-r-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p>Aucun article dans cette facture</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.items.map((it: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{it.nom}</td>
                          <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{it.quantite}</td>
                          <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{it.prix.toLocaleString()} GNF</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">{(it.prix * it.quantite).toLocaleString()} GNF</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Sous-total:</span>
                      <span className="font-medium">{Number(data.total).toLocaleString()} GNF</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">TVA (0%):</span>
                      <span className="font-medium">0 GNF</span>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">TOTAL:</span>
                        <span className="text-xl font-bold text-blue-600">{Number(data.total).toLocaleString()} GNF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de page avec slogan */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Merci pour votre confiance ! Conservez cette facture pour vos dossiers.
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg inline-block">
                <p className="font-bold text-lg">⚡ ElectroPro - Votre énergie, notre expertise ! ⚡</p>
                <p className="text-sm opacity-90">"L'excellence électrique à votre service"</p>
              </div>
            </div>
          </div>

          <div className="no-print mt-8">
            <Link 
              to="/orders" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux commandes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoice;


