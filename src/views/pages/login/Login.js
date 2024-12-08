/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
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
import { cilUser, cilLockLocked, cilMoon, cilSun } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const handleLogin = async (e) => {
    e.preventDefault()
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
    }
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`min-vh-100 d-flex align-items-center ${darkMode ? 'dark-mode' : ''}`}
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #667eea 0%, #448BA0FF 100%)'
          : 'linear-gradient(135deg, #1a1c1e 0%, #2d3436 100%)',
        animation: 'gradientBG 15s ease infinite'
      }}>
      <CButton
        onClick={toggleTheme}
        className="position-fixed top-0 end-0 m-3 rounded-circle p-3"
        style={{
          background: darkMode ? '#2d3436' : '#ffffff',
          border: 'none',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CIcon 
          icon={darkMode ? cilSun : cilMoon} 
          size="xl"
          className={darkMode ? 'text-white' : 'text-dark'}
        />
      </CButton>

      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={12} md={8} lg={6} xl={5}>
            <CCard className={`border-0 shadow-lg rounded-4 overflow-hidden ${darkMode ? 'bg-dark' : ''}`}>
              <CCardBody className="p-5">
                <div className="text-center mb-4">
                  <h1 className={`display-6 fw-bold mb-2 ${darkMode ? 'text-white' : 'text-primary'}`}>
                    Welcome
                  </h1>
                  <p className={darkMode ? 'text-light' : 'text-muted'}>
                    Sign in to continue to your account
                  </p>
                </div>

                <CForm onSubmit={handleLogin} className="needs-validation">
                  {errorMessage && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert"
                         style={{animation: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both'}}>
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {errorMessage}
                    </div>
                  )}

                  <CInputGroup className="mb-4">
                    <CInputGroupText className={darkMode ? 'bg-secondary border-0' : 'bg-light border-0'}>
                      <CIcon icon={cilUser} size="lg" className={darkMode ? 'text-light' : 'text-primary'} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`border-0 border-start ps-2 ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText className={darkMode ? 'bg-secondary border-0' : 'bg-light border-0'}>
                      <CIcon icon={cilLockLocked} size="lg" className={darkMode ? 'text-light' : 'text-primary'} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`border-0 border-start ps-2 ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </CInputGroup>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CButton 
                      color={darkMode ? 'light' : 'primary'}
                      type="submit"
                      className="px-4 py-2 w-100"
                      style={{
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
                      }}>
                      Sign In
                    </CButton>
                  </div>
                </CForm>

                <div className="text-center mt-4">
                  <p className={`mb-0 ${darkMode ? 'text-light' : 'text-muted'}`}>
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
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }

          .form-control:focus {
            box-shadow: none !important;
            border-color: ${darkMode ? '#6c757d' : '#4f5d73'} !important;
          }

          .dark-mode .form-control::placeholder {
            color: #adb5bd !important;
          }

          .dark-mode .form-control:focus {
            background-color: #495057 !important;
          }
        `}
      </style>
    </div>
  )
}

export default Login
