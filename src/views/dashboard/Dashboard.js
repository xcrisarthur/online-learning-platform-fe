/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CProgress,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CContainer,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilStar,
  cilCheck,
  cilClock,
  cilBook,
  cilUser,
  cilPeople,
  cilChart,
  cilSpeedometer,
} from '@coreui/icons'
import {
  getProgressTracking,
  getModules,
  getUsers,
  getTestResults,
  getAllTests,
  getCoursesEnrollment,
} from '../../services/api'

const Dashboard = () => {
  const [progressData, setProgressData] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [userRole, setUserRole] = useState('')

  // State tambahan untuk admin view
  const [allStudents, setAllStudents] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [allTestResults, setAllTestResults] = useState([])
  const [allTests, setAllTests] = useState([])

  // Tambahkan state untuk enrollments
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    const initializeUserData = () => {
      const storedUserId = localStorage.getItem('userId')
      const firstName = localStorage.getItem('firstName')
      const lastName = localStorage.getItem('lastName')
      const role = localStorage.getItem('role')
      setUserId(storedUserId)
      setUserRole(role) // Set role user
      if (firstName && lastName) {
        setUsername(`${firstName} ${lastName}`)
      }
    }

    const fetchData = async () => {
      try {
        const currentUserId = localStorage.getItem('userId')
        const currentRole = localStorage.getItem('role')

        if (!currentUserId) {
          throw new Error('User ID tidak ditemukan')
        }

        const [progressResponse, modulesResponse] = await Promise.all([
          getProgressTracking(),
          getModules(),
        ])

        setModules(modulesResponse) // Set modules state

        // Check role untuk admin view
        if (currentRole === 'admin' || currentRole === 'lecturer') {
          try {
            // Fetch data untuk admin
            const [usersResponse, testResultsResponse, testsResponse, enrollmentsResponse] =
              await Promise.all([
                getUsers(),
                getTestResults(),
                getAllTests(),
                getCoursesEnrollment(), // Tambahkan untuk mendapatkan data enrollment
              ])

            // Set enrollments data
            setEnrollments(enrollmentsResponse)

            // Filter students
            const students = usersResponse.filter((user) => user.role === 'student')

            if (currentRole === 'lecturer') {
              // Filter students berdasarkan assignedBy lecturer
              const lecturerStudents = students.filter((student) => {
                const enrollment = enrollmentsResponse.find(
                  (enrollment) =>
                    enrollment.student_id === student.user_id &&
                    enrollment.assignedBy.toString() === currentUserId,
                )
                return enrollment !== undefined
              })
              setAllStudents(lecturerStudents)
            } else {
              // Untuk admin, tampilkan semua students
              setAllStudents(students)
            }

            // setAllStudents(students)
            setAllProgress(progressResponse)
            setAllTestResults(testResultsResponse)
            setAllTests(testsResponse)
          } catch (adminError) {
            console.error('Error fetching admin data:', adminError)
          }
        } else {
          // Filter progress untuk student view
          const userProgress = progressResponse.filter(
            (progress) => progress.student_id.toString() === currentUserId,
          )

          const enrichedProgress = modulesResponse.map((module) => {
            const progress = userProgress.find((p) => p.module_id === module.module_id)
            return {
              module_id: module.module_id,
              moduleName: module.module_title,
              moduleType: module.module_type,
              progress_percentage: progress ? 100 : 0,
              status: progress ? progress.status : 'not_started',
              completed_at: progress ? progress.completed_at : null,
            }
          })

          setProgressData(enrichedProgress)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Gagal memuat data')
        setLoading(false)
      }
    }

    initializeUserData()
    fetchData()
  }, [])

  const getModuleTitle = (testId) => {
    // Cari test berdasarkan test_id
    const test = allTests.find((test) => test.test_id === testId)
    if (!test) return 'Unknown Module'

    // Cari modul berdasarkan module_id dari test
    const modul = modules.find((module) => module.module_id === test.module_id)
    if (!modul) return 'Unknown Module'

    return modul.module_title
  }

  const getStudentProgress = (studentId) => {
    // Filter progress berdasarkan student ID
    const studentProgress = allProgress.filter((progress) => progress.student_id === studentId)

    // Jika role adalah lecturer, filter hanya progress untuk Pelajar yang di-assign
    if (userRole === 'lecturer') {
      const currentUserId = localStorage.getItem('userId')
      const enrollment = enrollments.find(
        (e) => e.student_id === studentId && e.assignedBy.toString() === currentUserId,
      )
      if (!enrollment) return []
    }

    const mappedProgress = modules.map((module) => {
      const progress = studentProgress.find((p) => p.module_id === module.module_id)
      return {
        module_id: module.module_id,
        moduleName: module.module_title,
        moduleType: module.module_type,
        progress_percentage: progress ? 100 : 0,
        status: progress ? progress.status : 'not_started',
        completed_at: progress ? progress.completed_at : null,
      }
    })

    return mappedProgress
  }

  const getStudentTestResults = (studentId) => {
    return allTestResults.filter((result) => result.student_id === studentId)
  }

  // Render student card untuk admin view
  const renderStudentCard = (student) => {
    // Ubah student.id menjadi student.user_id
    const studentProgress = getStudentProgress(student.user_id)
    const testResults = getStudentTestResults(student.user_id)
    const completedModules = studentProgress.filter((p) => p.status === 'completed').length
    const totalModules = studentProgress.length
    const overallProgress = Math.round((completedModules / totalModules) * 100)

    return (
      <CAccordionItem key={student.id}>
        <CAccordionHeader>
          <div className="d-flex align-items-center w-100 justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-light p-2 rounded-circle me-3">
                <CIcon icon={cilUser} size="lg" className="text-primary" />
              </div>
              <div>
                <h5 className="mb-0">{`${student.first_name} ${student.last_name}`}</h5>
                {/* <small className="text-medium-emphasis">ID: {student.user_id}</small> */}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <CBadge color={overallProgress === 100 ? 'success' : 'warning'} className="ms-2">
                {overallProgress}% Complete
              </CBadge>
            </div>
          </div>
        </CAccordionHeader>
        <CAccordionBody>
          <CRow>
            {/* Progress Overview */}
            <CCol xs={12} className="mb-4">
              <CCard className="border-0 shadow-sm">
                <CCardHeader className="bg-transparent">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilSpeedometer} className="me-2" />
                    <h6 className="mb-0">Progress Overview</h6>
                  </div>
                </CCardHeader>
                <CCardBody>
                  <CProgress
                    value={overallProgress}
                    height={20}
                    className="mb-3"
                    color={overallProgress === 100 ? 'success' : 'warning'}
                  >
                    <small className="text-white fw-semibold">{overallProgress}%</small>
                  </CProgress>
                  <div className="d-flex justify-content-between small text-medium-emphasis">
                    <span>Completed: {completedModules}</span>
                    <span>Total Modules: {totalModules}</span>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Test Results */}
            <CCol xs={12} className="mb-4">
              <CCard className="border-0 shadow-sm">
                <CCardHeader className="bg-transparent">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilChart} className="me-2" />
                    <h6 className="mb-0">Test Results</h6>
                  </div>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive className="mb-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Module</CTableHeaderCell>
                        <CTableHeaderCell>Score</CTableHeaderCell>
                        <CTableHeaderCell>Completion Date</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {testResults.map((result) => (
                        <CTableRow key={result.result_id}>
                          <CTableDataCell>{getModuleTitle(result.test_id)}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{result.score}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{formatDate(result.completed_at)}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Module Progress Detail */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm">
                <CCardHeader className="bg-transparent">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilBook} className="me-2" />
                    <h6 className="mb-0">Module Progress Detail</h6>
                  </div>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    {studentProgress.map((module) => (
                      <CCol sm={12} md={6} key={module.module_id} className="mb-3">
                        <CCard className="border h-100">
                          <CCardHeader className="bg-transparent border-bottom-0">
                            <h6 className="mb-1">{module.moduleName}</h6>
                            <CBadge color="info">
                              {getModuleTypeInIndonesian(module.moduleType)}
                            </CBadge>
                          </CCardHeader>
                          <CCardBody>
                            <CProgress
                              value={module.status === 'completed' ? 100 : 0}
                              height={10}
                              className="mb-3"
                              color={module.status === 'completed' ? 'success' : 'secondary'}
                            />
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-medium-emphasis small">Status:</span>
                              <CBadge
                                color={
                                  module.status === 'completed'
                                    ? 'success'
                                    : module.status === 'in_progress'
                                      ? 'primary'
                                      : 'secondary'
                                }
                              >
                                {module.status === 'completed'
                                  ? 'Selesai'
                                  : module.status === 'in_progress'
                                    ? 'Sedang Dikerjakan'
                                    : 'Belum Dimulai'}
                              </CBadge>
                            </div>
                            {module.completed_at && (
                              <small className="d-block text-medium-emphasis mt-2">
                                <i className="far fa-clock me-1"></i>
                                Completed: {formatDate(module.completed_at)}
                              </small>
                            )}
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CAccordionBody>
      </CAccordionItem>
    )
  }

  // Render admin view
  const renderAdminView = () => {
    if (allStudents.length === 0) {
      return (
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardBody>
            <div className="text-center">
              <p className="text-medium-emphasis">
                {userRole === 'lecturer'
                  ? 'Anda belum memiliki pelajar yang terdaftar'
                  : 'Tidak ada data pelajar yang tersedia'}
              </p>
            </div>
          </CCardBody>
        </CCard>
      )
    }

    return (
      <>
        {/* Students Overview */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardHeader className="bg-transparent">
            <h4 className="mb-0">
              {userRole === 'lecturer' ? 'Overview Pelajar Anda' : 'Overview Pelajar'}
            </h4>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <div className="border rounded p-3 text-center">
                  <h2 className="text-primary">{allStudents.length}</h2>
                  <p className="text-medium-emphasis mb-0">Total Pelajar</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 text-center">
                  <h2 className="text-success">
                    {
                      allStudents.filter((student) => {
                        const progress = getStudentProgress(student.user_id)
                        return progress.every((p) => p.status === 'completed')
                      }).length
                    }
                  </h2>
                  <p className="text-medium-emphasis mb-0">Pelajar Selesai</p>
                </div>
              </CCol>
              {/* <CCol md={4}>
                <div className="border rounded p-3 text-center">
                  <h2 className="text-warning">
                    {
                      allStudents.filter((student) => {
                        const progress = getStudentProgress(student.user_id)
                        return progress.some((p) => p.status === 'in_progress')
                      }).length
                    }
                  </h2>
                  <p className="text-medium-emphasis mb-0">Pelajar Aktif</p>
                </div>
              </CCol> */}
            </CRow>
          </CCardBody>
        </CCard>

        {/* Student List with Progress */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardHeader className="bg-transparent">
            <h4 className="mb-0">
              {userRole === 'lecturer' ? 'Daftar Progress Pelajar Anda' : 'Daftar Progress Pelajar'}
            </h4>
          </CCardHeader>
          <CCardBody>
            <CAccordion alwaysOpen>
              {allStudents.map((student) => renderStudentCard(student))}
            </CAccordion>
          </CCardBody>
        </CCard>
      </>
    )
  }

  const renderStudentView = () => {
    const statusCounts = getStatusCounts()
    const overallProgress = calculateOverallProgress()

    return (
      <>
        {/* Overall Progress Card */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardHeader className="bg-transparent border-bottom-0 pb-0">
            <div className="d-flex align-items-center">
              <CIcon icon={cilStar} size="xl" className="me-2 text-warning" />
              <h4 className="mb-0">Progres Pembelajaran</h4>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-medium-emphasis">Total Progress</span>
                <span className="fw-bold">{overallProgress}%</span>
              </div>
              <CProgress value={overallProgress} height={20} className="mb-2" color="success">
                <small className="text-white fw-semibold">{overallProgress}%</small>
              </CProgress>
            </div>

            <CRow>
              <CCol sm={12} md={4}>
                <CCard className="bg-light border-0 mb-3 shadow-sm">
                  <CCardBody className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <CIcon icon={cilCheck} size="xl" className="text-success" />
                    </div>
                    <div>
                      <div className="text-success fs-6 fw-semibold">Selesai</div>
                      <div className="fs-2 fw-bold">{statusCounts.completed}</div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={12} md={4}>
                <CCard className="bg-light border-0 mb-3 shadow-sm">
                  <CCardBody className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <CIcon icon={cilClock} size="xl" className="text-primary" />
                    </div>
                    <div>
                      <div className="text-primary fs-6 fw-semibold">Sedang Dikerjakan</div>
                      <div className="fs-2 fw-bold">{statusCounts.inProgress}</div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={12} md={4}>
                <CCard className="bg-light border-0 mb-3 shadow-sm">
                  <CCardBody className="d-flex align-items-center">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                      <CIcon icon={cilBook} size="xl" className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-secondary fs-6 fw-semibold">Belum Dimulai</div>
                      <div className="fs-2 fw-bold">{statusCounts.notStarted}</div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Module Progress */}
        <div className="module-progress">
          <h4 className="mb-3">Detail Progress Modul</h4>
          <CRow>
            {progressData.map((item) => (
              <CCol sm={12} md={6} key={item.module_id} className="mb-3">
                <CCard className="mb-4 border-0 shadow-sm h-100">
                  <CCardHeader className="bg-transparent border-bottom-0">
                    <h5 className="mb-1">

                      {/* edit bagian ini */}

                      {item.moduleName}
                      

                    </h5> 
                    <span className="badge bg-info text-white">
                      {getModuleTypeInIndonesian(item.moduleType)}
                    </span>
                  </CCardHeader>
                  <CCardBody>
                    <CProgress
                      value={item.status === 'completed' ? 100 : 0}
                      height={10}
                      className="mb-3"
                      color={item.status === 'completed' ? 'success' : 'secondary'}
                    />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-medium-emphasis">
                        Progress: {item.status === 'completed' ? '100%' : '0%'}
                      </span>
                      <span
                        className={`badge ${
                          item.status === 'completed'
                            ? 'bg-success'
                            : item.status === 'in_progress'
                              ? 'bg-primary'
                              : 'bg-secondary'
                        }`}
                      >
                        {item.status === 'completed'
                          ? 'Selesai'
                          : item.status === 'in_progress'
                            ? 'Sedang Dikerjakan'
                            : 'Belum Dimulai'}
                      </span>
                    </div>
                    {item.completed_at && (
                      <small className="d-block text-medium-emphasis">
                        <i className="far fa-clock me-1"></i>
                        Diselesaikan pada: {formatDate(item.completed_at)}
                      </small>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </div>
      </>
    )
  }

  const calculateOverallProgress = () => {
    if (progressData.length === 0) return 0
    const completedModules = progressData.filter((item) => item.status === 'completed').length
    return Math.round((completedModules / progressData.length) * 100)
  }

  const getStatusCounts = () => {
    return progressData.reduce(
      (acc, item) => {
        if (item.status === 'completed') acc.completed++
        else if (item.status === 'in_progress') acc.inProgress++
        else acc.notStarted++
        return acc
      },
      { completed: 0, inProgress: 0, notStarted: 0 },
    )
  }

  const getModuleTypeInIndonesian = (type) => {
    const typeMap = {
      pretest: 'Pra-Ujian',
      posttest: 'Pasca-Ujian',
      materials: 'Materi Pembelajaran',
      minitest: 'Kuis',
    }
    return typeMap[type] || type
  }

  const formatDate = (dateString) => {
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  if (loading) {
    return (
      <CContainer>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '300px' }}
        >
          <CSpinner color="primary" />
        </div>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer>
        <CAlert color="danger">{error}</CAlert>
      </CContainer>
    )
  }

  const statusCounts = getStatusCounts()
  const overallProgress = calculateOverallProgress()

  return (
    <CContainer>
      {/* Welcome Card */}
      <CCard className="mb-4 border-0 shadow-sm">
        <CCardBody>
          <div className="d-flex align-items-center">
            <div className="bg-light p-3 rounded-circle me-3">
              {userRole === 'admin' || userRole === 'lecturer' ? (
                <CIcon icon={cilPeople} size="xl" className="text-primary" />
              ) : (
                <CIcon icon={cilUser} size="xl" className="text-primary" />
              )}
            </div>
            <div>
              <h2 className="mb-1">
                {userRole === 'admin'
                  ? 'Dashboard Admin'
                  : userRole === 'lecturer'
                    ? 'Dashboard Lecturer'
                    : `Selamat Datang, ${username}`}
              </h2>
              <p className="text-medium-emphasis mb-0">
                {userRole === 'admin'
                  ? 'Monitor progress pembelajaran seluruh Pelajar'
                  : userRole === 'lecturer'
                    ? 'Monitor progress pembelajaran Pelajar Anda'
                    : 'Mari lanjutkan perjalanan belajar Anda!'}
              </p>
            </div>
          </div>
        </CCardBody>
      </CCard>

      {userRole === 'admin' || userRole === 'lecturer' ? renderAdminView() : renderStudentView()}
    </CContainer>
  )
}

export default Dashboard
