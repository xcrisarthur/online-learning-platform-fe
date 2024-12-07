/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CContainer,
  CButton,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react-pro'
import {
  getModuleContentByModuleId,
  getModuleContentJrByModuleId,
  updateModuleContent,
  updateModuleContentJr,
} from '../../services/api'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../../global.scss'

const Modules = () => {
  const { module_id } = useParams()
  const [regularContent, setRegularContent] = useState({
    text: '',
    url: '',
  })
  const [juniorContent, setJuniorContent] = useState({
    text: '',
    url: '',
  })
  const [userRole, setUserRole] = useState('')
  const [userClass, setUserClass] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('regular')
  const [showAlert, setShowAlert] = useState({ visible: false, message: '', color: 'success' })
  const [editorKey, setEditorKey] = useState(0) // Add this line

  useEffect(() => {
    const roleFromStorage = localStorage.getItem('role')
    const classFromStorage = localStorage.getItem('classLevel')
    setUserRole(roleFromStorage)
    setUserClass(classFromStorage)

    const fetchModuleContents = async () => {
      try {
        // Fetch both regular and junior contents
        const [regularData, juniorData] = await Promise.all([
          getModuleContentByModuleId(module_id),
          getModuleContentJrByModuleId(module_id),
        ])

        // Process regular content
        const regularTextContent = regularData.find((content) => content.content_type === 'text')
        const regularUrlContent = regularData.find((content) => content.content_type === 'video')
        setRegularContent({
          text: regularTextContent?.content_text || '',
          url: regularUrlContent?.content_url || '',
          textId: regularTextContent?.content_id,
          urlId: regularUrlContent?.content_id,
        })

        // Process junior content
        const juniorTextContent = juniorData.find((content) => content.content_type === 'text')
        const juniorUrlContent = juniorData.find((content) => content.content_type === 'video')
        setJuniorContent({
          text: juniorTextContent?.content_text || '',
          url: juniorUrlContent?.content_url || '',
          textId: juniorTextContent?.content_id,
          urlId: juniorUrlContent?.content_id,
        })
      } catch (error) {
        console.error('Error fetching module contents:', error)
        setShowAlert({
          visible: true,
          message: 'Failed to load content. Please try again.',
          color: 'danger',
        })
      }
    }

    fetchModuleContents()
  }, [module_id])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setEditorKey((prev) => prev + 1) // Force re-render of ReactQuill
  }

  const handleContentChange = (value) => {
    if (activeTab === 'regular') {
      setRegularContent((prev) => ({ ...prev, text: value }))
    } else {
      setJuniorContent((prev) => ({ ...prev, text: value }))
    }
  }

  const handleSaveContent = async () => {
    setIsSaving(true)
    try {
      const contentToUpdate = activeTab === 'regular' ? regularContent : juniorContent
      const updateFunction = activeTab === 'regular' ? updateModuleContent : updateModuleContentJr

      if (contentToUpdate.textId) {
        await updateFunction(contentToUpdate.textId, {
          content_text: contentToUpdate.text,
        })

        setShowAlert({
          visible: true,
          message: 'Content saved successfully.',
          color: 'success',
        })
      } else {
        setShowAlert({
          visible: true,
          message: 'No content ID found to update.',
          color: 'warning',
        })
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setShowAlert({
        visible: true,
        message: 'Failed to save content. Please try again.',
        color: 'danger',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Modifikasi di bagian renderContent()
  const renderContent = () => {
    // For students, show content based on their class level
    if (userRole === 'student') {
      const content = userClass === 'junior' ? juniorContent : regularContent
      return (
        <>
          {/* <div className="class-level-info mb-3">
            <h5
              style={{
                padding: '8px 16px',
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              Class Level: {userClass?.charAt(0).toUpperCase() + userClass?.slice(1) || 'Not Set'}
            </h5>
          </div> */}
          <div
            className="content-display"
            dangerouslySetInnerHTML={{
              __html: content.text || 'No content available for this module.',
            }}
          />
        </>
      )
    }

    // Rest of the code remains the same...
    if (userRole === 'admin' || userRole === 'lecturer') {
      return (
        <>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeTab === 'regular'}
                onClick={() => handleTabChange('regular')}
                role="tab"
              >
                Regular Mode
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'junior'}
                onClick={() => handleTabChange('junior')}
                role="tab"
              >
                Junior Mode
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            <CTabPane role="tabpanel" visible={true}>
              <CButton
                style={{ backgroundColor: '#A5D6A7', color: 'black' }}
                onClick={handleSaveContent}
                disabled={isSaving}
                className="my-3"
              >
                {isSaving ? 'Saving...' : 'Simpan'}
              </CButton>

              <ReactQuill
                key={editorKey}
                value={activeTab === 'regular' ? regularContent.text : juniorContent.text}
                onChange={handleContentChange}
                theme="snow"
                modules={{
                  toolbar: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ script: 'sub' }, { script: 'super' }],
                    [{ indent: '-1' }, { indent: '+1' }],
                    [{ direction: 'rtl' }],
                    [{ align: [] }],
                    ['link', 'image', 'video'],
                    ['clean'],
                  ],
                }}
                style={{ height: '500px', marginBottom: '100px' }}
              />
            </CTabPane>
          </CTabContent>
        </>
      )
    }

    return <p>Role tidak dikenal atau tidak diizinkan untuk mengakses konten ini.</p>
  }

  return (
    <>
      {showAlert.visible && (
        <CAlert
          color={showAlert.color}
          className="position-fixed"
          style={{
            top: '20px',
            right: '20px',
            width: '300px',
            zIndex: 1050,
          }}
          dismissible
          visible={showAlert.visible}
          onClose={() => setShowAlert({ ...showAlert, visible: false })}
        >
          {showAlert.message}
        </CAlert>
      )}

      <CContainer className="px-4">
        <style>
          {`
            .ql-editor img {
              max-width: 100%;
              height: auto;
            }
            .content-display img {
              max-width: 100%;
              height: auto;
            }
          `}
        </style>

        {renderContent()}

        {/* Video content section */}
        {(activeTab === 'regular' ? regularContent.url : juniorContent.url) && (
          <div className="video-content mt-4">
            <iframe
              width="560"
              height="315"
              src={activeTab === 'regular' ? regularContent.url : juniorContent.url}
              title="Video Content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </CContainer>
    </>
  )
}

export default Modules
