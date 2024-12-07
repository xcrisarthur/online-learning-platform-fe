/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
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
} from '@coreui/react-pro'
import {
  getModulesByCourse,
  updateModule,
  deleteModule,
  createModule,
  getModuleById,
} from '../../services/api'

const ModuleManagement = () => {
  const [modules, setModules] = useState([])
  const [displayedModules, setDisplayedModules] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [addModuleModalVisible, setAddModuleModalVisible] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [editedModuleTitle, setEditedModuleTitle] = useState('')
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  // State for Tambah Modul Modal
  // const [addModuleModalVisible, setAddModuleModalVisible] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleType, setModuleType] = useState('materials')

  const [moduleToDelete, setModuleToDelete] = useState(null)
  const [similarModules, setSimilarModules] = useState([])
  const [deleteSuccessAlert, setDeleteSuccessAlert] = useState(false) // New state
  const [editModuleModalVisible, setEditModuleModalVisible] = useState(false)
  const [showUpdateSuccessAlert, setShowUpdateSuccessAlert] = useState(false)

  // Confirm and proceed with deletion
  const confirmDeleteModule = async () => {
    try {
      if (moduleToDelete) {
        await Promise.all([
          deleteModule(moduleToDelete.module_id),
          ...similarModules.map((mod) => deleteModule(mod.module_id)),
        ])

        console.log('Modules deleted successfully.')
        // fetchCourses() // Refresh after deletion
        setDeleteSuccessAlert(true)
        fetchModules()

        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      setAlertMessage('Failed to delete module. Please try again.')
      setAlertVisible(true)
    } finally {
      setDeleteModalVisible(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const data = await getModulesByCourse(1)
      setModules(data)
      filterModules(data)
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const filterModules = (modules) => {
    // Mengelompokkan modul berdasarkan topik dari module_title
    const groupedModules = modules.reduce((acc, module) => {
      const topic = module.module_title.replace(/(Pre-Test |Post-Test |Quiz )/, '').trim()
      if (!acc[topic]) acc[topic] = []
      acc[topic].push(module)
      return acc
    }, {})

    const completeModules = [] // Menyimpan modul yang lengkap
    const incompleteModules = [] // Menyimpan modul yang tidak lengkap

    Object.entries(groupedModules).forEach(([topic, group]) => {
      // Mengecek apakah memiliki semua jenis module_type yang diperlukan
      const hasAllTypes = ['pretest', 'materials', 'minitest', 'posttest'].every((type) =>
        group.some((module) => module.module_type === type),
      )

      // Mengecek apakah memiliki order_index yang benar dari 1 hingga 4
      const hasCorrectOrder = [1, 2, 3, 4].every((index) =>
        group.some((module) => module.order_index === index),
      )

      if (hasAllTypes && hasCorrectOrder) {
        // Jika semua kondisi terpenuhi, ambil modul dengan module_type "materials" untuk ditampilkan
        const materialModule = group.find((module) => module.module_type === 'materials')
        if (materialModule) completeModules.push(materialModule)
      } else {
        // Jika tidak lengkap, tentukan kekurangan dan tambahkan ke daftar incompleteModules
        const missingTypes = ['pretest', 'materials', 'minitest', 'posttest'].filter(
          (type) => !group.some((module) => module.module_type === type),
        )

        const missingOrder = [1, 2, 3, 4].filter(
          (index) => !group.some((module) => module.order_index === index),
        )

        incompleteModules.push({
          topic,
          group,
          missingTypes: missingTypes.length > 0 ? missingTypes : null,
          missingOrder: missingOrder.length > 0 ? missingOrder : null,
        })
      }
    })

    // Mengatur modul lengkap untuk ditampilkan
    setDisplayedModules(completeModules)
  }

  // Handle edit modal
  const openEditModal = (module) => {
    setSelectedModule(module)
    setEditedModuleTitle(module.module_title)
    setEditModalVisible(true)
    setEditModuleModalVisible(true)
  }

  const handleEditModule = async () => {
    try {
      await updateModule(selectedModule.module_id, { module_title: editedModuleTitle })
      setAlertMessage('Module updated successfully.')
      setAlertVisible(true)
      setEditModalVisible(false)
      setEditModuleModalVisible(false)
      fetchModules() // Refresh modules
    } catch (error) {
      console.error('Error updating module:', error)
      setAlertMessage('Failed to update module.')
      setAlertVisible(true)
    }
  }

  const handleEditAllRelatedModules = async () => {
    try {
      if (!selectedModule || !editedModuleTitle) return

      // Periksa apakah modul yang dipilih adalah Post-Test dengan order_index 4
      if (selectedModule.module_type !== 'materials' || selectedModule.order_index !== 2) {
        alert('This function is only applicable for editing materials modules.')
        return
      }

      // Ambil base name tanpa prefix dari nama modul yang diedit
      const oldBaseName = selectedModule.module_title
        .replace(/^(Pre Test|Pre-Test|Quiz|Post Test|Post-Test)/i, '')
        .trim()

      const newBaseName = editedModuleTitle
        .replace(/^(Pre Test|Pre-Test|Quiz|Post Test|Post-Test)/i, '')
        .trim()

      // Fetch semua modul dari API berdasarkan course_id
      const modules = await getModulesByCourse(selectedModule.course_id)

      // Filter modul dengan order_index 1 sampai 3 yang memiliki base name yang sama
      const relatedModules = modules.filter(
        (mod) =>
          mod.order_index >= 1 &&
          mod.order_index <= 4 &&
          mod.module_title
            .replace(/^(Pre Test|Pre-Test|Quiz|Post Test|Post-Test)/i, '')
            .trim()
            .toLowerCase() === oldBaseName.toLowerCase(),
      )

      // Perbarui nama modul berdasarkan tipe modul
      const updatedModules = relatedModules.map((mod) => {
        let newTitle = ''
        switch (mod.module_type) {
          case 'pretest':
            newTitle = `Pre-Test ${newBaseName}`
            break
          case 'materials':
            newTitle = `${newBaseName}`
            break
          case 'minitest':
            newTitle = `Quiz ${newBaseName}`
            break
          case 'posttest':
            newTitle = `Post-Test ${newBaseName}`
            break
          default:
            newTitle = mod.module_title
        }
        return { ...mod, module_title: newTitle }
      })

      // Tambahkan Post-Test yang diedit ke dalam daftar modul yang akan diperbarui
      updatedModules.push({ ...selectedModule, module_title: editedModuleTitle })

      // console.log('Updated Modules:', updatedModules)

      // Kirim perubahan ke backend
      await Promise.all(
        updatedModules.map((mod) =>
          updateModule(mod.module_id, { module_title: mod.module_title }),
        ),
      )

      // Update displayedModules to show updated titles without re-fetching from the server
      setDisplayedModules((prevDisplayedModules) =>
        prevDisplayedModules.map(
          (mod) =>
            updatedModules.find((updatedMod) => updatedMod.module_id === mod.module_id) || mod,
        ),
      )

      // Update the `modules` state to keep it consistent with `displayedModules`
      setModules((prevModules) =>
        prevModules.map(
          (mod) =>
            updatedModules.find((updatedMod) => updatedMod.module_id === mod.module_id) || mod,
        ),
      )

      setEditModuleModalVisible(false)
      // fetchCourses() // Refresh daftar modul

      setShowUpdateSuccessAlert(true)
      setTimeout(() => setShowUpdateSuccessAlert(false), 500) // Hide after 1 seconds

      setTimeout(() => {
        window.location.reload()
      }, 600)
    } catch (error) {
      console.error('Error updating related modules:', error)
      alert('Failed to update related modules. Please try again.')
    }
  }

  const handlePreviewDeleteModule = async (moduleId) => {
    try {
      const module = await getModuleById(moduleId)
      if (module) {
        setModuleToDelete(module)

        // Fetch and set similar modules based on the base title
        const baseTitle = module.module_title
          .replace(/^(Pre Test|Pre-Test|Quiz|Post Test|Post-Test)/i, '')
          .trim()
          .toLowerCase()

        const allModules = await getModulesByCourse(module.course_id)
        const relatedModules = allModules.filter(
          (mod) =>
            mod.order_index >= 1 &&
            mod.order_index <= 4 &&
            mod.module_title
              .replace(/^(Pre Test|Pre-Test|Quiz|Post Test|Post-Test)/i, '')
              .trim()
              .toLowerCase() === baseTitle,
        )
        setSimilarModules(relatedModules)
        // console.log(relatedModules)
        // Show delete confirmation modal
        setDeleteModalVisible(true)
      } else {
        console.warn('Module not found for deletion preview.')
      }
    } catch (error) {
      console.error('Error previewing module for deletion:', error)
    }
  }

  const handleAddModule = async () => {
    if (!moduleTitle.trim()) {
      setAlertMessage('Module title is required.')
      setAlertVisible(true)
      return
    }

    try {
      const newModules = [
        {
          course_id: 1,
          module_title: `Pre-Test ${moduleTitle}`,
          module_type: 'pretest',
          order_index: 1,
        },
        {
          course_id: 1,
          module_title: moduleTitle,
          module_type: 'materials',
          order_index: 2,
        },
        {
          course_id: 1,
          module_title: `Quiz ${moduleTitle}`,
          module_type: 'minitest',
          order_index: 3,
        },
        {
          course_id: 1,
          module_title: `Post-Test ${moduleTitle}`,
          module_type: 'posttest',
          order_index: 4,
        },
      ]

      await createModule(newModules)

      setAlertMessage('Module added successfully.')
      setAlertVisible(true)
      setAddModuleModalVisible(false)
      fetchModules()

      setTimeout(() => {
        window.location.reload() // This will refresh the page
      }, 500)

      setModuleTitle('')
    } catch (error) {
      console.error('Error adding module:', error)
      setAlertMessage('Failed to add module. Please try again.')
      setAlertVisible(true)
    }
  }

  const columns = [
    { key: 'module_title', label: 'Nama Modul', _style: { width: '70%' } },
    {
      key: 'action',
      label: 'Actions',
      _style: { width: '30%' },
      filter: false,
      sorter: false,
    },
  ]

  return (
    <>
      {/* Success alert for updating modules */}
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
        visible={showUpdateSuccessAlert}
        onClose={() => setShowUpdateSuccessAlert(false)}
      >
        All related modules updated successfully.
      </CAlert>

      <CAlert
        color="success"
        dismissible
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
      >
        {alertMessage}
      </CAlert>

      <CAlert
        color="success"
        dismissible
        visible={deleteSuccessAlert}
        onClose={() => setDeleteSuccessAlert(false)}
      >
        Modules and related similar modules deleted successfully.
      </CAlert>

      <CContainer className="px-4">
        <h2>Tambah Modul</h2>

        <CContainer>
          <CFormInput value="1" type="hidden" disabled />
          <CFormSelect
            value={moduleType}
            onChange={(e) => setModuleType(e.target.value)}
            options={[{ label: 'Materials', value: 'materials' }]}
            hidden
            disabled
          />
          <CFormInput value="2" type="hidden" disabled />
          <CFormInput
            label="Nama Modul"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Masukkan Nama Modul"
          />
        </CContainer>

        <CButton
          style={{ backgroundColor: '#A5D6A7', color: 'black' }}
          className="m-3 sidebar-brand-full border-top"
          onClick={handleAddModule}
        >
          Tambah Modul
        </CButton>

        <h2>Daftar Modul</h2>
        <CSmartTable
          columns={columns}
          items={displayedModules}
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
                {/* <CButton
                  color="info"
                  size="sm"
                  className="me-1"
                  onClick={() => (window.location.href = `/modules/${item.module_id}`)}
                >
                  Show Details
                </CButton> */}
                <CButton
                  color="warning"
                  size="sm"
                  className="me-1"
                  onClick={() => openEditModal(item)}
                >
                  Edit
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => handlePreviewDeleteModule(item.module_id)}
                >
                  Delete
                </CButton>
              </td>
            ),
          }}
        />
      </CContainer>

      {/* Edit Modal */}
      <CModal visible={editModuleModalVisible} onClose={() => setEditModuleModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Modul</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <label htmlFor="moduleTitle">Nama Modul</label>
          <input
            type="text"
            id="moduleTitle"
            className="form-control"
            value={editedModuleTitle}
            onChange={(e) => setEditedModuleTitle(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleEditAllRelatedModules}>
            Simpan Perubahan
          </CButton>
          <CButton color="secondary" onClick={() => setEditModuleModalVisible(false)}>
            Batal
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Are you sure you want to delete this module?</p>
          {/* <pre>{JSON.stringify(similarModules, null, 2)}</pre> */}
          {/* <p>Do you want to proceed?</p> */}
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={confirmDeleteModule}>
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

export default ModuleManagement
