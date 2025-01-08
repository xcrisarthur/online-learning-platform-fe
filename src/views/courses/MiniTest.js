/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CCollapse,
  CFormCheck,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CLoadingButton,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CAlert,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CToastClose,
  CSmartTable,
  CCardHeader,
  CListGroup,
  CListGroupItem,
} from '@coreui/react-pro'
import {
  getQuestionsByTestId,
  getChoicesByQuestionId,
  updateQuestion,
  deleteQuestion,
  createQuestion,
  createChoice,
  updateChoice,
  deleteChoice,
  getTestResults,
  getModuleById,
  getTestById,
} from '../../services/api'
import axios from 'axios'

const MiniTest = () => {
  const { test_id } = useParams()
  const [isVisible, setIsVisible] = useState(false)
  const [questions, setQuestions] = useState([])
  const [choices, setChoices] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState('')
  // const [newChoiceText, setNewChoiceText] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showSaveAlert, setShowSaveAlert] = useState(false)
  const [showAddAlert, setShowAddAlert] = useState(false)

  // Add Question State
  // const [addModalVisible, setAddModalVisible] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [showEmptyInputWarningModal, setShowEmptyInputWarningModal] = useState(false)
  const [showEmptyChoiceWarningModal, setShowEmptyChoiceWarningModal] = useState(false)
  const [showChoiceInputToast, setShowChoiceInputToast] = useState(false)

  // const [newChoiceIsCorrect, setNewChoiceIsCorrect] = useState(0) // Default to "Salah"

  // Edit Question State
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editedQuestionText, setEditedQuestionText] = useState('')
  const [editedChoices, setEditedChoices] = useState([])

  // Delete Confirmation Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)

  // Delete Confirmation Modal for Choices
  const [deleteChoiceModalVisible, setDeleteChoiceModalVisible] = useState(false)
  const [choiceToDelete, setChoiceToDelete] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  const [questionMode, setQuestionMode] = useState('single')
  const [inputFields, setInputFields] = useState([''])
  const [numFields, setNumFields] = useState(2)

  const [choiceMode, setChoiceMode] = useState('single')
  const [choiceInputFields, setChoiceInputFields] = useState([{ text: '', is_correct: 0 }])
  const [numChoiceFields, setNumChoiceFields] = useState(2)

  const [isTestEnded, setIsTestEnded] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [showRefreshInstruction, setShowRefreshInstruction] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [countdown, setCountdown] = useState(0)
  const [username, setUsername] = useState('')

  // Tambahkan state untuk menyimpan nilai
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)

  const [testResults, setTestResults] = useState([])

  // Tambahkan state baru di awal komponen
  const [attempts, setAttempts] = useState([]) // Untuk menyimpan semua percobaan
  const [finalScore, setFinalScore] = useState(null) // Untuk menyimpan score akhir
  const [attemptsCount, setAttemptsCount] = useState(0) // Untuk menghitung jumlah percobaan

  // Tambahkan state untuk modal peringatan
  const [devToolsWarning, setDevToolsWarning] = useState({
    visible: false,
    message: '',
    title: '',
  })
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState(0)

  // hosting railway
    const API_BASE_URL = 'https://backend-express-production-daa1.up.railway.app/api' 

  // Local
  // const API_BASE_URL = 'http://localhost:3000/api' 

  // Handle button click to start the test (student only)
  const handleStartTest = () => {
    if (!isVisible) {
      // Enter full screen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen()
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen()
      }
      setIsVisible(true)
      setIsTestEnded(false) // Reset isTestEnded
      setShowRefreshInstruction(false)
      setSelectedOptions({}) // Reset jawaban
      setScore(0) // Reset score
      setShowScore(false) // Reset tampilan score
    }
  }

  const [testAlert, setTestAlert] = useState({
    visible: false,
    color: '',
    message: '',
  })
  // console.log(test_id)
  const handleFinishTest = async () => {
    const getTestId = await getTestById(test_id)
    const getModuleId = getTestId.module_id
    const moduleData = await getModuleById(getModuleId)
    const moduleName = moduleData.module_title

    if (isVisible) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }

      // Get user ID from storage
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')

      // Menghitung score
      const correctCount = Object.values(selectedOptions).filter(
        (selection) => selection.is_correct === true,
      ).length

      const totalQuestions = questions.length
      const calculatedScore = (correctCount / totalQuestions) * 100

      // Simpan score ke dalam array attempts
      setAttempts((prevAttempts) => [...prevAttempts, calculatedScore])
      setAttemptsCount((prev) => prev + 1)

      // Tentukan final score berdasarkan jumlah percobaan jika score 100
      // Jika mendapat score 100, simpan semua attempts ke database
      if (calculatedScore === 100) {
        try {
          // Tentukan score akhir berdasarkan jumlah percobaan
          let finalScoreToSubmit
          if (attempts.length === 0) {
            finalScoreToSubmit = 100 // Percobaan pertama
          } else if (attempts.length === 1) {
            finalScoreToSubmit = 80 // Percobaan kedua
          } else {
            finalScoreToSubmit = 60 // Percobaan ketiga dst
          }

          // Simpan semua percobaan sebelumnya
          for (let i = 0; i < attempts.length; i++) {
            await axios.post(
              `${API_BASE_URL}/test-results`,
              {
                test_id: test_id,
                student_id: userId,
                score: attempts[i],
                is_final: false, // Tandai sebagai percobaan non-final
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              },
            )
          }

          // Simpan percobaan terakhir (score 100) dengan score yang disesuaikan
          const response = await axios.post(
            `${API_BASE_URL}/test-results`,
            {
              test_id: test_id,
              student_id: userId,
              score: finalScoreToSubmit,
              is_final: true, // Tandai sebagai percobaan final
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          )

          if (response.status === 201) {
            setTestAlert({
              visible: true,
              color: 'success',
              message: `Selamat! Anda berhasil menyelesaikan tes dengan nilai akhir ${finalScoreToSubmit}!`,
            })

            // Add announcement data
            await axios.post(
              `${API_BASE_URL}/announcements`,
              {
                module_id: test_id,
                user_id: userId,
                announcement_text: `Selamat Anda Telah Menyelesaikan ${moduleName}`,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              },
            )

            fetchAllData()
            setTimeout(() => {
              window.location.reload()
            }, 500)
          }
        } catch (error) {
          console.error('Error menyimpan test result:', error)
          setTestAlert({
            visible: true,
            color: 'danger',
            message: 'Gagal menyimpan test result!',
          })
        }
      } else {
        // Jika belum 100, tampilkan pesan untuk mencoba lagi
        setTestAlert({
          visible: true,
          color: 'warning',
          message: `Anda mendapat nilai ${calculatedScore}. Anda harus mendapatkan nilai 100 untuk bisa lanjut ke materi berikutnya. Silakan coba lagi.`,
        })
      }

      setScore(calculatedScore)
      setShowScore(true)
      setIsVisible(false)
      setIsTestEnded(false) // Set false agar bisa mencoba lagi
      setSelectedOptions({})
    }
  }

  // Track selected option for each question
  const handleOptionChange = (questionId, choiceId, isCorrect) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [questionId]: { choice_id: choiceId, is_correct: isCorrect },
    }))
  }

  const openDeleteChoiceToast = (choice) => {
    setChoiceToDelete(choice)
    setToastVisible(true)
  }
  // Function to handle deleting a choice
  const handleDeleteChoice = async (choiceId) => {
    try {
      await deleteChoice(choiceId) // Panggil API untuk menghapus pilihan

      setChoices((prevChoices) => {
        const updatedChoices = { ...prevChoices }
        const questionChoices = updatedChoices[editingQuestion.question_id] || []
        updatedChoices[editingQuestion.question_id] = questionChoices.filter(
          (choice) => choice.choice_id !== choiceId,
        )
        return updatedChoices
      })

      // Perbarui state `editedChoices` dengan menghapus pilihan yang sudah dihapus
      setEditedChoices((prevChoices) =>
        prevChoices.filter((choice) => choice.choice_id !== choiceId),
      )

      // Tampilkan alert penghapusan sukses dan atur durasi tampilannya
      setShowDeleteAlert(true)
      setTimeout(() => setShowDeleteAlert(false), 3000) // Tampilkan selama 1,5 detik

      setDeleteChoiceModalVisible(false)
    } catch (error) {
      console.error('Error deleting choice:', error)
      alert('Gagal menghapus pilihan. Silakan coba lagi.')
    }
  }

  const handleChoiceModeChange = (e) => {
    const mode = e.target.value
    setChoiceMode(mode)
    if (mode === 'single') {
      setChoiceInputFields(['']) // Single input field for single choice mode
    } else if (mode === 'multiple') {
      setChoiceInputFields(Array(numChoiceFields).fill('')) // Initialize with multiple fields
    }
  }

  // Function untuk handle Add Choices dengan validasi input
  const handleDirectAddChoice = async () => {
    // Cek apakah semua input pilihan kosong
    const newChoices = choiceInputFields.filter((choice) => choice?.text?.trim() !== '')
    if (newChoices.length === 0) {
      setShowChoiceInputToast(true) // Tampilkan modal peringatan jika semua input kosong
      return
    }

    try {
      const createdChoices = []
      for (let choice of newChoices) {
        const createdChoice = await createChoice(editingQuestion.question_id, {
          choice_text: choice.text,
          is_correct: choice.is_correct,
        })
        createdChoices.push(createdChoice)
      }

      setChoices((prevChoices) => ({
        ...prevChoices,
        [editingQuestion.question_id]: [
          ...(prevChoices[editingQuestion.question_id] || []),
          ...createdChoices,
        ],
      }))

      setEditedChoices((prevChoices) => [...prevChoices, ...createdChoices])
      setChoiceInputFields([{ text: '', is_correct: 0 }]) // Reset input fields setelah penambahan

      // Tampilkan modal sukses dan setel timer untuk menutupnya
      // setShowSuccessModal(true)
      // setTimeout(() => setShowSuccessModal(false), 3000)
    } catch (error) {
      console.error('Error adding choices:', error)
      // alert('Failed to add choices. Please try again.')
      setShowChoiceInputToast(true)
    }
  }

  const handleNumChoiceFieldsChange = (e) => {
    const num = parseInt(e.target.value)
    setChoiceInputFields(Array(num).fill({ text: '', is_correct: 0 })) // Reset fields with default values
  }

  const handleChoiceInputChange = (index, value) => {
    setChoiceInputFields((prevFields) =>
      prevFields.map((field, i) => (i === index ? { ...field, text: value } : field)),
    )
  }

  const handleChoiceIsCorrectChange = (index, value) => {
    setChoiceInputFields((prevFields) =>
      prevFields.map((field, i) =>
        i === index ? { ...field, is_correct: parseInt(value) } : field,
      ),
    )
  }

  const handleQuestionModeChange = (e) => {
    const mode = e.target.value
    setQuestionMode(mode)
    if (mode === 'single') {
      setInputFields(['']) // Reset to a single input field
    } else if (mode === 'multiple') {
      setInputFields(Array(numFields).fill('')) // Initialize based on selected number
    }
  }

  const handleNumFieldsChange = (e) => {
    const num = parseInt(e.target.value)
    setNumFields(num)
    setInputFields(Array(num).fill('')) // Adjust the number of input fields based on the selected number
  }

  const handleInputChange = (index, value) => {
    setInputFields((prevInputs) => prevInputs.map((input, i) => (i === index ? value : input)))
  }

  // Check if all questions have been answered
  const allQuestionsAnswered = questions.every((question) => selectedOptions[question.question_id])

  useEffect(() => {
    // Reset state saat komponen di-mount
    setIsTestEnded(false)
    setIsVisible(false)
    setSelectedOptions({})
    setScore(0)
    setShowScore(false)
  }, []) // Empty dependency array means this runs once when component mounts

  // Tambahkan fungsi untuk deteksi device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }

  useEffect(() => {
    if (userRole === 'student' && !isMobileDevice()) {
      // Deteksi DevTools
      const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160
        const heightThreshold = window.outerHeight - window.innerHeight > 160

        if (widthThreshold || heightThreshold) {
          setIsVisible(false)
          setIsTestEnded(true)
          setIsButtonDisabled(true)
          setCountdown(60)

          localStorage.setItem('countdown', 60)
          localStorage.setItem('startTime', Date.now().toString())

          setDevToolsWarning({
            visible: true,
            title: 'Developer Tools Terdeteksi!',
            message:
              'Penggunaan Developer Tools tidak diperbolehkan selama tes berlangsung. Tes telah dihentikan.',
          })
        }
      }

      // Definisikan handleKeyPress
      const handleKeyPress = (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault()
          setIsVisible(false)
          setIsTestEnded(true)
          setIsButtonDisabled(true)
          setCountdown(60)

          localStorage.setItem('countdown', 60)
          localStorage.setItem('startTime', Date.now().toString())

          setDevToolsWarning({
            visible: true,
            title: 'Akses Terlarang!',
            message:
              'Penggunaan shortcut Developer Tools (F12 atau Ctrl+Shift+I) tidak diperbolehkan selama tes berlangsung. Tes telah dihentikan.',
          })
        }
      }

      // Definisikan handleContextMenu
      const handleContextMenu = (e) => {
        e.preventDefault()
        setDevToolsWarning({
          visible: true,
          title: 'Akses Terlarang!',
          message: 'Penggunaan menu klik kanan tidak diperbolehkan selama tes berlangsung.',
        })
      }

      // Definisikan handleOrientationChange untuk mobile
      const handleOrientationChange = () => {
        if (isMobileDevice() && window.orientation !== 0) {
          setDevToolsWarning({
            visible: true,
            title: 'Peringatan!',
            message:
              'Mohon gunakan perangkat dalam mode portrait (vertikal) selama tes berlangsung.',
          })
        }
      }

      // Event listeners
      window.addEventListener('resize', detectDevTools)
      window.addEventListener('keydown', handleKeyPress)
      window.addEventListener('contextmenu', handleContextMenu)
      window.addEventListener('orientationchange', handleOrientationChange)

      // Cleanup
      return () => {
        window.removeEventListener('resize', detectDevTools)
        window.removeEventListener('keydown', handleKeyPress)
        window.removeEventListener('contextmenu', handleContextMenu)
        window.removeEventListener('orientationchange', handleOrientationChange)
      }
    }
  }, [userRole, countdown])

  useEffect(() => {
    fetchAllData()
    if (userRole === 'student') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && isVisible) {
          alert('You are not allowed to switch tabs during the test. Test has ended.')
          setIsVisible(false)
          setIsTestEnded(true)
          setIsButtonDisabled(true)
          setCountdown(10)

          // Set countdown and start time in localStorage
          localStorage.setItem('countdown', 10)
          localStorage.setItem('startTime', Date.now().toString())

          // Start 10-second countdown
          const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => {
              if (prevCountdown <= 1) {
                clearInterval(countdownInterval)
                setIsButtonDisabled(false)
                setCountdown(0)
                setShowRefreshInstruction(true)
                localStorage.removeItem('countdown')
                localStorage.removeItem('startTime')
                return 0
              }
              const newCountdown = prevCountdown - 1
              localStorage.setItem('countdown', newCountdown)
              return newCountdown
            })
          }, 1000)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [isVisible, userRole])

  useEffect(() => {
    const roleFromStorage = localStorage.getItem('role') || sessionStorage.getItem('role')
    setUserRole(roleFromStorage)
    if (userRole === 'student') {
      const storedCountdown = localStorage.getItem('countdown')
      const storedStartTime = localStorage.getItem('startTime')

      if (storedCountdown && storedStartTime) {
        const elapsed = Math.floor((Date.now() - parseInt(storedStartTime, 10)) / 1000)
        const remainingTime = parseInt(storedCountdown, 10) - elapsed

        if (remainingTime > 0) {
          setCountdown(remainingTime)
          setIsButtonDisabled(true)
          setShowRefreshInstruction(false)

          // Start the countdown
          const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => {
              if (prevCountdown <= 1) {
                clearInterval(countdownInterval)
                setIsButtonDisabled(false)
                setCountdown(0)
                setShowRefreshInstruction(true)
                localStorage.removeItem('countdown')
                localStorage.removeItem('startTime')
                return 0
              }
              return prevCountdown - 1
            })
          }, 1000)

          return () => clearInterval(countdownInterval)
        } else {
          localStorage.removeItem('countdown')
          localStorage.removeItem('startTime')
        }
      }
    }
  }, [userRole])

  useEffect(() => {
    const fetchQuestionsAndChoices = async () => {
      try {
        setLoading(true)
        setError(null)
        const questionsData = await getQuestionsByTestId(test_id)

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]) // Kosongkan state pertanyaan jika tidak ada data
          setError('Belum ada data pertanyaan.') // Tampilkan pesan error di UI
          return
        }

        setQuestions(questionsData)

        // Fetch choices for each question
        const choicesData = {}
        for (let question of questionsData) {
          try {
            const questionChoices = await getChoicesByQuestionId(question.question_id)
            choicesData[question.question_id] = questionChoices
          } catch (error) {
            // Skip if the error is 404, otherwise throw the error
            if (error.response && error.response.status === 404) {
              console.warn(`Choices not found for question ID ${question.question_id}, skipping...`)
            } else {
              throw error // Re-throw other errors
            }
          }
        }
        setChoices(choicesData)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('Belum ada data pertanyaan.') // Pesan khusus untuk 404
        } else {
          setError('Failed to fetch test questions or choices.')
          console.error('Error fetching test data:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    // Ambil `userId`, `firstName`, dan `lastName` dari localStorage
    const storedUserId = localStorage.getItem('userId')
    const firstName = localStorage.getItem('firstName')
    const lastName = localStorage.getItem('lastName')

    // Gabungkan `firstName` dan `lastName` sebagai username
    if (firstName && lastName) {
      setUsername(`${firstName} ${lastName}`)
    }

    if (test_id) fetchQuestionsAndChoices()
  }, [test_id])

  useEffect(() => {
    setCurrentAttemptNumber(attempts.length)
  }, [attempts])

  // Handle opening the edit modal with question and choice data
  const openEditModal = async (question) => {
    setEditingQuestion(question)
    setEditedQuestionText(question.question_text)

    try {
      const questionChoices = await getChoicesByQuestionId(question.question_id)
      setEditedChoices(questionChoices)
    } catch (error) {
      console.error('Error fetching choices for editing:', error)
    }

    setEditModalVisible(true)
  }

  // Handle saving edits to the question and its choices
  const handleSaveEdit = async () => {
    try {
      // Mengambil question yang sedang diedit dan memperbarui teks pertanyaan
      const updatedQuestion = {
        ...editingQuestion,
        question_text: editedQuestionText, // Menggunakan nilai dari CFormInput yang telah diubah
      }

      // Update pertanyaan
      await updateQuestion(updatedQuestion.question_id, updatedQuestion)

      // Update setiap pilihan yang ada
      const updatedChoices = await Promise.all(
        editedChoices.map(async (choice) => {
          const updatedChoice = await updateChoice(choice.choice_id, {
            choice_text: choice.choice_text,
            is_correct: choice.is_correct,
          })
          return updatedChoice
        }),
      )

      // Perbarui state untuk langsung menampilkan perubahan
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.question_id === updatedQuestion.question_id ? updatedQuestion : q,
        ),
      )

      setChoices((prevChoices) => ({
        ...prevChoices,
        [editingQuestion.question_id]: updatedChoices,
      }))
      setEditModalVisible(false)

      // Tampilkan alert sukses
      setShowSaveAlert(true)
      setTimeout(() => setShowSaveAlert(false), 3000) // Tampilkan selama 1,5 detik
    } catch (error) {
      console.error('Error updating question or choices:', error)
      alert('Gagal memperbarui data. Silakan coba lagi.')
    }
  }

  // Handle change in edit choices
  const handleChoiceChange = (index, newText) => {
    setEditedChoices((prevChoices) =>
      prevChoices.map((choice, i) => (i === index ? { ...choice, choice_text: newText } : choice)),
    )
  }

  const handleIsCorrectChange = (index, value) => {
    setEditedChoices((prevChoices) =>
      prevChoices.map((choice, i) =>
        i === index ? { ...choice, is_correct: parseInt(value) } : choice,
      ),
    )
  }

  // Handle opening delete confirmation modal
  const openDeleteModal = (question) => {
    setQuestionToDelete(question)
    setDeleteModalVisible(true)
  }

  // Handle delete question
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return // Ensure there is a question to delete

    try {
      // Panggil API delete untuk pertanyaan yang dipilih
      await deleteQuestion(questionToDelete.question_id)

      // Perbarui state dengan menghapus pertanyaan dari daftar questions
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q.question_id !== questionToDelete.question_id),
      )

      // Tampilkan alert sukses
      setShowDeleteAlert(true)
      setTimeout(() => setShowDeleteAlert(false), 3000) // Tampilkan selama 1,5 detik

      // Tutup modal konfirmasi setelah berhasil menghapus
      setDeleteModalVisible(false)
    } catch (error) {
      console.error('Error deleting question:', error)
      // Tampilkan pesan kesalahan atau peringatan jika ada masalah saat menghapus
      alert('Failed to delete question. Please try again.')
    }
  }

  // Function untuk handle Add Question dengan validasi input
  const handleDirectAddQuestion = async () => {
    const currentTimestamp = new Date().toISOString()

    if (questionMode === 'single') {
      // Cek apakah input kosong
      if (inputFields[0].trim() === '') {
        setShowEmptyInputWarningModal(true) // Tampilkan modal peringatan
        return // Hentikan fungsi jika input kosong
      }

      try {
        const newQuestion = {
          test_id,
          question_text: inputFields[0],
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
        }
        const createdQuestion = await createQuestion(newQuestion)
        setQuestions((prevQuestions) => [...prevQuestions, createdQuestion])
        setInputFields([''])

        setShowAddAlert(true)
        setTimeout(() => setShowAddAlert(false), 3000) // Tampilkan selama 1,5 detik
      } catch (error) {
        console.error('Error adding question:', error)
        alert('Gagal menambahkan pertanyaan. Silakan coba lagi.')
      }
    } else if (questionMode === 'multiple') {
      const questionsToAdd = inputFields.filter((text) => text.trim() !== '')

      // Cek apakah semua kolom input kosong
      if (questionsToAdd.length === 0) {
        setShowEmptyInputWarningModal(true) // Tampilkan modal peringatan
        return
      }

      const newQuestions = questionsToAdd.map((questionText) => ({
        test_id,
        question_text: questionText,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
      }))

      try {
        const createdQuestions = await Promise.all(
          newQuestions.map(async (question) => await createQuestion(question)),
        )
        setQuestions((prevQuestions) => [...prevQuestions, ...createdQuestions])
        setInputFields(Array(numFields).fill(''))

        setShowAddAlert(true)
        setTimeout(() => setShowAddAlert(false), 3000) // Tampilkan selama 1,5 detik
      } catch (error) {
        console.error('Error posting multiple questions:', error)
      }
    }
  }

  const fetchAllData = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const testResultsData = await getTestResults()

      const filteredResults = testResultsData
        .filter(
          (result) =>
            result.test_id === parseInt(test_id) && result.student_id === parseInt(userId),
        )
        .map((result) => {
          const date = new Date(result.completed_at)
          const formattedDate = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}, ${String(date.getDate()).padStart(2, '0')} - ${String(date.getMonth() + 1).padStart(2, '0')} - ${date.getFullYear()}`

          return {
            ...result,
            completed_at: formattedDate,
          }
        })

      setTestResults(filteredResults)
    } catch (error) {
      console.error('Error fetching data:', error)
      setTestAlert({
        visible: true,
        color: 'danger',
        message: 'Failed to fetch test results',
      })
    }
  }

  return (
    <>
      <CModal
        visible={devToolsWarning.visible}
        onClose={() => setDevToolsWarning((prev) => ({ ...prev, visible: false }))}
        alignment="center"
        backdrop="static" // Mencegah modal ditutup dengan klik background
        keyboard={false} // Mencegah modal ditutup dengan tombol ESC
      >
        <CModalHeader className="bg-danger text-white">
          <CModalTitle>
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-circle me-2"></i>
              {devToolsWarning.title || 'Peringatan!'}
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center py-4">
          <div className="mb-3">
            <i className="fas fa-times-circle text-danger" style={{ fontSize: '48px' }}></i>
          </div>
          <h5 className="mb-3">Tes Diberhentikan!</h5>
          <p>{devToolsWarning.message}</p>
          <p className="text-muted mt-2">
            Mohon tunggu {countdown} detik untuk memulai kembali tes.
          </p>
        </CModalBody>
        <CModalFooter className="justify-content-center border-top-0">
          <CButton
            color="danger"
            onClick={() => setDevToolsWarning((prev) => ({ ...prev, visible: false }))}
          >
            Saya Mengerti
          </CButton>
        </CModalFooter>
      </CModal>
      <CToaster placement="top-end">
        <CToast visible={toastVisible} autohide={false}>
          <CToastHeader closeButton>
            <strong className="me-auto">Delete Confirmation</strong>
          </CToastHeader>
          <CToastBody>
            Are you sure you want to delete this choice?
            <div className="mt-2">
              <CButton
                style={{ backgroundColor: '#EF9A9A', color: 'black' }}
                size="sm"
                onClick={() => {
                  handleDeleteChoice(choiceToDelete.choice_id)
                  setToastVisible(false)
                }}
              >
                Yes, Delete
              </CButton>
              <CButton
                style={{ backgroundColor: '#E0E0E0', color: 'black' }}
                size="sm"
                className="ms-2"
                onClick={() => setToastVisible(false)}
              >
                Cancel
              </CButton>
            </div>
          </CToastBody>
        </CToast>
      </CToaster>
      <CToaster placement="top-end">
        <CToast
          visible={showChoiceInputToast}
          autohide
          delay={3000} // Toast akan menghilang setelah 3 detik
          onClose={() => setShowChoiceInputToast(false)}
        >
          <CToastHeader closeButton>
            <strong className="me-auto">Input Warning</strong>
          </CToastHeader>
          <CToastBody>
            Kolom input pilihan tidak boleh kosong. Silakan isi kolom untuk menambahkan pilihan.
          </CToastBody>
        </CToast>
      </CToaster>
      <CAlert
        color="success"
        className="position-fixed"
        style={{
          top: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1050,
        }}
        dismissible
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      >
        Choices berhasil ditambahkan
      </CAlert>
      <CAlert
        color="danger"
        className="position-fixed"
        style={{
          top: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1050,
        }}
        dismissible
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
      >
        Choice berhasil dihapus
      </CAlert>
      <CAlert
        color="success"
        className="position-fixed"
        style={{
          top: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1050,
        }}
        dismissible
        visible={showSaveAlert}
        onClose={() => setShowSaveAlert(false)}
      >
        Data berhasil disimpan
      </CAlert>
      <CAlert
        color="danger"
        className="position-fixed"
        style={{
          top: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1050,
        }}
        dismissible
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
      >
        Data berhasil dihapus
      </CAlert>
      <CAlert
        color="success"
        className="position-fixed"
        style={{
          top: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1050,
        }}
        dismissible
        visible={showAddAlert}
        onClose={() => setShowAddAlert(false)}
      >
        Pertanyaan berhasil ditambahkan
      </CAlert>
      {testAlert.visible && (
        <CAlert
          color={testAlert.color}
          dismissible
          onClose={() => setTestAlert((prev) => ({ ...prev, visible: false }))}
        >
          {testAlert.message}
        </CAlert>
      )}

      <div>
        {/* Tampilan untuk Admin */}
        {(userRole === 'admin' || userRole === 'lecturer') && (
          <div className="mb-3">
            {/* Question Mode Selection */}
            <div className="d-flex mb-3">
              <CFormCheck
                inline
                type="radio"
                name="questionMode"
                value="single"
                label="Single"
                checked={questionMode === 'single'}
                onChange={handleQuestionModeChange}
              />
              <CFormCheck
                inline
                type="radio"
                name="questionMode"
                value="multiple"
                label="Multiple"
                checked={questionMode === 'multiple'}
                onChange={handleQuestionModeChange}
              />
            </div>

            {/* Input for Single or Multiple Mode */}
            {questionMode === 'single' ? (
              <CFormInput
                placeholder="Masukkan Pertanyaan"
                value={inputFields[0]}
                onChange={(e) => handleInputChange(0, e.target.value)}
              />
            ) : (
              <>
                <div className="d-flex align-items-center mb-2">
                  <label htmlFor="numFields" className="me-2">
                    Jumlah Pertanyaan:
                  </label>
                  <select
                    id="numFields"
                    value={numFields}
                    onChange={handleNumFieldsChange}
                    className="form-select"
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                {inputFields.map((input, index) => (
                  <CFormInput
                    key={index}
                    placeholder={`Masukkan Pertanyaan ${index + 1}`}
                    value={input}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="mb-2"
                  />
                ))}
              </>
            )}
            <CButton
              style={{ backgroundColor: '#A5D6A7', color: 'black' }}
              className="mt-2"
              onClick={handleDirectAddQuestion}
            >
              Tambah Pertanyaan
            </CButton>
            {/* Modal untuk peringatan input kosong */}
            <CModal
              visible={showEmptyInputWarningModal}
              onClose={() => setShowEmptyInputWarningModal(false)}
            >
              <CModalHeader>
                <CModalTitle>Warning</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Kolom input pertanyaan tidak boleh kosong. Silakan isi kolom untuk menambahkan
                pertanyaan.
              </CModalBody>
              <CModalFooter>
                <CButton color="primary" onClick={() => setShowEmptyInputWarningModal(false)}>
                  OK
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Edit Question Modal */}
            <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Edit</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <h5>Edit Pertanyaan</h5>
                <CFormInput
                  value={editedQuestionText}
                  onChange={(e) => setEditedQuestionText(e.target.value)}
                />

                <div className="mt-3">
                  <CAccordion flush>
                    <CAccordionItem itemKey={1}>
                      <CAccordionHeader>Tambah Pilihan Ganda</CAccordionHeader>
                      <CAccordionBody>
                        <CContainer>
                          {/* Choice Mode Selection */}
                          <div className="d-flex mb-2">
                            <CFormCheck
                              inline
                              type="radio"
                              name="choiceMode"
                              value="single"
                              label="Single"
                              checked={choiceMode === 'single'}
                              onChange={handleChoiceModeChange}
                            />
                            <CFormCheck
                              inline
                              type="radio"
                              name="choiceMode"
                              value="multiple"
                              label="Multiple"
                              checked={choiceMode === 'multiple'}
                              onChange={handleChoiceModeChange}
                            />
                          </div>

                          {choiceMode === 'single' ? (
                            <div className="d-flex mb-2 align-items-center">
                              <CFormInput
                                placeholder="Masukkan Jawaban"
                                value={choiceInputFields[0].text}
                                onChange={(e) => handleChoiceInputChange(0, e.target.value)}
                                className="me-2"
                              />
                              <select
                                className="form-select me-2"
                                value={choiceInputFields[0].is_correct}
                                onChange={(e) => handleChoiceIsCorrectChange(0, e.target.value)}
                                style={{ width: '100px' }}
                              >
                                <option value={1}>Benar</option>
                                <option value={0}>Salah</option>
                              </select>
                            </div>
                          ) : (
                            <>
                              <div className="d-flex align-items-center mb-2">
                                <label htmlFor="numChoiceFields" className="me-2">
                                  Jumlah Pilihan:
                                </label>
                                <select
                                  id="numChoiceFields"
                                  value={numChoiceFields}
                                  onChange={handleNumChoiceFieldsChange}
                                  className="form-select"
                                >
                                  {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {choiceInputFields.map((choice, index) => (
                                <div key={index} className="d-flex mb-2 align-items-center">
                                  <CFormInput
                                    placeholder={`Masukkan Jawaban ${index + 1}`}
                                    value={choice.text}
                                    onChange={(e) => handleChoiceInputChange(index, e.target.value)}
                                    className="me-2"
                                  />
                                  <select
                                    className="form-select me-2"
                                    value={choice.is_correct}
                                    onChange={(e) =>
                                      handleChoiceIsCorrectChange(index, e.target.value)
                                    }
                                    style={{ width: '100px' }}
                                  >
                                    <option value={1}>Benar</option>
                                    <option value={0}>Salah</option>
                                  </select>
                                </div>
                              ))}
                            </>
                          )}
                          <CButton
                            style={{ backgroundColor: '#A5D6A7', color: 'black' }}
                            className=""
                            onClick={handleDirectAddChoice}
                          >
                            Tambah
                          </CButton>
                          {/* Modal untuk peringatan pilihan kosong */}
                          <CModal
                            visible={showEmptyChoiceWarningModal}
                            onClose={() => setShowEmptyChoiceWarningModal(false)}
                          >
                            <CModalHeader>
                              <CModalTitle>Warning</CModalTitle>
                            </CModalHeader>
                            <CModalBody>
                              Kolom input pilihan tidak boleh kosong. Silakan isi kolom untuk
                              menambahkan pilihan.
                            </CModalBody>
                            <CModalFooter>
                              <CButton
                                color="primary"
                                onClick={() => setShowEmptyChoiceWarningModal(false)}
                              >
                                OK
                              </CButton>
                            </CModalFooter>
                          </CModal>
                        </CContainer>
                      </CAccordionBody>
                    </CAccordionItem>
                  </CAccordion>

                  <div className="mt-3">
                    <h5>Edit Pertanyaan</h5>

                    <CContainer style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {/* Render choices yang sedang diedit */}
                      {editedChoices.map((choice, index) => (
                        <div key={choice.choice_id} className="mb-2 d-flex align-items-center">
                          <CFormInput
                            value={choice.choice_text}
                            onChange={(e) => handleChoiceChange(index, e.target.value)}
                            className="me-2"
                          />
                          {/* Dropdown for setting correct/incorrect status */}
                          <select
                            className="form-select me-2"
                            value={choice.is_correct ? 1 : 0}
                            onChange={(e) => handleIsCorrectChange(index, e.target.value)}
                            style={{ width: '100px' }}
                          >
                            <option value={1}>Benar</option>
                            <option value={0}>Salah</option>
                          </select>
                          <CButton
                            style={{ backgroundColor: '#EF9A9A', color: 'black' }}
                            onClick={() => openDeleteChoiceToast(choice)}
                          >
                            Delete
                          </CButton>
                        </div>
                      ))}

                      {/* Delete Confirmation Modal for Choice */}
                      <CModal
                        visible={deleteChoiceModalVisible}
                        onClose={() => setDeleteChoiceModalVisible(false)}
                      >
                        <CModalHeader>
                          <CModalTitle>Delete Choice Confirmation</CModalTitle>
                        </CModalHeader>
                        <CModalBody>Are you sure you want to delete this choice?</CModalBody>
                        <CModalFooter className="">
                          <CButton
                            style={{ backgroundColor: '#EF9A9A', color: 'black' }}
                            onClick={() => handleDeleteChoice(choiceToDelete.choice_id)}
                          >
                            Delete
                          </CButton>
                          <CButton
                            style={{ backgroundColor: '#E0E0E0', color: 'black' }}
                            onClick={() => setDeleteChoiceModalVisible(false)}
                          >
                            Cancel
                          </CButton>
                        </CModalFooter>
                      </CModal>
                    </CContainer>
                  </div>
                </div>
              </CModalBody>
              <CModalFooter>
                <CButton
                  style={{ backgroundColor: '#A5D6A7', color: 'black' }}
                  onClick={handleSaveEdit}
                >
                  Save
                </CButton>
                <CButton
                  style={{ backgroundColor: '#BDBDBD', color: 'black' }}
                  onClick={() => setEditModalVisible(false)}
                >
                  Cancel
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Delete Confirmation Modal */}
            <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Delete Confirmation</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete this question?</CModalBody>
              <CModalFooter>
                <CButton
                  style={{ backgroundColor: '#EF9A9A', color: 'black' }}
                  onClick={handleDeleteQuestion}
                >
                  Delete
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E0E0E0', color: 'black' }}
                  onClick={() => setDeleteModalVisible(false)}
                >
                  Cancel
                </CButton>
              </CModalFooter>
            </CModal>

            {/* <CCollapse visible={isVisible || userRole !== 'student'}> */}
            <CCard className="my-3">
              <CTable className="mt-2">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Pertanyaan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Pilihan Jawaban</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading && <p>Loading questions...</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {questions.length > 0
                    ? questions.map((question, index) => (
                        <CTableRow key={`${question.question_id}-${index}`}>
                          <CTableDataCell>{question.question_text}</CTableDataCell>
                          <CTableDataCell>
                            {(choices[question.question_id] ?? []).map((choice) => (
                              <CCol key={`choice-${question.question_id}-${choice.choice_id}`}>
                                {choice.choice_text}
                              </CCol>
                            ))}
                          </CTableDataCell>
                          <CTableDataCell>
                            {/* {userRole === 'admin' && ( */}
                            <div className="mx-2">
                              <CButton
                                className="me-2 mt-2"
                                style={{ backgroundColor: '#FFD54F', color: 'black' }}
                                onClick={() => openEditModal(question)}
                              >
                                Edit
                              </CButton>
                              <CButton
                                className="me-2 mt-2"
                                style={{ backgroundColor: '#EF9A9A', color: 'black' }}
                                onClick={() => openDeleteModal(question)}
                              >
                                Delete
                              </CButton>
                            </div>

                            {/* )} */}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    : !loading && !error && <p>No test data available for this module.</p>}
                </CTableBody>
              </CTable>
            </CCard>
            {/* </CCollapse> */}
          </div>
        )}

        {/* Tampilan untuk Student */}
        {userRole === 'student' && (
          <div className="mb-3">
            <h2>Hi, {username}</h2>
            <p>Selamat datang di bagian Quiz!</p>
            <p>
              Quiz ini bertujuan untuk mengevaluasi pemahaman Anda terhadap materi yang telah
              dipelajari. Anda harus menjawab <strong>SEMUA soal dengan benar (nilai 100)</strong>{' '}
              untuk dapat melanjutkan ke materi berikutnya.
            </p>
            <p>
              <strong>Penting untuk diperhatikan:</strong>
              <ul>
                <li>
                  Setiap percobaan akan mempengaruhi nilai maksimal Anda:
                  <ul>
                    <li>Percobaan pertama: nilai maksimal 100</li>
                    <li>Percobaan kedua: nilai maksimal 80</li>
                    <li>Percobaan ketiga dan seterusnya: nilai maksimal 60</li>
                  </ul>
                </li>
                <li className="text-danger">
                  JANGAN melakukan refresh halaman atau pindah tab/halaman karena akan mengakibatkan
                  reset percobaan dan mempengaruhi nilai akhir Anda.
                </li>
                {!isMobileDevice() && ( // Tampilkan peringatan hanya untuk desktop
                  <li className="text-danger">
                    <strong>PENTING:</strong> Selama tes berlangsung:
                    <ul>
                      <li>Dilarang menggunakan Developer Tools (F12)</li>
                      <li>Dilarang menggunakan Inspect Element</li>
                      <li>Dilarang menggunakan menu klik kanan</li>
                      <li>
                        Pelanggaran akan menyebabkan:
                        <ul>
                          <li>Tes dihentikan secara otomatis</li>
                          <li>Penalti waktu tunggu 1 jam</li>
                          <li>Kemungkinan pengurangan nilai</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                )}

                {isMobileDevice() && (
                  <li className="text-danger">
                    <strong>PENTING:</strong> Selama tes berlangsung:
                    <ul>
                      <li>Dilarang keluar dari halaman tes</li>
                      <li>Dilarang membuka aplikasi lain</li>
                      <li>Pastikan perangkat dalam mode potrait</li>
                      <li>
                        Pelanggaran akan menyebabkan:
                        <ul>
                          <li>Tes dihentikan secara otomatis</li>
                          <li>Penalti waktu tunggu</li>
                          <li>Kemungkinan pengurangan nilai</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
            </p>
            <p>
              Pastikan Anda telah memahami materi dengan baik dan kerjakan dengan penuh konsentrasi.
              Nilai yang Anda peroleh akan mencerminkan tingkat penguasaan Anda terhadap topik yang
              diujikan.
            </p>
            <p>
              Ingatlah untuk selalu menjaga integritas akademik dengan mengerjakan secara mandiri
              dan jujur.
            </p>
            <p>Selamat mengerjakan!</p>

            {/* Test Result */}
            <CRow className="mb-4">
              <CCol>
                {testResults.length > 0 ? (
                  <>
                    <h2>Hasil Tes Anda</h2>
                    <CSmartTable
                      columns={[
                        // { key: 'test_id', label: 'Test ID', _style: { width: '20%' } },
                        { key: 'score', label: 'Nilai', _style: { width: '50%' } },
                        { key: 'completed_at', label: 'Selesai Pada', _style: { width: '50%' } },
                      ]}
                      items={testResults}
                      itemsPerPage={5}
                      pagination
                      tableProps={{
                        responsive: true,
                        striped: true,
                        hover: true,
                      }}
                    />
                  </>
                ) : (
                  <p>No test results available for this test.</p>
                )}
              </CCol>
            </CRow>

            {/* Tampilkan riwayat percobaan */}
            {attempts.length > 0 && (
              <CCard className="my-3">
                <div className="card-header">
                  <h3>Riwayat Percobaan</h3>
                </div>
                <CCardBody>
                  <div className="list-group">
                    {attempts.map((score, index) => (
                      <div
                        key={index}
                        className={`list-group-item ${score === 100 ? 'list-group-item-success' : 'list-group-item-warning'}`}
                      >
                        Percobaan {index + 1}: {score}%
                      </div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            )}
            {/* Tampilkan Soal */}
            <CCollapse visible={isVisible || userRole !== 'student'}>
              <CCard className="my-3">
                <CCardBody>
                  {loading && <p>Memuat pertanyaan...</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {questions.length > 0
                    ? questions.map((question, index) => (
                        <CContainer className="pb-4" key={`${question.question_id}-${index}`}>
                          <h4>{question.question_text}</h4>
                          <CRow xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 4 }}>
                            {choices[question.question_id]?.map((choice) => (
                              <CCol key={`option-${question.question_id}-${choice.choice_id}`}>
                                <CFormCheck
                                  button={{
                                    color:
                                      currentAttemptNumber >= 3 && choice.is_correct === true
                                        ? 'info'
                                        : 'success',
                                    variant: 'outline',
                                  }}
                                  type="radio"
                                  name={`options-${question.question_id}`}
                                  id={`option-${question.question_id}-${choice.choice_id}`}
                                  autoComplete="off"
                                  label={choice.choice_text}
                                  checked={
                                    selectedOptions[question.question_id]?.choice_id ===
                                    choice.choice_id
                                  }
                                  onChange={() =>
                                    handleOptionChange(
                                      question.question_id,
                                      choice.choice_id,
                                      choice.is_correct,
                                    )
                                  }
                                />
                              </CCol>
                            ))}
                          </CRow>
                        </CContainer>
                      ))
                    : !loading &&
                      !error && <p>Tidak ada data Tes yang tersedia untuk modul ini.</p>}
                </CCardBody>
              </CCard>
            </CCollapse>

            {/* Modifikasi tombol Start Test */}
            {userRole === 'student' && !isVisible && (
              <div>
                <CLoadingButton
                  color="primary"
                  onClick={handleStartTest}
                  timeout={1000}
                  disabled={
                    loading ||
                    isButtonDisabled ||
                    // Tambahkan kondisi: disable jika sudah ada hasil akhir (nilai 100)
                    testResults.some((result) => result.is_final)
                  }
                >
                  {loading
                    ? 'Memuat...'
                    : testResults.some((result) => result.is_final)
                      ? 'Tes Telah Selesai'
                      : testResults.length > 0
                        ? 'Coba Lagi'
                        : 'Mulai Tes'}
                </CLoadingButton>
                {testResults.length > 0 && !testResults.some((result) => result.is_final) ? (
                  <div className="text-muted mt-2">
                    <small>
                      Anda belum mendapat nilai 100. Silakan coba lagi untuk melanjutkan ke materi
                      berikutnya.
                    </small>
                  </div>
                ) : testResults.some((result) => result.is_final) ? (
                  <div className="text-success mt-2">
                    <small>
                      Anda telah menyelesaikan tes ini dengan hasil memuaskan! Silakan lanjut ke
                      materi berikutnya.
                    </small>
                  </div>
                ) : null}
              </div>
            )}

            {userRole === 'student' && isVisible ? (
              <CLoadingButton
                color="primary"
                onClick={handleFinishTest}
                timeout={1000}
                disabled={!allQuestionsAnswered}
              >
                Selesaikan Tes
              </CLoadingButton>
            ) : null}

            {isButtonDisabled && countdown > 0 && (
              <p>Mohon tunggu {countdown} detik sebelum Anda dapat memulai ulang tes.</p>
            )}

            {showRefreshInstruction && <p>Untuk mengulang tes, silakan refresh halaman.</p>}
          </div>
        )}
      </div>
    </>
  )
}

export default MiniTest
