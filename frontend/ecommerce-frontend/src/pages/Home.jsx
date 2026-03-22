import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import ProductCard from '../components/Product/ProductCard';
import productService from '../services/productService';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'; // Додано іконки стрілок

const Home = () => {
  const dispatch = useDispatch();
  // ДОДАНО: Очікуємо 'count' з Redux для розрахунку загальної кількості сторінок
  const { items, loading, count } = useSelector((state) => state.products);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort_field: '',
    sort_order: 'asc',
    page: 1, // ДОДАНО: параметр сторінки, за замовчуванням 1
  });

  const [categories, setCategories] = useState([]);

  // Розрахунок загальної кількості сторінок (по 10 на сторінку)
  const totalPages = Math.ceil((count || 0) / 10);

  const updateProducts = () => {
    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
    dispatch(fetchProducts(params));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadCategories();
  }, []);

  // ДОДАНО: filters.page у масив залежностей
  useEffect(() => {
    updateProducts();
  }, [dispatch, filters.category, filters.sort_field, filters.sort_order, filters.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
      page: 1, // ДОДАНО: Скидаємо сторінку на 1 при будь-якій зміні фільтрів
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Скидаємо сторінку на 1 при новому пошуку
      setFilters((prev) => ({ ...prev, page: 1 }));
      updateProducts();
    }
  };

  // ДОДАНО: Функція для зміни сторінки
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокрутка вгору при зміні сторінки
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EECEC1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
             Products
          </h1>

          {/* Search Bar */}
          <div className="relative flex items-center">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleFilterChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-[#F5F5F3] bg-[#F5F5F3] rounded-lg focus:ring-2 focus:gray-600 focus:border-transparent outline-none transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 p-2 rounded-lg bg-[#F5F5F3] border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`mb-8 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="bg-[#B1827A] p-4 rounded-lg shadow-sm border border-[#B1827A]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2 ">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-200 bg-[#F5F5F3] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="" style={{ backgroundColor: '#F5F5F3' }}>All Categories</option>
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                      style={{ backgroundColor: '#F5F5F3' }}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Sort By
                </label>
                <select
                  name="sort_field"
                  value={filters.sort_field}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-200 bg-[#F5F5F3] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Default</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2 ">
                  Order
                </label>
                <select
                  name="sort_order"
                  value={filters.sort_order}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-200 bg-[#F5F5F3] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* ДОДАНО: Перевірка, щоб уникнути помилок, якщо items undefined */}
            {items && items.length > 0 ? (
              items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!loading && (!items || items.length === 0) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* ДОДАНО: Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                filters.page === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#B1827A] text-white hover:bg-opacity-90'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-gray-800 font-medium">
              Page {filters.page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === totalPages}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                filters.page === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#B1827A] text-white hover:bg-opacity-90'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;