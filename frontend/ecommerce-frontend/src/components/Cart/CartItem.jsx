// components/Cart/CartItem.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { cartService } from '../../services/cartService';
import { fetchCart } from '../../store/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleUpdateQuantity = async (change) => {
    await cartService.updateQuantity(item.id, change);
    dispatch(fetchCart());
  };

  const handleRemove = async () => {
    await cartService.removeItem(item.id);
    dispatch(fetchCart());
  };

  const price = item.product.discount > 0 && item.product.discount_type && item.product.price
    ? (item.product.discount_type === 'percentage' 
        ? (item.product.price * (1 - item.product.discount / 100)).toFixed(2)
        : (item.product.price - item.product.discount).toFixed(2)
      )
    : item.product.price;

  return (
    <div className="py-6 first:pt-0">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {item.product.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">
              ${price}
            </span>
            {item.product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ${item.product.price}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleUpdateQuantity(-1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.quantity === 1}
            >
              -
            </button>
            <span className="px-4 py-2 text-gray-900 font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={item.product.quantity <= 0}
            >
              +
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;