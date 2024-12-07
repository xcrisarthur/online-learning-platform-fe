/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilStar, cilPeople, cilChart, cilChartLine, cilUser } from '@coreui/icons'
import { getAllTests, getTestResults, getUsers } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrophy,
  faAward,
  faStar
} from '@fortawesome/free-solid-svg-icons'

const Leaderboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      const [testResults, users, tests] = await Promise.all([getTestResults(), getUsers(), getAllTests()])
  
      // Filter hanya user dengan role student
      const students = users.filter((user) => user.role === 'student')
  
      // Buat map untuk test_type berdasarkan test_id
      const testTypeMap = tests.reduce((map, test) => {
        map[test.test_id] = test.test_type
        return map
      }, {})
  
      // Proses data test untuk setiap student
      const processedData = students.map((student) => {
        // Filter test results untuk student ini, exclude pretest
        const studentTests = testResults.filter((result) => {
          return result.student_id === student.user_id && 
                 testTypeMap[result.test_id] !== 'pretest' // Exclude pretest
        })
  
        // Kelompokkan test berdasarkan test_id
        const groupedTests = {}
        studentTests.forEach((test) => {
          if (!groupedTests[test.test_id]) {
            groupedTests[test.test_id] = []
          }
          groupedTests[test.test_id].push(test)
        })
  
        // Ambil score terbaik untuk setiap test_id (60, 80, atau 100)
        const bestScores = Object.values(groupedTests).map((tests) => {
          const validScores = tests
            .map((test) => parseFloat(test.score))
            .filter((score) => [60, 80, 100].includes(score))
  
          // Jika ada score valid, ambil yang tertinggi, jika tidak ambil score tertinggi apapun
          return validScores.length > 0
            ? Math.max(...validScores)
            : Math.max(...tests.map((test) => parseFloat(test.score)))
        })
  
        // Hitung rata-rata
        const average =
          bestScores.length > 0 ? bestScores.reduce((a, b) => a + b, 0) / bestScores.length : 0
  
        return {
          studentId: student.user_id,
          name: `${student.first_name} ${student.last_name}`,
          averageScore: parseFloat(average.toFixed(2)),
          totalTests: bestScores.length,
        }
      })
  
      // Urutkan berdasarkan rata-rata tertinggi
      const sortedData = processedData.sort((a, b) => b.averageScore - a.averageScore)
  
      setLeaderboardData(sortedData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching leaderboard data:', err)
      setError('Failed to load leaderboard data')
      setLoading(false)
    }
  }

  const getTopThreeColors = (position) => {
    switch (position) {
      case 0:
        return { background: 'linear-gradient(45deg, #FFD700, #FFA500)', text: '#000' } // Gold
      case 1:
        return { background: 'linear-gradient(45deg, #C0C0C0, #A9A9A9)', text: '#000' } // Silver
      case 2:
        return { background: 'linear-gradient(45deg, #CD7F32, #8B4513)', text: '#fff' } // Bronze
      default:
        return { background: '#f8f9fa', text: '#000' }
    }
  }

  const renderRankIcon = (position) => {
    if (position < 3) {
      return (
        <div className="position-relative">
          <CIcon
            icon={cilStar}
            size="lg"
            className={`text-${position === 0 ? 'warning' : position === 1 ? 'secondary' : 'danger'}`}
          />
          <small className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
            {position + 1}
          </small>
        </div>
      )
    }
    return <span className="badge bg-light text-dark">{position + 1}</span>
  }

  const renderStats = () => {
    const totalStudents = leaderboardData.length
    const averageScore =
      leaderboardData.reduce((acc, curr) => acc + curr.averageScore, 0) / totalStudents || 0
    const highestScore = Math.max(...leaderboardData.map((student) => student.averageScore))

    return (
      <CRow className="mb-4 g-3">
        <CCol xs={12} md={4}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardBody className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <CIcon icon={cilPeople} size="xl" className="text-primary" />
              </div>
              <div>
                <div className="text-medium-emphasis small">Jumlah Pelajar</div>
                <div className="fs-4 fw-semibold">{totalStudents}</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={4}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardBody className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <CIcon icon={cilChart} size="xl" className="text-success" />
              </div>
              <div>
                <div className="text-medium-emphasis small">Rata-rata Nilai</div>
                <div className="fs-4 fw-semibold">{averageScore.toFixed(2)}%</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={4}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardBody className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                <CIcon icon={cilChartLine} size="xl" className="text-warning" />
              </div>
              <div>
                <div className="text-medium-emphasis small">Nilai Tertinggi</div>
                <div className="fs-4 fw-semibold">{highestScore}%</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }
  const renderTopThree = () => {
    const topThree = leaderboardData.slice(0, 3)
    // Urutan tetap sama [Juara 1, Juara 2, Juara 3]
    return (
      <CRow className="mb-4 g-3 align-items-center justify-content-center">
        {/* Juara 2 - Silver */}
        <CCol xs={12} md={4} className="order-md-1">
          {topThree[1] && (
            <CCard
              className="text-center h-100 border-0 shadow-hover"
              style={{
                background: getTopThreeColors(1).background,
                color: getTopThreeColors(1).text,
                marginTop: '2rem',
              }}
            >
              <CCardBody>
                <div className="mb-3">
                <FontAwesomeIcon icon={faAward} size="4x" className="text-secondary" />
                </div>
                <h3>{topThree[1].name}</h3>
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge bg-primary rounded-pill">#2</span>
                </div>
                <div className="fs-2 fw-bold mb-2">{topThree[1].averageScore}%</div>
                <div className="small mb-2">
                  <span
                    className={`badge ${
                      topThree[1].averageScore >= 80
                        ? 'bg-success'
                        : topThree[1].averageScore >= 60
                          ? 'bg-warning'
                          : 'bg-danger'
                    }`}
                  >
                    {topThree[1].averageScore >= 80
                      ? 'Excellent'
                      : topThree[1].averageScore >= 60
                        ? 'Good'
                        : 'Perlu Peningkatan'}
                  </span>
                </div>
                <div className="text-medium-emphasis">Menyelesaikan {topThree[1].totalTests} Tes</div>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        {/* Juara 1 - Gold */}
        <CCol xs={12} md={4} className="order-md-2">
          {topThree[0] && (
            <CCard
              className="text-center h-100 border-0 shadow-hover"
              style={{
                background: getTopThreeColors(0).background,
                color: getTopThreeColors(0).text,
                transform: 'scale(1.1)',
                zIndex: 2,
                marginTop: '-1rem',
              }}
            >
              <CCardBody>
                <div className="mb-3">
                <FontAwesomeIcon icon={faTrophy} size="5x" className="text-success" />
                </div>
                <h3 style={{ fontSize: '1.75rem' }}>{topThree[0].name}</h3>
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge bg-warning rounded-pill">#1</span>
                </div>
                <div className="fs-1 fw-bold mb-2">{topThree[0].averageScore}%</div>
                <div className="small mb-2">
                  <span
                    className={`badge ${
                      topThree[0].averageScore >= 80
                        ? 'bg-success'
                        : topThree[0].averageScore >= 60
                          ? 'bg-warning'
                          : 'bg-danger'
                    }`}
                  >
                    {topThree[0].averageScore >= 80
                      ? 'Excellent'
                      : topThree[0].averageScore >= 60
                        ? 'Good'
                        : 'Perlu Peningkatan'}
                  </span>
                </div>
                <div className="text-medium-emphasis">Menyelesaikan {topThree[0].totalTests} Tes</div>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        {/* Juara 3 - Bronze */}
        <CCol xs={12} md={4} className="order-md-3">
          {topThree[2] && (
            <CCard
              className="text-center h-100 border-0 shadow-hover"
              style={{
                background: getTopThreeColors(2).background,
                color: getTopThreeColors(2).text,
                marginTop: '2rem',
              }}
            >
              <CCardBody>
                <div className="mb-3">
                <FontAwesomeIcon icon={faStar} size="3x" className="text-danger" />
                </div>
                <h3>{topThree[2].name}</h3>
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge bg-danger rounded-pill">#3</span>
                </div>
                <div className="fs-2 fw-bold mb-2">{topThree[2].averageScore}%</div>
                <div className="small mb-2">
                  <span
                    className={`badge ${
                      topThree[2].averageScore >= 80
                        ? 'bg-success'
                        : topThree[2].averageScore >= 60
                          ? 'bg-warning'
                          : 'bg-danger'
                    }`}
                  >
                    {topThree[2].averageScore >= 80
                      ? 'Excellent'
                      : topThree[2].averageScore >= 60
                        ? 'Good'
                        : 'Perlu Peningkatan'}
                  </span>
                </div>
                <div className="text-medium-emphasis">Menyelesaikan {topThree[2].totalTests} Tes</div>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    )
  }

  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <CSpinner className="mb-3" />
          <p className="text-medium-emphasis">Loading leaderboard data...</p>
        </div>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer>
        <CAlert color="danger" className="d-flex align-items-center">
          <CIcon icon={cilChart} className="flex-shrink-0 me-2" />
          <div>{error}</div>
        </CAlert>
      </CContainer>
    )
  }

  return (
    <CContainer className="px-4">
      <CCard className="border-0 shadow-lg">
        <CCardHeader className="bg-transparent border-bottom-0">
          <div className="d-flex align-items-center">
            <CIcon icon={cilStar} size="xl" className="text-warning me-2" />
            <h3 className="mb-0">Papan Peringkat</h3>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Statistics Cards */}
          {renderStats()}

          {/* Top 3 Winners */}
          {renderTopThree()}

          {/* Full Leaderboard Table */}
          <CCard className="border">
            <CCardBody>
              <h5 className="card-title mb-3">Peringkat Lengkap</h5>
              <CTable hover responsive className="align-middle table-borderless">
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center" style={{ width: '80px' }}>
                      Peringkat
                    </CTableHeaderCell>
                    <CTableHeaderCell>Nama</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Rata-rata Nilai</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Total Tes</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {leaderboardData.map((student, index) => (
                    <CTableRow key={student.studentId} className={index < 3 ? 'table-active' : ''}>
                      <CTableDataCell className="text-center">
                        {renderRankIcon(index)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <div className="ms-2">
                            <div className="fw-bold">{student.name}</div>
                            {/* <small className="text-medium-emphasis">
                              Student ID: {student.studentId}
                            </small> */}
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div
                          className={`badge ${
                            student.averageScore >= 80
                              ? 'bg-success'
                              : student.averageScore >= 60
                                ? 'bg-warning'
                                : 'bg-danger'
                          } px-2 py-1`}
                        >
                          {student.averageScore}%
                        </div>
                        <div className="small text-medium-emphasis mt-1">
                          {student.averageScore >= 80
                            ? 'Excellent'
                            : student.averageScore >= 60
                              ? 'Good'
                              : 'Perlu Peningkatan'}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex align-items-center justify-content-center">
                          <CIcon icon={cilChart} size="sm" className="text-primary me-2" />
                          <span>{student.totalTests}</span>
                        </div>
                        <small className="text-medium-emphasis d-block">Menyelesaikan Tes</small>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {leaderboardData.length === 0 && (
                <div className="text-center py-5">
                  <CIcon icon={cilChart} size="3xl" className="text-secondary mb-3" />
                  <h5 className="text-secondary">No Data Available</h5>
                  <p className="text-medium-emphasis">
                    Start taking tests to appear on the leaderboard!
                  </p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Leaderboard
