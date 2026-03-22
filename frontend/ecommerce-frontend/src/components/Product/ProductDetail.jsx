import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../../store/productSlice';
import { addToCart } from '../../store/cartSlice';
import ProductReview from './ProductReview';
import productService from '../../services/productService';
import { ShoppingCart } from 'lucide-react';

const StarRating = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button" // Важливо додати type="button"
          className={`${
            star <= rating ? 'text-[#5F494E]' : 'text-gray-300'
          } hover:scale-110 transition-transform duration-200 text-2xl focus:outline-none`}
          onClick={(e) => {
            e.preventDefault(); // Запобігаємо спрацьовуванню форми
            onRatingChange(star);
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    setIsAdding(true);
    dispatch(addToCart({ productId: id, quantity }));
    
    // Симулюємо анімацію додавання
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await productService.addReview(id, { rating, comment });
      dispatch(fetchProductDetails(id));
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading || !selectedProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative group">
          <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {selectedProduct.name}
          </h1>

          {/* Price Section */}
          <div className="mb-6">
            {selectedProduct.discount > 0 && selectedProduct.discount_type && selectedProduct.price ? (
              <div className="flex items-center space-x-3">
                <del className="text-gray-400 text-xl">
                  ${selectedProduct.price}
                </del>
                <span className="text-3xl font-bold text-red-600">
                  ${selectedProduct.discount_type === 'percentage' 
                    ? (selectedProduct.price * (1 - selectedProduct.discount / 100)).toFixed(2)
                    : (selectedProduct.price - selectedProduct.discount).toFixed(2)
                  }
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                  {selectedProduct.discount_type === 'percentage' 
                    ? `${selectedProduct.discount}% OFF`
                    : `$${selectedProduct.discount} OFF`
                  }
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${selectedProduct.price}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-900 mb-8 leading-relaxed">
            {selectedProduct.description}
          </p>

          {/* Add to Cart Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 ">
            <div className="relative">
              <label htmlFor="quantity" className="sr-only">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value);
                  if (newQuantity >= 1 && newQuantity <= selectedProduct.quantity) {
                    setQuantity(newQuantity);
                  } else if (newQuantity < 1) {
                    setQuantity(1);
                  }
                }}
                className="w-full sm:w-24 px-4 py-3 border border-[B1827A] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-[#F5F5F3]"
              />
            </div>
            <div className="bg-[#89A8AE]">
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.quantity <= 0 || isAdding}
              className={`
                relative flex-1 group overflow-hidden
                px-8 py-3 rounded-lg
                text-white font-semibold
                transition-all duration-300 ease-in-out
                ${selectedProduct.quantity <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isAdding
                  ? 'bg-green-500'
                  : 'bg-[#B1827A] hover:bg-[9E6F59] shadow-lg hover:shadow-xl'
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
                <ShoppingCart className="w-5 h-5" />
                {selectedProduct.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
              {isAdding && (
                <span className="absolute inset-0 flex items-center justify-center">
                  Added! ✓
                </span>
              )}
              
              <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
            </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                selectedProduct.quantity > 0 
                  ? selectedProduct.quantity <= 5 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                  : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {selectedProduct.quantity === 0 
                  ? 'Out of stock' 
                  : selectedProduct.quantity <= 5
                  ? `Only ${selectedProduct.quantity} left in stock - order soon`
                  : `${selectedProduct.quantity} in stock`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 ">Customer Reviews</h2>
        <div className="space-y-8">
          {selectedProduct.reviews.map((review) => (
            <ProductReview key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Review Form */}
      <div className="mt-12  rounded-2xl p-8 bg-[#F5F5F3]">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 bg-[#F5F5F3]">
              Rating
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-[#F5F5F3]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#B1827A] text-white font-semibold rounded-lg hover:bg-[#9E6F59] transition-colors duration-200"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetail;