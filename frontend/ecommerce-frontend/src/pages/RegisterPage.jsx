// pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
      <RegisterForm />
    </div>
  );
};

export default  RegisterPage;