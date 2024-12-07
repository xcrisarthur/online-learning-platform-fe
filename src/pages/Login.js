/* eslint-disable prettier/prettier */
// src/pages/Login.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Kirim request login ke backend
      const data = await authService.login({ email, password })
      const { token, user_id, role, first_name, last_name } = data
      // const token = data.token

      // Simpan token dan role ke localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('role', role) // Pastikan role disimpan
      localStorage.setItem('first_name', first_name)
      localStorage.setItem('last_name', last_name)
      localStorage.setItem('user_id', user_id)

      // Arahkan user ke dashboard setelah login berhasil
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed', err)
      setErrorMessage('Email atau password salah.')
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Masukkan email"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan password"
          />
        </div>
        <button type="submit">Login</button>
        <p>
          Belum punya akun? <a href="/register">Daftar</a>
        </p>
      </form>
    </div>
  )
}

export default Login
