/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/api'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Set default role to student
    class_level: '', // For class selection
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.class_level) {
      setError('Please select a class level')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const registrationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        class_level: formData.class_level,
      }

      await authService.register(registrationData)
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center p-3">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={12} md={9} lg={7} xl={6}>
            <CCard className="mx-2 mx-md-4">
              <CCardBody className="p-3 p-md-4">
                <CForm onSubmit={handleSubmit}>
                  <h1 className="text-center text-md-start mb-4">Register</h1>
                  <p className="text-body-secondary text-center text-md-start mb-4">
                    Create your account
                  </p>

                  {error && (
                    <CAlert 
                      color="danger" 
                      dismissible 
                      onClose={() => setError('')}
                      className="mb-4"
                    >
                      {error}
                    </CAlert>
                  )}

                  <div className="mb-4">
                    {/* First Name */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </CInputGroup>

                    {/* Last Name */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </CInputGroup>

                    {/* Email */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>@</CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </CInputGroup>

                    {/* Password */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </CInputGroup>

                    {/* Confirm Password */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Confirm password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </CInputGroup>
                  </div>

                  {/* Class Level Information */}
                  <CContainer className="border p-3 mb-4 rounded">
                    <h6 className="mb-3 fw-bold">Class Level Information:</h6>
                    <p className="small mb-2">
                      <strong>Junior:</strong> Konten yang lebih sederhana dan mudah dipahami oleh pelajar usia remaja.
                    </p>
                    <p className="small mb-0">
                      <strong>General:</strong> Konten yang lebih mendalam dan komprehensif yang sesuai untuk mahasiswa, 
                      orang dewasa, dan kalangan profesional.
                    </p>
                  </CContainer>

                  {/* Class Level Selection */}
                  <CInputGroup className="mb-4">
                    <CInputGroupText className="flex-nowrap">Class Level</CInputGroupText>
                    <CFormSelect
                      name="class_level"
                      value={formData.class_level}
                      onChange={handleInputChange}
                      required
                      className="form-control-lg"
                    >
                      <option value="">Select Class Level</option>
                      <option value="junior">Junior</option>
                      <option value="general">General</option>
                    </CFormSelect>
                  </CInputGroup>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <CButton 
                      color="success" 
                      type="submit" 
                      disabled={isLoading}
                      size="lg"
                      className="px-4"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </CButton>
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

export default Register
