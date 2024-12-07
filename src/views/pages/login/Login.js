/* eslint-disable no-undef */
import React, { useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardGroup,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
} from '@coreui/react-pro'
import { Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

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

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          {/* Ubah ukuran kolom berdasarkan viewport */}
          <CCol xs={12} sm={12} md={10} lg={8} xl={8}>
            <CCardGroup className="flex-column flex-md-row">
              {/* Card Login */}
              <CCard className="p-4 mb-3 mb-md-0">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1 className="text-center text-md-start">Login</h1>
                    <p className="text-body-secondary text-center text-md-start">
                      Sign In to your account
                    </p>
                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        {errorMessage}
                      </div>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CRow className="align-items-center">
                      <CCol xs={12} sm={6} className="mb-3 mb-sm-0">
                        <CButton color="primary" className="px-4 w-100" type="submit">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={12} sm={6} className="text-center text-sm-end">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Card Sign Up */}
              <CCard
                className="text-white bg-primary py-5"
                style={{
                  width: '100%',
                  minHeight: '200px',
                }}
              >
                <CCardBody className="text-center d-flex flex-column justify-content-center">
                  <div>
                    <h2>Sign up</h2>
                    <p className="px-2">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton
                        color="primary"
                        className="mt-3 px-4"
                        active
                        tabIndex={-1}
                        style={{
                          backgroundColor: 'white',
                          color: 'var(--cui-primary)',
                        }}
                      >
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
