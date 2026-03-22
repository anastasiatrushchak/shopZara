// components/Layout/Layout.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Новий контейнер із іншим фоном */}
      <div className="bg-[#89A8AE] p-4"> 
        <main className="flex-grow container mx-auto px-4 py-8 ">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};


export default Layout;