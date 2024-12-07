/* eslint-disable prettier/prettier */
// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const [userData, setUserData] = useState({
    role: 'student', // Set default value to 'student'
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    class: '',
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(userData);
      // Setelah berhasil mendaftar, arahkan ke halaman login
      navigate('/');
    } catch (err) {
      console.error('Registration failed', err);
      setErrorMessage('Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nama Depan:</label>
          <input
            type="text"
            name="first_name"
            onChange={handleChange}
            placeholder="Nama Depan"
            required
          />
        </div>
        <div>
          <label>Nama Belakang:</label>
          <input
            type="text"
            name="last_name"
            onChange={handleChange}
            placeholder="Nama Belakang"
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
          >
            <option value="student">student</option>
            <option value="lecturer">lecturer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Daftar</button>
        <p>
          Sudah punya akun? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
