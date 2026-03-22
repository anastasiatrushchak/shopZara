// components/Product/ProductReview.jsx
const ProductReview = ({ review }) => {
  return (
    <div className="border-b py-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`text-xl ${
                index < review.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      <p>{review.comment}</p>
    </div>
  );
};

export default ProductReview;