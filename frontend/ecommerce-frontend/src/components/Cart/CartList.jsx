// components/Cart/CartList.jsx
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../store/cartSlice';
import CartItem from './CartItem';
import { cartService } from '../../services/cartService';

const CartList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);

  const handleClearCart = async () => {
    await cartService.clearCart();
    dispatch(fetchCart());
  };

  const handlePlaceOrder = async () => {
    await cartService.placeOrder();
    dispatch(fetchCart());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const total = items.reduce((sum, item) => {
    const priceWithDiscount = item.product.discount > 0 
      ? (item.product.discount_type === 'percentage' 
          ? (item.product.price * (1 - item.product.discount / 100))
          : (item.product.price - item.product.discount)
        )
      : item.product.price;
  
    return sum + priceWithDiscount * item.quantity;
  }, 0);

  return (
    <div className="bg-[#F5F5F3] rounded-lg shadow-lg p-6">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-xl text-gray-500 font-medium">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleClearCart}
                className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Clear Cart
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 px-6 py-3 bg-[#B1827A] text-white font-medium rounded-lg hover:bg-[#9E6F59] transition-colors duration-200"
              >
                Place Order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartList;