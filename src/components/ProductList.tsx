// src/components/ProductList.tsx
import React, { useEffect, useState } from "react";
import { getProducts } from "../api/axios"; // ou getProduits depuis api.ts

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Liste des produits</h2>
      <ul>
        {products.map((product: any) => (
          <li key={product._id}>
            {product.name} - {product.price}€
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;