import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CSmartTable,
  CAlert,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
} from '@coreui/react-pro'
import { getModules, getTestResults, getProgressTracking } from '../../services/api'
import axios from 'axios'

const Grades = () => {
  const [modules, setModules] = useState([])
  const [testResults, setTestResults] = useState([])
  const [progressTracking, setProgressTracking] = useState([])
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('')

  const [newTestResult, setNewTestResult] = useState({
    test_id: '',
    student_id: '',
    score: '',
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const API_BASE_URL = 'https://backend-express-production-daa1.up.railway.app/api' // Replace with your API URL

  const endpoints = [
    // '/users',
    // '/courses',
    '/progress',
    // '/tests',
    // '/enrollments',
    '/modules',
    // '/module-contents',
    '/test-results',
    // '/questions',
    // '/choices',
  ]

  const fetchAllTables = async () => {
    try {
      // Use Promise.all to fetch data from all endpoints concurrently
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          axios.get(`${API_BASE_URL}${endpoint}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ),
      )

      // Log each table's data to the console
      responses.forEach((response, index) => {
        // console.log(`Data from ${endpoints[index]}:`, response.data)
      })
    } catch (error) {
      console.error('Error fetching API data:', error)
    }
  }

  fetchAllTables()

  const fetchAllData = async () => {
    try {
      const [modulesData, testResultsData, progressTrackingData] = await Promise.all([
        getModules(),
        getTestResults(),
        getProgressTracking(),
      ])
      setModules(modulesData)
      setTestResults(testResultsData)
      setProgressTracking(progressTrackingData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setAlertMessage('Failed to fetch data. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTestResult((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleAddTestResult = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/test-results`, newTestResult, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      // Show success alert and refresh data
      setAlertMessage('Test result added successfully!')
      setAlertColor('success')
      setAlertVisible(true)
      fetchAllData() // Refresh data
      setNewTestResult({ test_id: '', student_id: '', score: '' }) // Reset form
    } catch (error) {
      console.error('Error adding test result:', error)
      setAlertMessage('Failed to add test result. Please try again.')
      setAlertColor('danger')
      setAlertVisible(true)
    }
  }

  const moduleColumns = [
    { key: 'module_id', label: 'module_id', _style: { width: '10%' } },
    { key: 'module_title', label: 'module_title', _style: { width: '40%' } },
    { key: 'module_type', label: 'Description', _style: { width: '50%' } },
  ]

  const testResultsColumns = [
    // { key: 'result_id ', label: 'result_id ', _style: { width: '10%' } },
    { key: 'test_id', label: 'test_id', _style: { width: '10%' } },
    { key: 'student_id', label: 'student_id', _style: { width: '40%' } },
    { key: 'score', label: 'score', _style: { width: '50%' } },
  ]

  const progressTrackingColumns = [
    { key: 'progress_id', label: 'progress_id', _style: { width: '10%' } },
    // { key: 'course_id', label: 'course_id', _style: { width: '20%' } },
    { key: 'student_id', label: 'student_id', _style: { width: '20%' } },
    { key: 'module_id', label: 'module_id', _style: { width: '20%' } },
    { key: 'status', label: 'status', _style: { width: '20%' } },
    { key: 'completed_at', label: 'completed_at', _style: { width: '20%' } },
  ]

  return (
    <CContainer>
      <h1>Grades and Progress</h1>

      {alertVisible && (
        <CAlert color={alertColor} onClose={() => setAlertVisible(false)} dismissible>
          {alertMessage}
        </CAlert>
      )}

      <CRow className="mb-4">
        <CCol>
          <h2>Modules</h2>
          <CSmartTable
            columns={moduleColumns}
            items={modules}
            columnFilter
            pagination
            itemsPerPage={10}
            tableProps={{
              responsive: true,
              striped: true,
              hover: true,
            }}
          />
        </CCol>
      </CRow>

      {/* Form to Add Test Result */}
      <CRow className="mb-4">
        <CCol>
          <h2>Add Test Result</h2>
          <CForm onSubmit={handleAddTestResult}>
            <CRow>
              <CCol>
                <CFormLabel htmlFor="test_id">Test ID</CFormLabel>
                <CFormInput
                  type="number"
                  id="test_id"
                  name="test_id"
                  value={newTestResult.test_id}
                  onChange={handleInputChange}
                  placeholder="Enter Test ID"
                  required
                />
              </CCol>
              <CCol>
                <CFormLabel htmlFor="student_id">Student ID</CFormLabel>
                <CFormInput
                  type="number"
                  id="student_id"
                  name="student_id"
                  value={newTestResult.student_id}
                  onChange={handleInputChange}
                  placeholder="Enter Student ID"
                  required
                />
              </CCol>
              <CCol>
                <CFormLabel htmlFor="score">Score</CFormLabel>
                <CFormInput
                  type="number"
                  id="score"
                  name="score"
                  value={newTestResult.score}
                  onChange={handleInputChange}
                  placeholder="Enter Score"
                  required
                />
              </CCol>
              <CCol>
                <CButton type="submit" color="primary" style={{ marginTop: '32px' }}>
                  Add Test Result
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol>
          <h2>Test Results</h2>
          <CSmartTable
            columns={testResultsColumns}
            items={testResults}
            columnFilter
            pagination
            itemsPerPage={10}
            tableProps={{
              responsive: true,
              striped: true,
              hover: true,
            }}
          />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol>
          <h2>Progress Tracking</h2>
          <CSmartTable
            columns={progressTrackingColumns}
            items={progressTracking}
            columnFilter
            pagination
            itemsPerPage={10}
            tableProps={{
              responsive: true,
              striped: true,
              hover: true,
            }}
          />
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Grades
