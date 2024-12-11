/* eslint-disable react/no-unknown-property */
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
  cilCloudDownload,
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
    const allModulesCompleted = overallProgress === 100

    return (
      <>
        {/* Completion Message */}
        {allModulesCompleted && (
        <CCard className="mb-4 border-0 completion-card">
          <CCardBody className="p-4 text-center text-white">
            <div className="celebration-overlay"></div>
            <div className="position-relative">
              <h3 className="mb-3">🎉 Selamat! 🎉</h3>
              <p className="mb-0 lead">
                Anda telah berhasil menyelesaikan seluruh modul pembelajaran. Berikut E-sertifikat
                Anda.
              </p>
              <div className="certificate-container mt-4">
                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  {/* <!-- Background --> */}
                  <rect width="800" height="600" fill="#ffffff" />

                  {/* <!-- Border Design --> */}
                  <rect
                    x="20"
                    y="20"
                    width="760"
                    height="560"
                    fill="none"
                    stroke="#1E88E5"
                    stroke-width="2"
                  />
                  <rect
                    x="25"
                    y="25"
                    width="750"
                    height="550"
                    fill="none"
                    stroke="#1E88E5"
                    stroke-width="1"
                    stroke-dasharray="2"
                  />

                  {/* <!-- Header --> */}
                  <text
                    x="400"
                    y="80"
                    font-family="Georgia, serif"
                    font-size="40"
                    text-anchor="middle"
                    fill="#1E88E5"
                  >
                    SERTIFIKAT
                  </text>

                  {/* <!-- Subtitle --> */}
                  <text
                    x="400"
                    y="120"
                    font-family="Arial, sans-serif"
                    font-size="20"
                    text-anchor="middle"
                    fill="#666666"
                  >
                    PENGHARGAAN
                  </text>

                  {/* <!-- Decorative Line --> */}
                  <line x1="200" y1="140" x2="600" y2="140" stroke="#1E88E5" stroke-width="1" />

                  {/* <!-- Certificate Text --> */}
                  <text
                    x="400"
                    y="200"
                    font-family="Arial, sans-serif"
                    font-size="16"
                    text-anchor="middle"
                    fill="#333333"
                  >
                    Diberikan Kepada:
                  </text>

                  {/* <!-- Name (Added) --> */}
                  <text
                    x="400"
                    y="280"
                    font-family="Georgia, serif"
                    font-size="32"
                    font-weight="bold"
                    text-anchor="middle"
                    fill="#333333"
                  >
                    {username?.toUpperCase()}
                  </text>

                  {/* <!-- Name Underline --> */}
                  <line x1="250" y1="300" x2="550" y2="300" stroke="#333333" stroke-width="0.5" />

                  {/* <!-- Additional Text --> */}
                  <text
                    x="400"
                    y="350"
                    font-family="Arial, sans-serif"
                    font-size="16"
                    text-anchor="middle"
                    fill="#333333"
                  >
                    Atas partisipasinya dalam
                  </text>

                  <text
                    x="400"
                    y="380"
                    font-family="Georgia, serif"
                    font-size="24"
                    text-anchor="middle"
                    fill="#1E88E5"
                  >
                    Program Pelatihan Integrity Academia
                  </text>

                  {/* <!-- Date --> */}
                  <text
                    x="400"
                    y="450"
                    font-family="Arial, sans-serif"
                    font-size="14"
                    text-anchor="middle"
                    fill="#666666"
                  >
                    {`Bandung, ${new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                  </text>

                  {/* <!-- Signature Lines --> */}
                  <line x1="200" y1="520" x2="350" y2="520" stroke="#333333" stroke-width="0.5" />
                  <line x1="450" y1="520" x2="600" y2="520" stroke="#333333" stroke-width="0.5" />

                  <text
                    x="275"
                    y="540"
                    font-family="Arial, sans-serif"
                    font-size="12"
                    text-anchor="middle"
                    fill="#666666"
                  >
                    Direktur Program
                  </text>

                  <text
                    x="525"
                    y="540"
                    font-family="Arial, sans-serif"
                    font-size="12"
                    text-anchor="middle"
                    fill="#666666"
                  >
                    Ketua Pelaksana
                  </text>

                  {/* <!-- Logo Placeholder --> */}
                  <circle cx="400" cy="500" r="30" fill="none" stroke="#1E88E5" stroke-width="1" />
                  <text
                    x="400"
                    y="505"
                    font-family="Georgia, serif"
                    font-size="20"
                    text-anchor="middle"
                    fill="#1E88E5"
                  >
                    iA
                  </text>
                </svg>
                <button
                  className="btn btn-light mt-3"
                  onClick={() => window.open(`${process.env.PUBLIC_URL}/certificate.svg`, '_blank')}
                >
                  ⬇️ Download Sertifikat
                </button>
              </div>
            </div>
          </CCardBody>

          <style>
            {`
      .certificate-container img:hover {
        transform: scale(1.02);
      }
    `}
          </style>
        </CCard>
        )}

        {/* Main Progress Card */}
        <CCard className="main-progress-card mb-4">
          <CCardBody className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="text-white mb-1">Progress Overview</h4>
                <p className="text-white-50 mb-0">Track your learning journey</p>
              </div>
              <div className="progress-percentage">
                <div className="circle-progress">
                  <span className="percentage">{overallProgress}%</span>
                </div>
              </div>
            </div>

            <CRow className="g-3">
              <CCol xs={12} md={4}>
                <div className="status-box completed">
                  <div className="content">
                    <div className="count">{statusCounts.completed}</div>
                    <div className="label">Completed</div>
                  </div>
                  <div className="icon">
                    <CIcon icon={cilCheck} />
                  </div>
                </div>
              </CCol>
              <CCol xs={12} md={4}>
                <div className="status-box in-progress">
                  <div className="content">
                    <div className="count">{statusCounts.inProgress}</div>
                    <div className="label">In Progress</div>
                  </div>
                  <div className="icon">
                    <CIcon icon={cilClock} />
                  </div>
                </div>
              </CCol>
              <CCol xs={12} md={4}>
                <div className="status-box not-started">
                  <div className="content">
                    <div className="count">{statusCounts.notStarted}</div>
                    <div className="label">Not Started</div>
                  </div>
                  <div className="icon">
                    <CIcon icon={cilBook} />
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Module Progress Section */}
        <div className="module-section">
          <h5 className="module-title mb-4">
            <CIcon icon={cilBook} className="me-2" />
            Module Progress Details
          </h5>
          <CRow className="g-4">
            {progressData.map((item) => (
              <CCol sm={12} md={6} lg={4} key={item.module_id}>
                <div className={`module-box ${item.status}`}>
                  <div className="header">
                    <div className="tag">{getModuleTypeInIndonesian(item.moduleType)}</div>
                    <h6 className="title">{item.moduleName}</h6>
                  </div>
                  <div className="content">
                    <div className="progress-line">
                      <div
                        className="fill"
                        style={{ width: `${item.status === 'completed' ? '100' : '0'}%` }}
                      ></div>
                    </div>
                    <div className="status">
                      <span className={`badge ${item.status}`}>
                        {item.status === 'completed'
                          ? 'Completed'
                          : item.status === 'in_progress'
                            ? 'In Progress'
                            : 'Not Started'}
                      </span>
                      {item.completed_at && (
                        <small className="completion-time">{formatDate(item.completed_at)}</small>
                      )}
                    </div>
                  </div>
                </div>
              </CCol>
            ))}
          </CRow>
        </div>

        <style>
          {`
          .module-title {
            color: var(--cui-body-color);
            transition: color 0.3s ease;
          }

          .completion-card {
            background: linear-gradient(135deg, #28a745, #20c997);
            border-radius: 15px;
          }

          .main-progress-card {
            background: linear-gradient(135deg, #2c3e50, #3498db);
            border-radius: 15px;
            border: none;
          }

          .circle-progress {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .percentage {
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
          }

          .status-box {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .status-box .content {
            color: white;
          }

          .status-box .count {
            font-size: 1.75rem;
            font-weight: bold;
            line-height: 1;
          }

          .status-box .label {
            font-size: 0.875rem;
            opacity: 0.8;
          }

          .status-box .icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.2);
            color: white;
          }

          .module-box {
            background: #2c3e50;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.3s ease;
          }

          .module-box:hover {
            transform: translateY(-5px);
          }

          .module-box .header {
            padding: 1.25rem;
            background: rgba(255,255,255,0.05);
          }

          .module-box .tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(52, 152, 219, 0.3);
            color: #3498db;
            border-radius: 20px;
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
          }

          .module-box .title {
            color: white;
            margin: 0;
          }

          .module-box .content {
            padding: 1.25rem;
          }

          .progress-line {
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            margin-bottom: 1rem;
            overflow: hidden;
          }

          .progress-line .fill {
            height: 100%;
            background: #3498db;
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .badge {
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-weight: normal;
          }

          .badge.completed {
            background: #28a745;
            color: white;
          }

          .badge.in_progress {
            background: #ffc107;
            color: black;
          }

          .badge.not_started {
            background: rgba(255,255,255,0.2);
            color: white;
          }

          .completion-time {
            display: block;
            color: rgba(255,255,255,0.6);
            margin-top: 0.5rem;
            font-size: 0.75rem;
          }

          .certificate-container {
      transition: all 0.3s ease;
    }

    .certificate-svg {
      transition: transform 0.3s ease;
    }

    .certificate-svg:hover {
      transform: scale(1.02);
    }

    /* Memperbaiki tampilan completion card */
    .completion-card {
      background: linear-gradient(135deg, #28a745, #20c997);
      border-radius: 15px;
      overflow: visible;
    }

    .completion-card .celebration-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.1) 75%,
        transparent 75%,
        transparent
      );
      background-size: 64px 64px;
      animation: slide 2s linear infinite;
      opacity: 0.1;
    }

    @keyframes slide {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 64px 64px;
      }
    }

          @media (max-width: 768px) {
            .status-box {
              margin-bottom: 1rem;
            }
            
            .circle-progress {
              width: 80px;
              height: 80px;
            }
            
            .percentage {
              font-size: 1.25rem;
            }
          }
        `}
        </style>
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
