import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
    
    // Reset the button state after animation
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  const calculateDiscountedPrice = () => {
    if (product.discount_type === 'percentage') {
      return (product.price * (1 - product.discount / 100)).toFixed(2);
    }
    return (product.price - product.discount).toFixed(2);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#F5F5F3] shadow-md transition-all duration-300 hover:shadow-xl max-w-xs">

      <div>
      <div className="flex justify-center items-center">
  <img
    src={product.image}
    alt={product.name}
    className="h-80 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
  />


          {product.discount > 0 && (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
              {product.discount_type === 'percentage' 
                ? `${product.discount}% OFF`
                : `$${product.discount} OFF`
              }
            </div>
          )}
        </div>

        <div className="p-4">
          <Link 
            to={`/product/${product.id}`}
            className="block text-lg font-semibold text-gray-800 hover:text-[#5F494E] transition-colors duration-200"
          >
            {product.name}
          </Link>

          <div className="mt-2 space-y-1">
            <div className="flex items-center space-x-2">
              {product.discount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ${calculateDiscountedPrice()}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Button with Animation */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={product.quantity <= 0 || isAdding}
          className={`
            relative flex w-full items-center justify-center group overflow-hidden
            rounded-lg px-4 py-2.5 text-sm font-semibold text-white
            transition-all duration-300 ease-in-out
            ${product.quantity <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : isAdding
              ? 'bg-green-500'
              : 'bg-[#5F494E] hover:bg-[#9E6F59] shadow-md hover:shadow-lg'
            }
            transform hover:-translate-y-0.5 active:translate-y-0
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          <span className={`
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isAdding ? 'opacity-0' : 'opacity-100'}
          `}>
            <ShoppingCart className="h-5 w-5" />
            {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </span>

          {isAdding && (
            <span className="absolute inset-0 flex items-center justify-center text-white">
              Added! ✓
            </span>
          )}
          
          {/* Hover overlay effect */}
          <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10" />
        </button>
      </div>

    </div>
  );
};

export default ProductCard;