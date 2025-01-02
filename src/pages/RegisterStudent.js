/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { createUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RegisterStudent = () => {
  const navigate = useNavigate();
  // State untuk form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    classLevel: '' // 'junior' atau 'general'
  });

  // State untuk error dan loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.classLevel) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid');
      setLoading(false);
      return;
    }

    try {
      // Kirim data ke API
      await createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: 'student', // Set static role
        class_level: formData.classLevel
      });

      // Redirect ke halaman login setelah berhasil
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pendaftaran Siswa Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan lengkapi data diri Anda
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nama Depan
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nama Belakang
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700">
                Pilih Kelas
              </label>
              <select
                id="classLevel"
                name="classLevel"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.classLevel}
                onChange={handleChange}
              >
                <option value="">Pilih Level Kelas</option>
                <option value="junior">Junior</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center mt-4">
          <p className="text-gray-600">
            Sudah punya akun?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;