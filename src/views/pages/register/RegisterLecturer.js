/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser, createEnrollment } from '../../../services/api'
import bcrypt from 'bcryptjs'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilLowVision, cilViewStream } from '@coreui/icons'

const RegisterLecturer = () => {
  const navigate = useNavigate()
  // State untuk form inputs
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    classLevel: '', // 'junior' atau 'general'
    password: '',
    confirmPassword: '',
  })

  // Tambahkan state untuk password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // State untuk error dan loading
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Tambahkan toggle handler
  const togglePassword = () => setShowPassword(!showPassword)
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword)

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validasi form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      // !formData.classLevel ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Semua field harus diisi')
      setLoading(false)
      return
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid')
      setLoading(false)
      return
    }

    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    try {
      // Hash password sebelum mengirim ke API
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(formData.password, salt)

      // Kirim data ke API dengan password yang sudah di-hash
      const newUser = await createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: 'lecturer',
        class_level: 'general',
        password: hashedPassword, // Menggunakan password yang sudah di-hash
      })

      if (newUser && newUser.user_id) {
        await createEnrollment({
          student_id: newUser.user_id,
          assignedBy: 1, // Set static assignedBy ke 1
          course_id: 1, // Assuming course_id is 1
        })
      }

      // Redirect ke halaman login setelah berhasil
      navigate('/login')
    } catch (error) {
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1 className="text-center mb-4">Pendaftaran Akun</h1>
                  <p className="text-medium-emphasis text-center mb-4">
                    Silakan lengkapi data diri Anda
                  </p>

                  {error && (
                    <CAlert color="danger" className="mb-4" dismissible>
                      {error}
                    </CAlert>
                  )}

                  <div className="mb-3">
                    <CFormInput
                      placeholder="Nama Depan"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      placeholder="Nama Belakang"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    />
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    />
                  </div>

                  {/* <div className="mb-4 p-3 border rounded">
                    <h6 className="mb-3 fw-bold">Informasi Level Kelas:</h6>
                    <p className="small mb-2">
                      <strong>Junior:</strong> Konten yang lebih sederhana dan mudah dipahami oleh pelajar usia remaja.
                    </p>
                    <p className="small mb-0">
                      <strong>General:</strong> Konten yang lebih mendalam dan komprehensif yang sesuai untuk mahasiswa, 
                      orang dewasa, dan kalangan profesional.
                    </p>
                  </div> */}

                  {/* <div className="mb-4">
                    <CFormSelect
                      id="classLevel"
                      name="classLevel"
                      value={formData.classLevel}
                      onChange={handleChange}
                      required
                      className="form-control-lg"
                    >
                      <option value="">Pilih Level Kelas</option>
                      <option value="junior">Junior</option>
                      <option value="general">General</option>
                    </CFormSelect>
                  </div> */}

                  <div className="mb-3">
                    <div className="input-group">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-control-lg"
                      />
                      <CButton
                        type="button"
                        color="secondary"
                        variant="outline"
                        onClick={togglePassword}
                        className="px-3"
                      >
                        <CIcon icon={showPassword ? cilLowVision : cilViewStream} size="lg" />
                      </CButton>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="input-group">
                      <CFormInput
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="form-control-lg"
                      />
                      <CButton
                        type="button"
                        color="secondary"
                        variant="outline"
                        onClick={toggleConfirmPassword}
                        className="px-3"
                      >
                        <CIcon
                          icon={showConfirmPassword ? cilLowVision : cilViewStream}
                          size="lg"
                        />
                      </CButton>
                    </div>
                  </div>

                  <div className="d-grid">
                    <CButton color="success" type="submit" disabled={loading} className="px-4">
                      {loading ? 'Mendaftar...' : 'Daftar'}
                    </CButton>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-medium-emphasis">
                      Sudah punya akun?{' '}
                      <a href="/login" className="text-decoration-none">
                        Login di sini
                      </a>
                    </p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default RegisterLecturer
