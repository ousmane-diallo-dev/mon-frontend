import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectCartCount } from "../store/slices/cartSlice";

const CartIcon: React.FC = () => {
  const totalItems = useAppSelector(selectCartCount);

  return (
    <Link to="/cart" className="relative flex items-center">
      <span role="img" aria-label="panier" className="text-2xl">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;