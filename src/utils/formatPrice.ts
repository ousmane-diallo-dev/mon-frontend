export const formatPrice = (price: number) =>
  price.toLocaleString("fr-FR", { style: "currency", currency: "GNF" });