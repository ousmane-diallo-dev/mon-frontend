import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectCartCount } from "../store/slices/cartSlice";
import { ShoppingCart } from "lucide-react";

const CartIcon: React.FC = () => {
  const totalItems = useAppSelector(selectCartCount);

  return (
    <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
      <ShoppingCart className="w-6 h-6 text-gray-600" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;