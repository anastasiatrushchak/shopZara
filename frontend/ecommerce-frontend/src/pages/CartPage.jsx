// pages/CartPage.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import CartList from '../components/Cart/CartList';

const CartPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <CartList />
      <div className="h-[80px]"></div>
    </div>
  );
};

export default CartPage;