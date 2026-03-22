// components/Product/ProductList.jsx
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';

const ProductList = () => {
  const { items, loading } = useSelector((state) => state.products);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
