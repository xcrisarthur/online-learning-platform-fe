/* eslint-disable prettier/prettier */
// src/services/api.js
import axios from 'axios'

const API_URL = 'https://backend-express-production-daa1.up.railway.app/api' // URL backend

// Function to get the token from localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Axios instance setup with basic configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
})

// Interceptor to add token to the header of each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// AuthService functions
const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
  },
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  },
}

// Courses functions
const getCourses = async () => {
  try {
    const response = await axiosInstance.get('/courses')
    return response.data
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw error
  }
}

const getCourseById = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/courses/${courseId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching course:', error)
    throw error
  }
}

const createCourse = async (courseData) => {
  try {
    const response = await axiosInstance.post('/courses', courseData)
    return response.data
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

// CRUD Functions for Questions

// Create a new question
const createQuestion = async (questionData) => {
  try {
    const response = await axiosInstance.post(`/questions`, questionData)
    return response.data
  } catch (error) {
    console.error('Error creating question:', error)
    throw error
  }
}

// Get questions by test ID
const getQuestionsByTestId = async (testId) => {
  try {
    const response = await axiosInstance.get(`/questions/test/${testId}/questions`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching questions by test ID:', error)
    throw error
  }
}

// Update a question
const updateQuestion = async (questionId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/questions/${questionId}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error updating question:', error)
    throw error
  }
}

// Delete a question
const deleteQuestion = async (questionId) => {
  try {
    const response = await axiosInstance.delete(`/questions/${questionId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting question:', error)
    throw error
  }
}

// Other course-related functions
const getModulesByCourse = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/modules/${courseId}`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching modules:', error)
    return []
  }
}

const getModuleContent = async (moduleId) => {
  try {
    const response = await axiosInstance.get(`/modules/content/${moduleId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching module content:', error)
    throw error
  }
}

// Enrolled Courses functions
const getEnrolledCourses = async () => {
  try {
    const response = await axiosInstance.get('/enrollments/enrolled')
    return response.data
  } catch (error) {
    console.error('Error fetching enrolled courses:', error)
    throw error
  }
}

const getModuleContentByModuleId = async (moduleId) => {
  try {
    const response = await axiosInstance.get(`module-contents/module/${moduleId}/contents`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching module content by module ID:', error)
    throw error
  }
}

const getModuleContentJrByModuleId = async (moduleId) => {
  try {
    const response = await axiosInstance.get(`module-contents-junior/module/${moduleId}/contents`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching module content by module ID:', error)
    throw error
  }
}

const getTestsByModuleId = async (moduleId) => {
  try {
    const response = await axiosInstance.get(`/tests/module/${moduleId}/tests`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching tests by module ID:', error)
    throw error
  }
}

const getAllTests = async () => {
  try {
    const response = await axiosInstance.get('/tests')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching all tests:', error)
    throw error
  }
}

const getChoicesByQuestionId = async (questionId) => {
  try {
    const response = await axiosInstance.get(`/choices/questions/${questionId}`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching choices by question ID:', error)
    throw error
  }
}

// Create a choice for a specific question ID
const createChoice = async (questionId, choiceData) => {
  try {
    const response = await axiosInstance.post(`/choices`, {
      question_id: questionId,
      choice_text: choiceData.choice_text,
      is_correct: choiceData.is_correct,
    })
    return response.data
  } catch (error) {
    console.error('Error creating choice:', error)
    throw error
  }
}

// Update a choice for a specific choice ID
const updateChoice = async (choiceId, choiceData) => {
  try {
    const response = await axiosInstance.put(`/choices/${choiceId}`, choiceData)
    return response.data
  } catch (error) {
    console.error('Error updating choice:', error)
    throw error
  }
}

const deleteChoice = async (choiceId) => {
  try {
    const response = await axiosInstance.delete(`/choices/${choiceId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting choice:', error)
    throw error
  }
}

// Update a module
const updateModule = async (moduleId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/modules/${moduleId}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error in updateModule:', error)
    throw error
  }
}

// Delete a module
const deleteModule = async (moduleId) => {
  try {
    const response = await axiosInstance.delete(`/modules/${moduleId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting module:', error)
    throw error
  }
}

const updateModuleContent = async (contentId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/module-contents/${contentId}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error updating module content:', error)
    throw error
  }
}

const updateModuleContentJr = async (contentId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/module-contents-junior/${contentId}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error updating module content:', error)
    throw error
  }
}

const createModule = async (modules) => {
  try {
    const response = await axiosInstance.post('/modules', modules)
    return response.data
  } catch (error) {
    console.error('Error creating module:', error)
    throw error
  }
}

const getModuleById = async (moduleId) => {
  try {
    const response = await axiosInstance.get(`/modules/MdlId/${moduleId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching module by ID:', error)
    throw error
  }
}

// Function to fetch all users
const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/users') // Adjust the endpoint as needed
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Function to create a new user
const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users', userData) // Adjust the endpoint as needed
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Function to update an existing user
const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}`, userData) // Adjust the endpoint as needed
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Function to delete a user
const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`) // Adjust the endpoint as needed
    return response.data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

const getCoursesEnrollment = async () => {
  try {
    const response = await axiosInstance.get('/enrollments')
    return response.data
  } catch (error) {
    console.error('Error fetching course enrollments:', error)
    throw error
  }
}

const updateEnrollment = async (enrollmentId, enrollmentData) => {
  try {
    const response = await axiosInstance.put(`/enrollments/${enrollmentId}`, enrollmentData)
    return response.data
  } catch (error) {
    console.error('Error updating enrollment:', error)
    throw error
  }
}

const createEnrollment = async (enrollmentData) => {
  try {
    const response = await axiosInstance.post('/enrollments', enrollmentData)
    return response.data
  } catch (error) {
    console.error('Error creating enrollment:', error)
    throw error
  }
}

const deleteEnrollmentsByUserId = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/enrollments/user/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting enrollments:', error)
    throw error
  }
}

const getModules = async () => {
  try {
    const response = await axiosInstance.get('/modules')
    return response.data
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw error
  }
}

const getTestResults = async () => {
  try {
    const response = await axiosInstance.get('/test-results')
    return response.data
  } catch (error) {
    console.error('Error fetching test results:', error)
    throw error
  }
}

const getProgressTracking = async () => {
  try {
    const response = await axiosInstance.get('/progress')
    return response.data
  } catch (error) {
    console.error('Error fetching progress tracking:', error)
    throw error
  }
}

// Export functions
export {
  authService,
  getCourses,
  getCourseById,
  createCourse,
  getModulesByCourse,
  getModuleContent,
  getEnrolledCourses,
  getModuleContentByModuleId,
  getQuestionsByTestId,
  getTestsByModuleId,
  getAllTests,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getChoicesByQuestionId,
  createChoice,
  deleteChoice,
  updateChoice,
  updateModuleContent,
  createModule,
  updateModule,
  deleteModule,
  getModuleById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCoursesEnrollment,
  updateEnrollment,
  createEnrollment,
  deleteEnrollmentsByUserId,
  getModules,
  getTestResults,
  getProgressTracking,
  getModuleContentJrByModuleId,
  updateModuleContentJr,
}
