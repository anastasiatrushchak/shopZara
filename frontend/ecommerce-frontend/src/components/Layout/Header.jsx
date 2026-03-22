import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { 
  ShoppingCart, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  Store 
} from 'lucide-react';

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Логіка для отримання даних про користувача
    }
  }, [dispatch]);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3  ">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold f">
            
            <span>Zara</span>
          </Link>
          <div className="flex items-center space-x-6">
            
            
            {user || localStorage.getItem('token') ? (
              <>
                <Link 
                  to="/cart" 
                  className="hover:text-[#5F494E] flex items-center space-x-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  
                </Link>
                <Link 
                  to="/profile" 
                  className="hover:text-[#5F494E] flex items-center space-x-1"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-[#5F494E] flex items-center space-x-1"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-[#5F494E] flex items-center space-x-1"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className="hover:text-[#5F494E] flex items-center space-x-1"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;