import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../store/authSlice';

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setFormError('The password must contain at least 5 characters');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setFormError(''); // Очищаємо помилку при зміні даних
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(login(formData));
      
      if (result.error) {
        // Обробка помилок від сервера
        const errorData = result.error.response?.data;
        let errorMessage = 'An error occurred while trying to log in';
        
        if (errorData) {
          if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors[0] 
              : errorData.non_field_errors;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        }
        
        setFormError(errorMessage);
        return;
      }
      
      navigate('/');
    } catch (err) {
      setFormError('An error occurred while trying to log in. Try again later.');
    }
  };

  // Функція для отримання тексту помилки
  const getErrorMessage = () => {
    if (formError) return formError;
    
    if (error) {
      // Якщо помилка є об'єктом
      if (typeof error === 'object') {
        if (error.non_field_errors) {
          return Array.isArray(error.non_field_errors) 
            ? error.non_field_errors[0] 
            : error.non_field_errors;
        }
        if (error.detail) {
          return error.detail;
        }
        // Якщо є інші поля з помилками
        const firstError = Object.values(error)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        return firstError;
      }
      // Якщо помилка є строкою
      return error.toString();
    }
    
    return '';
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <ErrorAlert message={getErrorMessage()} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B1827A] text-white py-2 px-4 rounded-md hover:bg-[#9E6F59]
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? 'Logging in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;