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
import { cilStar, cilPeople, cilChart, cilChartLine } from '@coreui/icons'
import { getAllTests, getTestResults, getUsers } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrophy,
  faAward,
  faStar,
  faMedal,
  faCrown
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
  }

  const getTopThreeStyles = (position) => {
    const baseStyles = {
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.5s ease-in-out',
    }

    switch(position) {
      case 0:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          transform: 'scale(1.05)',
          zIndex: 3,
          boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2)',
        }
      case 1:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #E8E8E8 0%, #B8B8B8 100%)',
          zIndex: 2,
          boxShadow: '0 6px 20px rgba(184, 184, 184, 0.2)',
        }
      case 2:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
          zIndex: 1,
          boxShadow: '0 6px 20px rgba(205, 127, 50, 0.2)',
        }
      default:
        return baseStyles
    }
  }
  
  const renderStats = () => {
    const totalStudents = leaderboardData.length
    const averageScore = leaderboardData.reduce((acc, curr) => acc + curr.averageScore, 0) / totalStudents || 0
    const highestScore = Math.max(...leaderboardData.map(student => student.averageScore))

    const statCards = [
      {
        icon: cilPeople,
        color: 'primary',
        label: 'Total Pelajar',
        value: totalStudents,
        suffix: ''
      },
      {
        icon: cilChart,
        color: 'success',
        label: 'Rata-rata Nilai',
        value: averageScore.toFixed(1),
        suffix: '%'
      },
      {
        icon: cilChartLine,
        color: 'warning',
        label: 'Nilai Tertinggi',
        value: highestScore,
        suffix: '%'
      }
    ]

    return (
      <CRow className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <CCol key={index} xs={12} md={4}>
            <CCard className="h-100 border-0 shadow-sm hover-shadow">
              <CCardBody className="d-flex align-items-center p-4">
                <div className={`bg-${stat.color}-subtle p-3 rounded-4 me-3`}>
                  <CIcon icon={stat.icon} size="xl" className={`text-${stat.color}`} />
                </div>
                <div>
                  <h6 className="text-medium-emphasis small mb-1">{stat.label}</h6>
                  <h2 className="mb-0 fw-bold">
                    {stat.value}{stat.suffix}
                  </h2>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    )
  }

  const renderTopThree = () => {
    const topThree = leaderboardData.slice(0, 3)
    const badgeIcons = [faCrown, faMedal, faStar]
    const positions = ['First', 'Second', 'Third']

    return (
      <CRow className="g-4 mb-5 py-4 align-items-stretch">
        {[1, 0, 2].map((index) => (
          <CCol key={index} xs={12} md={4} className="d-flex align-items-stretch">
            {topThree[index] && (
              <CCard 
                className="w-100 border-0 overflow-hidden position-relative animate-card"
                style={getTopThreeStyles(index)}
              >
                <div className="position-absolute top-0 start-0 p-3">
                  <span className={`badge rounded-pill bg-${getScoreColor(topThree[index].averageScore)}`}>
                    #{index + 1}
                  </span>
                </div>
                
                <CCardBody className="text-center p-4">
                  <div className="mb-4 achievement-icon">
                    <FontAwesomeIcon 
                      icon={badgeIcons[index]} 
                      size="3x"
                      className={`text-${index === 0 ? 'warning' : index === 1 ? 'secondary' : 'danger'}`}
                    />
                  </div>
                  
                  <h3 className="mb-3 fw-bold" style={{ fontSize: index === 1 ? '1.75rem' : '1.5rem' }}>
                    {topThree[index].name}
                  </h3>
                  
                  <div className="score-display mb-3">
                    <div className="fs-2 fw-bold mb-1">
                      {topThree[index].averageScore}%
                    </div>
                    <span className={`badge bg-${getScoreColor(topThree[index].averageScore)} px-3 py-2`}>
                      {topThree[index].averageScore >= 80 ? 'Excellent' : 
                       topThree[index].averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                  
                  <div className="text-muted">
                    <small>Completed {topThree[index].totalTests} Tests</small>
                  </div>
                </CCardBody>
              </CCard>
            )}
          </CCol>
        ))}
      </CRow>
    )
  }

  const renderLeaderboardTable = () => {
    return (
      <CCard className="border-0 shadow-sm">
        <CCardHeader className="bg-transparent border-bottom p-4">
          <h5 className="mb-0">Complete Rankings</h5>
        </CCardHeader>
        <CCardBody className="p-0">
          <div className="table-responsive">
            <CTable hover borderless className="mb-0">
              <CTableHead className="bg-light">
                <CTableRow>
                  <CTableHeaderCell className="text-center" style={{ width: '80px' }}>Rank</CTableHeaderCell>
                  <CTableHeaderCell>Student</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Average Score</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Tests Completed</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {leaderboardData.map((student, index) => (
                  <CTableRow 
                    key={student.studentId}
                    className={`align-middle ${index < 3 ? 'table-active' : ''}`}
                  >
                    <CTableDataCell className="text-center">
                      {index < 3 ? (
                        <FontAwesomeIcon
                          icon={index === 0 ? faCrown : index === 1 ? faMedal : faStar}
                          className={`text-${index === 0 ? 'warning' : index === 1 ? 'secondary' : 'danger'}`}
                        />
                      ) : (
                        <span className="text-muted">{index + 1}</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <div className="ms-2">
                          <div className="fw-semibold">{student.name}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <span className={`badge bg-${getScoreColor(student.averageScore)} px-2 py-1`}>
                        {student.averageScore}%
                      </span>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <CIcon icon={cilChart} size="sm" className="text-primary" />
                        <span>{student.totalTests}</span>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
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
    <CContainer className="p-4">
      <CCard className="border-0 shadow-lg">
        <CCardHeader className="bg-transparent border-bottom-0 p-4">
          <div className="d-flex align-items-center">
            <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
              <CIcon icon={cilStar} size="xl" className="text-warning" />
            </div>
            <div>
              <h2 className="mb-1">Leaderboard</h2>
              <p className="text-medium-emphasis mb-0">
                View rankings and student performance
              </p>
            </div>
          </div>
        </CCardHeader>
        
        <CCardBody className="p-4">
          {renderStats()}
          {renderTopThree()}
          {renderLeaderboardTable()}
        </CCardBody>
      </CCard>

      <style>
        {`
          .hover-shadow {
            transition: all 0.3s ease;
          }
          .hover-shadow:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
          }
          
          .animate-card {
            transition: all 0.3s ease;
          }
          .animate-card:hover {
            transform: translateY(-10px);
          }
          
          .achievement-icon {
            transition: all 0.3s ease;
          }
          .animate-card:hover .achievement-icon {
            transform: scale(1.1);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </CContainer>
  )
}

export default Leaderboard
