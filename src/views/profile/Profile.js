/* eslint-disable react/no-unescaped-entities */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CFormText,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilEnvelopeClosed,
  cilLockLocked,
  cilPencil,
  cilBadge,
  cilSave,
  cilX,
  cilArrowCircleLeft,
} from '@coreui/icons'
import { getUsers, updateUser } from '../../services/api'

const Profile = () => {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [alertType, setAlertType] = useState(null) // 'success' atau 'danger'
  const [alertMessage, setAlertMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
      fetchUserData(storedUserId)
    }
  }, [])

  const fetchUserData = async (id) => {
    try {
      const users = await getUsers()
      const currentUser = users.find((user) => user.user_id.toString() === id)

      if (currentUser) {
        setRole(currentUser.role)
        setFirstName(currentUser.first_name)
        setLastName(currentUser.last_name)
        setEmail(currentUser.email)
        setPassword(currentUser.decrypted_password || '')
        setProfilePicture(currentUser.class || '')
      } else {
        showAlert('danger', 'Pengguna tidak ditemukan.')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      showAlert('danger', 'Gagal mengambil data pengguna.')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type, message) => {
    setAlertType(type)
    setAlertMessage(message)
    // Hilangkan alert setelah 5 detik
    setTimeout(() => {
      setAlertType(null)
      setAlertMessage('')
    }, 5000)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'Nama depan harus diisi'
    if (!lastName.trim()) newErrors.lastName = 'Nama belakang harus diisi'
    if (!email.trim()) newErrors.email = 'Email harus diisi'
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid'
    if (password && password.length < 6) newErrors.password = 'Password minimal 6 karakter'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveChanges = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const updatedData = {
        role,
        first_name: firstName,
        last_name: lastName,
        email,
        class: profilePicture,
      }

      if (password.trim()) {
        updatedData.password = password
      }

      await updateUser(userId, updatedData)

      // Update localStorage with new name
      localStorage.setItem('firstName', firstName)
      localStorage.setItem('lastName', lastName)
      localStorage.setItem('email', email)

      showAlert('success', 'Profil berhasil diperbarui!')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error updating profile:', error)
      showAlert('danger', 'Gagal memperbarui profil. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      fetchUserData(storedUserId)
    }
  }

  if (loading) {
    return (
      <CContainer
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <CSpinner color="primary" />
      </CContainer>
    )
  }

  const getRoleLabel = (roleValue) => {
    const roles = {
      admin: 'Administrator',
      lecturer: 'Lecturer',
      student: 'Student',
    }
    return roles[roleValue] || roleValue
  }

  return (
    <div className="d-flex flex-column">
      <CContainer className="p-4">
        {/* Main Profile Card */}
        <CCard className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <CCardHeader className="bg-primary text-white p-4 border-0">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 p-3 rounded-circle me-3">
                <CIcon icon={cilUser} size="xl" className="text-white" />
              </div>
              <div>
                <h2 className="mb-1">Edit Profile</h2>
                <p className="mb-0 text-white-50">Update your personal information</p>
              </div>
            </div>
          </CCardHeader>

          <CCardBody className="p-4">
            {/* Alert Messages */}
            {alertType && (
              <CAlert color={alertType} className="d-flex align-items-center mb-4" dismissible>
                <CIcon
                  icon={alertType === 'success' ? cilSave : cilX}
                  className="flex-shrink-0 me-2"
                />
                <div>{alertMessage}</div>
              </CAlert>
            )}

            <CForm className="needs-validation">
              {/* Role Information */}
              <div className="profile-section mb-5">
                <h5 className="text-primary d-flex align-items-center mb-4">
                  <CIcon icon={cilBadge} className="me-2" />
                  Role Information
                </h5>
                <CRow>
                  <CCol lg={6}>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        backgroundColor: 'var(--bs-light)',
                        color: 'var(--bs-dark)',
                        transition: 'background-color 0.3s, color 0.3s',
                      }}
                    >
                      <CFormLabel className="mb-2">User Role</CFormLabel>
                      <CInputGroup className="mb-2">
                        <CInputGroupText
                          style={{
                            backgroundColor: 'var(--bs-light)',
                            color: 'var(--bs-dark)',
                            transition: 'background-color 0.3s, color 0.3s',
                          }}
                        >
                          <CIcon icon={cilBadge} />
                        </CInputGroupText>
                        <CFormSelect
                          disabled
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          style={{
                            backgroundColor: 'var(--bs-light)',
                            color: 'var(--bs-dark)',
                            border: '1px solid var(--bs-dark-50)',
                            transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                          }}
                        >
                          <option value="admin">Administrator</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="student">Student</option>
                        </CFormSelect>
                      </CInputGroup>
                      <CFormText className="text-muted">
                        You are registered as {getRoleLabel(role)}
                      </CFormText>
                    </div>
                  </CCol>
                </CRow>
              </div>

              {/* Personal Information */}
              <div className="profile-section mb-5">
                <h5 className="text-primary d-flex align-items-center mb-4">
                  <CIcon icon={cilUser} className="me-2" />
                  Personal Information
                </h5>
                <CRow className="g-4">
                  <CCol md={6}>
                    <CFormLabel>First Name</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText
                        style={{
                          backgroundColor: 'var(--bs-light)',
                          color: 'var(--bs-dark)',
                          transition: 'background-color 0.3s, color 0.3s',
                        }}
                      >
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        invalid={!!errors.firstName}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </CInputGroup>
                    {errors.firstName && (
                      <CFormFeedback className="d-block text-danger">
                        {errors.firstName}
                      </CFormFeedback>
                    )}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Last Name</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText
                        style={{
                          backgroundColor: 'var(--bs-light)',
                          color: 'var(--bs-dark)',
                          transition: 'background-color 0.3s, color 0.3s',
                        }}
                      >
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        invalid={!!errors.lastName}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </CInputGroup>
                    {errors.lastName && (
                      <CFormFeedback className="d-block text-danger">
                        {errors.lastName}
                      </CFormFeedback>
                    )}
                  </CCol>
                </CRow>
              </div>

              {/* Account Information */}
              <div className="profile-section mb-5">
                <h5 className="text-primary d-flex align-items-center mb-4">
                  <CIcon icon={cilEnvelopeClosed} className="me-2" />
                  Account Information
                </h5>
                <CRow className="g-4">
                  <CCol md={6}>
                    <CFormLabel>Email Address</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText
                        style={{
                          backgroundColor: 'var(--bs-light)',
                          color: 'var(--bs-dark)',
                          transition: 'background-color 0.3s, color 0.3s',
                        }}
                      >
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        invalid={!!errors.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </CInputGroup>
                    {errors.email && (
                      <CFormFeedback className="d-block text-danger">{errors.email}</CFormFeedback>
                    )}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>New Password</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText
                        style={{
                          backgroundColor: 'var(--bs-light)',
                          color: 'var(--bs-dark)',
                          transition: 'background-color 0.3s, color 0.3s',
                        }}
                      >
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        invalid={!!errors.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </CInputGroup>
                    {errors.password && (
                      <CFormFeedback className="d-block text-danger">
                        {errors.password}
                      </CFormFeedback>
                    )}
                    <CFormText>Leave blank if you don't want to change password.</CFormText>
                  </CCol>
                </CRow>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-3">
                <CButton color="light" onClick={handleReset} disabled={saving} className="px-4">
                  <CIcon icon={cilArrowCircleLeft} className="me-2" />
                  Reset
                </CButton>
                <CButton
                  color="primary"
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-4"
                >
                  {saving ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-2" />
                      Save Changes
                    </>
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CContainer>

      <style>
        {`
          .profile-section {
            transition: transform 0.2s ease;
          }
          
          .profile-section:hover {
            transform: translateY(-2px);
          }
          
          .form-control:focus {
            border-color: #556ee6;
            box-shadow: 0 0 0 0.2rem rgba(85, 110, 230, 0.25);
          }
          
          .input-group-text {
            background-color: #f8f9fa;
            border-right: none;
          }
          
          .form-control {
            border-left: none;
          }
          
          .form-control:focus + .input-group-text {
            border-color: #556ee6;
          }
          
          .btn {
            transition: all 0.2s ease;
          }
          
          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        `}
      </style>
    </div>
  )
}

export default Profile
