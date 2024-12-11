/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked, cilLowVision, cilWarning } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkScheme.matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const data = await authService.login({ email, password })
      const { token, role, user_id, first_name, last_name, class_level } = data

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('firstName', first_name)
      localStorage.setItem('lastName', last_name)
      localStorage.setItem('userId', user_id)
      localStorage.setItem('classLevel', class_level)

      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed', err)
      setErrorMessage('Email atau password salah.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1c1e 0%, #2d3436 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        transition: 'background 0.3s ease'
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={12} md={8} lg={6} xl={5}>
            <CCard 
              className="border-0 shadow-lg rounded-4 overflow-hidden login-card"
              style={{
                backgroundColor: isDarkMode ? 'rgba(45, 52, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <CCardBody className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h1 className={`display-6 fw-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>
                    Welcome
                  </h1>
                  <p className={`${isDarkMode ? 'text-light' : 'text-medium-emphasis'}`}>
                    Sign in to continue to your account
                  </p>
                </div>

                <CForm onSubmit={handleLogin} className="needs-validation">
                  {errorMessage && (
                    <div 
                      className={`alert ${isDarkMode ? 'alert-danger bg-danger bg-opacity-10 text-danger' : 'alert-danger'}`}
                      role="alert"
                      style={{animation: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both'}}
                    >
                      <CIcon icon={cilLockLocked} className="me-2" />
                      {errorMessage}
                    </div>
                  )}

                  <CInputGroup className="mb-4">
                    <CInputGroupText 
                      className={isDarkMode ? 'bg-dark border-0' : 'bg-light border-0'}
                    >
                      <CIcon 
                        icon={cilUser} 
                        className={isDarkMode ? 'text-light' : 'text-primary'}
                      />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`custom-input border-0 ${isDarkMode ? 'bg-dark text-white' : 'bg-light'}`}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText 
                      className={isDarkMode ? 'bg-dark border-0' : 'bg-light border-0'}
                    >
                      <CIcon 
                        icon={cilLockLocked} 
                        className={isDarkMode ? 'text-light' : 'text-primary'}
                      />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`custom-input border-0 ${isDarkMode ? 'bg-dark text-white' : 'bg-light'}`}
                    />
                    <CInputGroupText 
                      onClick={togglePasswordVisibility}
                      style={{ cursor: 'pointer' }}
                      className={isDarkMode ? 'bg-dark border-0' : 'bg-light border-0'}
                    >
                      <CIcon 
                        icon={showPassword ? cilWarning : cilLowVision}
                        className={isDarkMode ? 'text-light' : 'text-primary'}
                      />
                    </CInputGroupText>
                  </CInputGroup>

                  <CButton 
                    color={isDarkMode ? 'light' : 'primary'}
                    type="submit"
                    className="w-100 py-2 btn-login"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Sign In
                  </CButton>
                </CForm>

                <div className="text-center mt-4">
                  <p className={`mb-0 ${isDarkMode ? 'text-light' : 'text-medium-emphasis'}`}>
                    © {new Date().getFullYear()} Integrity Academia
                  </p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      <style>
        {`
          .custom-input {
            transition: all 0.3s ease;
          }

          .custom-input::placeholder {
            color: ${isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'} !important;
          }

          .custom-input:focus {
            background-color: ${isDarkMode ? '#3b4147 !important' : '#ffffff !important'};
            box-shadow: none !important;
          }

          .btn-login {
            transition: all 0.3s ease;
          }

          .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .login-card {
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes fadeIn {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
        `}
      </style>
    </div>
  )
}

export default Login