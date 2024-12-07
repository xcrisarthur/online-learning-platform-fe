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
      lecturer: 'Dosen',
      student: 'Mahasiswa',
    }
    return roles[roleValue] || roleValue
  }

  return (
    <CContainer className="py-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <CIcon icon={cilUser} size="xl" className="me-2" />
          <h4 className="mb-0">Edit Profil Pengguna</h4>
        </CCardHeader>
        <CCardBody>
          {alertType && (
            <CAlert color={alertType} className="d-flex align-items-center">
              {alertType === 'success' ? (
                <CIcon icon={cilSave} className="flex-shrink-0 me-2" />
              ) : (
                <CIcon icon={cilX} className="flex-shrink-0 me-2" />
              )}
              {alertMessage}
            </CAlert>
          )}

          <CForm>
            {/* Role Information */}
            <CCard className="mb-4 border-secondary">
              <CCardHeader className="bg-light">
                <CIcon icon={cilBadge} className="me-2" />
                Informasi Peran
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <CFormLabel htmlFor="role">Peran Pengguna</CFormLabel>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilBadge} />
                      </CInputGroupText>
                      <CFormSelect
                        disabled
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="admin">Administrator</option>
                        <option value="lecturer">Dosen</option>
                        <option value="student">Mahasiswa</option>
                      </CFormSelect>
                    </CInputGroup>
                    <CFormText>Anda terdaftar sebagai {getRoleLabel(role)}</CFormText>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Personal Information */}
            <CCard className="mb-4 border-secondary">
              <CCardHeader className="bg-light">
                <CIcon icon={cilPencil} className="me-2" />
                Informasi Pribadi
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="firstName">Nama Depan</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        id="firstName"
                        invalid={!!errors.firstName}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Masukkan nama depan"
                      />
                      <CFormFeedback invalid>{errors.firstName}</CFormFeedback>
                    </CInputGroup>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="lastName">Nama Belakang</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        id="lastName"
                        invalid={!!errors.lastName}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Masukkan nama belakang"
                      />
                      <CFormFeedback invalid>{errors.lastName}</CFormFeedback>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Account Information */}
            <CCard className="mb-4 border-secondary">
              <CCardHeader className="bg-light">
                <CIcon icon={cilEnvelopeClosed} className="me-2" />
                Informasi Akun
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="email">Email</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        id="email"
                        type="email"
                        invalid={!!errors.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email"
                      />
                      <CFormFeedback invalid>{errors.email}</CFormFeedback>
                    </CInputGroup>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="password">Password</CFormLabel>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        id="password"
                        type="password"
                        invalid={!!errors.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password baru"
                      />
                      <CFormFeedback invalid>{errors.password}</CFormFeedback>
                    </CInputGroup>
                    <CFormText>Kosongkan jika tidak ingin mengubah password.</CFormText>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            <div className="d-flex justify-content-end gap-2">
              <CButton color="secondary" onClick={handleReset} disabled={saving}>
                Reset
              </CButton>
              <CButton color="primary" onClick={handleSaveChanges} disabled={saving}>
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-2" />
                    Simpan Perubahan
                  </>
                )}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Profile
