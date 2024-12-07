/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import {
  CContainer,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSmartTable,
  CAlert,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CProgress,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react-pro'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCoursesEnrollment,
  updateEnrollment,
  createEnrollment,
  deleteEnrollmentsByUserId,
} from '../../services/api'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [tableData, setTableData] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [addUserModalVisible, setAddUserModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('student')
  const [newUserClassLevel, setNewUserClassLevel] = useState('')
  const [editAssignedBy, setEditAssignedBy] = useState(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [notAssignedData, setNotAssignedData] = useState([])

  const [csvFile, setCsvFile] = useState(null)
  const [importPreviewVisible, setImportPreviewVisible] = useState(false)
  const [csvData, setCSVData] = useState([])
  const [importProgress, setImportProgress] = useState(0)

  // Retrieve the logged-in user from localStorage
  const loggedInUser = {
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
    userId: localStorage.getItem('userId'),
    role: localStorage.getItem('role'),
    classLevel: localStorage.getItem('classLevel'),
  }

  useEffect(() => {
    fetchUsersAndEnrollments()
  }, [])

  const processUserAssignment = (usersData, enrollmentsData) => {
    // Ambil semua student_id dari enrollmentsData
    const studentIds = enrollmentsData.map((enrollment) => enrollment.student_id)

    // Filter usersData berdasarkan keberadaan user_id di studentIds
    const assigned = usersData.filter((user) => studentIds.includes(user.user_id))
    const notAssigned = usersData.filter((user) => !studentIds.includes(user.user_id))

    return { assigned, notAssigned }
  }

  const fetchUsersAndEnrollments = async () => {
    try {
      const [usersData, enrollmentsData] = await Promise.all([getUsers(), getCoursesEnrollment()])
      const { assigned, notAssigned } = processUserAssignment(usersData, enrollmentsData)
      setUsers(usersData)
      transformTableData(assigned, enrollmentsData)
      transformTableDataNotAssigned(notAssigned, enrollmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setAlertMessage('Failed to fetch data. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const transformTableDataNotAssigned = (users, enrollments) => {
    const data = users.map((user) => {
      const enrollment = enrollments.find((en) => en.student_id === user.user_id)
      const assignedByUser = users.find((u) => u.user_id === enrollment?.assignedBy)
      return {
        ...user,
        assignedBy: assignedByUser
          ? `${assignedByUser.first_name} ${assignedByUser.last_name}`
          : 'Null',
        enrollmentId: enrollment?.enrollment_id || null,
      }
    })
    setNotAssignedData(data)
  }

  const transformTableData = (users, enrollments) => {
    const loggedInRole = localStorage.getItem('role')
    const loggedInFullName = `${loggedInUser.firstName} ${loggedInUser.lastName}`

    // Filter data based on role
    let filteredUsers = users
    if (loggedInRole === 'lecturer') {
      filteredUsers = users.filter((user) => {
        const enrollment = enrollments.find((en) => en.student_id === user.user_id)

        const assignedByUser = users.find((u) => u.user_id === enrollment?.assignedBy)
        const assignedByName = assignedByUser
          ? `${assignedByUser.first_name} ${assignedByUser.last_name}`
          : null

        return assignedByName === loggedInFullName
      })
    }

    const data = filteredUsers.map((user) => {
      const enrollment = enrollments.find((en) => en.student_id === user.user_id)
      const assignedByUser = users.find((u) => u.user_id === enrollment?.assignedBy)
      return {
        ...user,
        assignedBy: assignedByUser
          ? `${assignedByUser.first_name} ${assignedByUser.last_name}`
          : 'Null',
        enrollmentId: enrollment?.enrollment_id || null,
      }
    })
    setTableData(data)
  }

  const handleAddUser = async () => {
    const loggedInUser = {
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
      userId: parseInt(localStorage.getItem('userId'), 10), // Konversi ke integer
      role: localStorage.getItem('role'),
      classLevel: localStorage.getItem('classLevel'),
    }

    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) {
      setAlertMessage('All fields are required.')
      setAlertColor('danger')
      setAlertVisible(true)
      return
    }

    try {
      // Buat user baru
      const newUser = await createUser({
        first_name: newFirstName,
        last_name: newLastName,
        email: newEmail,
        role: newUserRole,
        class_level: newUserClassLevel,
      })
      // Gunakan user_id dari user baru
      const newUserId = newUser.user_id

      // Tambahkan ke enrollment
      await createEnrollment({
        student_id: newUserId, // Gunakan user_id dari user baru
        assignedBy: loggedInUser.userId, // Gunakan nilai integer dari logged-in user
        course_id: 1, // Asumsikan course_id adalah 1
      })

      setAlertMessage('User added successfully.')
      setAlertColor('success')
      setAlertVisible(true)

      setUsers([...users, newUser])
      setTableData([
        ...tableData,
        {
          ...newUser,
          assignedBy: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
          enrollmentId: null,
        },
      ])

      setAddUserModalVisible(false)
      setNewFirstName('')
      setNewLastName('')
      setNewEmail('')
      setNewUserClassLevel('')
      setNewUserRole('student')
    } catch (error) {
      console.error('Error adding user:', error)
      setAlertMessage('Failed to add user. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !selectedUser.user_id) {
      setAlertMessage('Failed to update user: ID not found.')
      setAlertColor('danger')
      setAlertVisible(true)
      return
    }
    try {
      await updateUser(selectedUser.user_id, {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        role: selectedUser.role,
        class_level: selectedUser.class_level,
      })

      if (selectedUser.enrollmentId) {
        await updateEnrollment(selectedUser.enrollmentId, { assignedBy: editAssignedBy || null })
      } else {
        await createEnrollment({
          student_id: selectedUser.user_id,
          assignedBy: editAssignedBy,
          course_id: 1,
        })
      }

      // Fetch updated users and enrollments
      const [updatedUsers, updatedEnrollments] = await Promise.all([
        getUsers(),
        getCoursesEnrollment(),
      ])

      // Update users state
      setUsers(updatedUsers)

      transformTableData(updatedUsers, updatedEnrollments)

      // Recalculate assignedBy and update tableData
      const updatedTableData = tableData.map((data) => {
        if (data.user_id === selectedUser.user_id) {
          const assignedByUser = updatedUsers.find((u) => u.user_id === editAssignedBy)
          return {
            ...data,
            ...selectedUser,
            assignedBy: assignedByUser
              ? `${assignedByUser.first_name} ${assignedByUser.last_name}`
              : 'Null',
          }
        }
        return data
      })

      setTableData(updatedTableData)

      setAlertMessage('User updated successfully.')
      setAlertColor('success')
      setAlertVisible(true)
      setEditModalVisible(false)
    } catch (error) {
      console.error('Error updating user:', error)
      setAlertMessage('Failed to update user. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser.user_id) {
      setAlertMessage('Failed to delete user: ID not found.')
      setAlertColor('danger')
      setAlertVisible(true)
      return
    }
    try {
      await deleteEnrollmentsByUserId(selectedUser.user_id)
      await deleteUser(selectedUser.user_id)

      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== selectedUser.user_id))
      setTableData((prevData) => prevData.filter((data) => data.user_id !== selectedUser.user_id))

      setAlertMessage('User deleted successfully.')
      setAlertColor('success')
      setAlertVisible(true)
      setDeleteModalVisible(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      setAlertMessage('Failed to delete user. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const columnsNotAssigned = [
    // {
    //   group: 'List User Tidak Terdaftar',
    //   children: [
    { key: 'first_name', label: 'Nama Depan', _style: { width: '20%' } },
    { key: 'last_name', label: 'Nama Belakang', _style: { width: '20%' } },
    { key: 'email', label: 'Email', _style: { width: '30%' } },
    { key: 'role', label: 'Peran', _style: { width: '10%' } },
    { key: 'assignedBy', label: 'Didaftarkan Oleh', _style: { width: '10%' } },
    { key: 'class_level', label: 'Kelas', _style: { width: '10%' } },
    {
      key: 'action',
      label: 'Actions',
      _style: { width: '20%' },
      filter: false,
      sorter: false,
    },
    //   ],
    // },
  ]

  const columns = [
    // {
    // group: 'List User Terdaftar',
    // children: [
    { key: 'first_name', label: 'Nama Depan', _style: { width: '20%' } },
    { key: 'last_name', label: 'Nama Belakang', _style: { width: '20%' } },
    { key: 'email', label: 'Email', _style: { width: '30%' } },
    { key: 'role', label: 'Peran', _style: { width: '10%' } },
    { key: 'assignedBy', label: 'Didaftarkan Oleh', _style: { width: '10%' } },
    { key: 'class_level', label: 'Kelas', _style: { width: '10%' } },
    {
      key: 'action',
      label: 'Actions',
      _style: { width: '20%' },
      filter: false,
      sorter: false,
    },
    // ],
    // },
  ]

  const handleCSVUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== 'text/csv') {
        setAlertMessage('Please upload a CSV file')
        setAlertColor('danger')
        setAlertVisible(true)
        return
      }

      setCsvFile(file)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data } = results

          // Validate headers
          const requiredHeaders = ['first_name', 'last_name', 'email', 'class_level']
          const missingHeaders = requiredHeaders.filter(
            (header) => !results.meta.fields.includes(header),
          )

          if (missingHeaders.length > 0) {
            setAlertMessage(`Missing required columns: ${missingHeaders.join(', ')}`)
            setAlertColor('danger')
            setAlertVisible(true)
            return
          }

          // Validate data
          let hasErrors = false
          const validatedData = data
            .map((row) => {
              if (!row.first_name || !row.last_name || !row.email || !row.class_level) {
                hasErrors = true
                return null
              }
              if (!row.email.includes('@')) {
                hasErrors = true
                return null
              }
              if (!['junior', 'general'].includes(row.class_level.toLowerCase())) {
                hasErrors = true
                return null
              }
              return {
                ...row,
                role: 'student',
                password: row.email, // Set password same as email
              }
            })
            .filter((row) => row !== null)

          if (hasErrors) {
            setAlertMessage('Some rows contain invalid data. Please check your CSV file.')
            setAlertColor('danger')
            setAlertVisible(true)
            return
          }

          setCSVData(validatedData)
          setImportPreviewVisible(true)
        },
        error: (error) => {
          setAlertMessage('Error reading CSV file: ' + error.message)
          setAlertColor('danger')
          setAlertVisible(true)
        },
      })
    }
  }

  const handleImportUsers = async () => {
    try {
      setImportProgress(0)

      for (let i = 0; i < csvData.length; i++) {
        const user = csvData[i]
        try {
          // Create user
          const newUser = await createUser({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: 'student',
            class_level: user.class_level,
          })

          // Create enrollment if user is created successfully
          if (newUser.user_id) {
            await createEnrollment({
              student_id: newUser.user_id,
              assignedBy: loggedInUser.userId,
              course_id: 1,
            })
          }

          setImportProgress(Math.round(((i + 1) / csvData.length) * 100))
        } catch (error) {
          console.error('Error importing user:', user, error)
        }
      }

      // Refresh the data
      await fetchUsersAndEnrollments()

      setAlertMessage('Users imported successfully')
      setAlertColor('success')
      setAlertVisible(true)
      setImportPreviewVisible(false)
      setCSVData([])
      setCsvFile(null)
    } catch (error) {
      setAlertMessage('Error importing users: ' + error.message)
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  return (
    <>
      {alertVisible && (
        <CAlert
          color={alertColor}
          className="position-fixed"
          style={{
            top: '20px',
            right: '20px',
            width: '300px',
            zIndex: 1050,
          }}
          dismissible
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
        >
          {alertMessage}
        </CAlert>
      )}
      <CContainer className="px-4">
        {/* <h1>User Management</h1> */}

        <h2>Tambah Pengguna</h2>
        <div className="mb-4">
          <h3>Import Pengguna dari CSV</h3>
          <div className="mb-3">
            <CFormInput
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleCSVUpload}
              label="Upload CSV File"
            />
            <small className="text-muted d-block mt-2">
              Format CSV: first_name, last_name, email, class_level (junior/general)
            </small>
          </div>
        </div>

        <CModal 
  visible={importPreviewVisible}
  onClose={() => setImportPreviewVisible(false)}
  size="lg"
>
  <CModalHeader closeButton>
    <CModalTitle>Preview Data Import</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {importProgress > 0 && (
      <CProgress value={importProgress} className="mb-3">
        {importProgress}%
      </CProgress>
    )}
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Nama Depan</CTableHeaderCell>
          <CTableHeaderCell>Nama Belakang</CTableHeaderCell>
          <CTableHeaderCell>Email</CTableHeaderCell>
          <CTableHeaderCell>Kelas</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {csvData.map((row, index) => (
          <CTableRow key={index}>
            <CTableDataCell>{row.first_name}</CTableDataCell>
            <CTableDataCell>{row.last_name}</CTableDataCell>
            <CTableDataCell>{row.email}</CTableDataCell>
            <CTableDataCell>{row.class_level}</CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  </CModalBody>
  <CModalFooter>
    <CButton 
      style={{ backgroundColor: '#A5D6A7', color: 'black' }}
      onClick={handleImportUsers}
      disabled={importProgress > 0}
    >
      {importProgress > 0 ? 'Importing...' : 'Import Users'}
    </CButton>
    <CButton 
      style={{ backgroundColor: '#BDBDBD', color: 'black' }}
      onClick={() => setImportPreviewVisible(false)}
    >
      Cancel
    </CButton>
  </CModalFooter>
</CModal>

        <CContainer>
          <CRow>
            <CCol>
              <CFormInput
                label="Nama Depan"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="Masukkan Nama Depan"
              />
            </CCol>
            <CCol>
              <CFormInput
                label="Nama Belakang"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Masukkan Nama Belakang"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CFormInput
                label="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email"
              />
            </CCol>
            <CCol>
              <CFormSelect
                label="Peran"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                options={
                  loggedInUser.role === 'lecturer'
                    ? [{ label: 'Student', value: 'student' }]
                    : [
                        { label: 'Student', value: 'student' },
                        { label: 'Admin', value: 'admin' },
                        { label: 'Lecturer', value: 'lecturer' },
                      ]
                }
                disabled={loggedInUser.role === 'lecturer'}
              />
            </CCol>
            <CCol>
              <CFormSelect
                label="Kelas"
                value={newUserClassLevel}
                onChange={(e) => setNewUserClassLevel(e.target.value)}
                options={[
                  { label: 'Pilih Kelas', value: '' },
                  { label: 'Junior', value: 'junior' },
                  { label: 'General', value: 'general' },
                ]}
              />
            </CCol>
          </CRow>
          <CRow className="my-3 mx-2">
            <CCol>
              *Platform menyediakan dua tingkatan konten pembelajaran yaitu kelas junior dan
              general. Kelas junior dirancang dengan konten yang lebih sederhana dan mudah dipahami
              oleh pelajar usia remaja. Sementara itu, kelas general menyajikan konten yang lebih
              mendalam dan komprehensif yang sesuai untuk mahasiswa, orang dewasa, dan kalangan
              profesional.
            </CCol>
          </CRow>
        </CContainer>

        <CButton
          style={{ backgroundColor: '#A5D6A7', color: 'black' }}
          onClick={handleAddUser}
          className="m-3"
        >
          Tambah
        </CButton>

        <h2>Daftar Pengguna Terverifikasi</h2>

        <CSmartTable
          columns={columns}
          items={tableData}
          columnFilter
          pagination
          itemsPerPage={15}
          tableProps={{
            responsive: true,
            striped: true,
            hover: true,
          }}
          scopedColumns={{
            action: (item) => (
              <td>
                <CButton
                  color="warning"
                  size="sm"
                  className="me-1"
                  onClick={() => {
                    setSelectedUser(item)
                    setEditAssignedBy(
                      users.find((u) => `${u.first_name} ${u.last_name}` === item.assignedBy)
                        ?.user_id || '',
                    )
                    setEditModalVisible(true)
                  }}
                >
                  Edit
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(item)
                    setDeleteModalVisible(true)
                  }}
                >
                  Delete
                </CButton>
              </td>
            ),
          }}
        />

        <h2>Daftar Pengguna Belum Terverifikasi</h2>
        <CSmartTable
          columns={columnsNotAssigned}
          items={notAssignedData}
          columnFilter
          pagination
          itemsPerPage={15}
          tableProps={{
            responsive: true,
            striped: true,
            hover: true,
          }}
          scopedColumns={{
            action: (item) => (
              <td>
                <CButton
                  color="warning"
                  size="sm"
                  className="me-1"
                  onClick={() => {
                    setSelectedUser(item)
                    setEditAssignedBy(
                      users.find((u) => `${u.first_name} ${u.last_name}` === item.assignedBy)
                        ?.user_id || '',
                    )
                    setEditModalVisible(true)
                  }}
                >
                  Edit
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(item)
                    setDeleteModalVisible(true)
                  }}
                >
                  Delete
                </CButton>
              </td>
            ),
          }}
        />
      </CContainer>

      {/* Add User Modal */}
      <CModal visible={addUserModalVisible} onClose={() => setAddUserModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="First Name"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            placeholder="Enter first name"
          />
          <CFormInput
            label="Last Name"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            placeholder="Enter last name"
          />
          <CFormInput
            label="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email"
          />
          <CFormSelect
            label="Role"
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            options={
              loggedInUser.role === 'lecturer'
                ? [{ label: 'Student', value: 'student' }] // Hanya opsi Student
                : [
                    { label: 'Student', value: 'student' },
                    { label: 'Admin', value: 'admin' },
                    { label: 'Lecturer', value: 'lecturer' },
                  ]
            }
            disabled={loggedInUser.role === 'lecturer'}
          />
          <CFormSelect
            label="Kelas"
            value={newUserClassLevel}
            onChange={(e) => setNewUserClassLevel(e.target.value)}
            options={[
              { label: 'Pilih Kelas', value: '' },
              { label: 'Junior', value: 'junior' },
              { label: 'General', value: 'general' },
            ]}
          />
        </CModalBody>
        <CModalFooter>
          <CButton style={{ backgroundColor: '#A5D6A7', color: 'black' }} onClick={handleAddUser}>
            Tambah Pengguna
          </CButton>
          <CButton
            style={{ backgroundColor: '#BDBDBD', color: 'black' }}
            onClick={() => setAddUserModalVisible(false)}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit User Modal */}
      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="Nama Depan"
            value={selectedUser?.first_name || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
          />
          <CFormInput
            label="Nama Belakang"
            value={selectedUser?.last_name || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, last_name: e.target.value })}
          />
          <CFormInput
            label="Email"
            value={selectedUser?.email || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
          />
          <CFormSelect
            label="Peran"
            value={selectedUser?.role || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Admin', value: 'admin' },
              { label: 'Lecturer', value: 'lecturer' },
            ]}
          />
          <CFormSelect
            label="Didaftarkan Oleh"
            value={editAssignedBy || ''}
            onChange={(e) => setEditAssignedBy(e.target.value)}
          >
            <option value="">Select Assigned By</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleEditUser}>
            Simpan Perubahan
          </CButton>
          <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
            Batal
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this user?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDeleteUser}>
            Delete
          </CButton>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UserManagement
