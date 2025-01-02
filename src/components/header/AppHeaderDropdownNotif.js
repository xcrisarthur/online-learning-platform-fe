import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CBadge, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'
import { getAllAnnouncements } from '../../services/api'

const AppHeaderDropdownNotif = () => {
  const [announcements, setAnnouncements] = useState([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getAllAnnouncements()
        setAnnouncements(data)
      } catch (error) {
        console.error('Error fetching announcements:', error)
      }
    }

    const fetchUserId = () => {
      const storedUserId = localStorage.getItem('userId')
      setUserId(storedUserId)
    }

    fetchAnnouncements()
    fetchUserId()
  }, [])

  const filteredAnnouncements = announcements.filter(
    (announcement) => announcement.user_id === parseInt(userId),
  )

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilBell} size="lg" className="my-1 mx-2" />
        {filteredAnnouncements.length > 0 && (
          <CBadge
            shape="rounded-pill"
            color="danger-gradient"
            className="position-absolute top-0 end-0"
          ></CBadge>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        {filteredAnnouncements.length === 0 ? (
          <CDropdownItem disabled>No announcements</CDropdownItem>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <CDropdownItem key={announcement.announcement_id}>
              {announcement.announcement_text}
            </CDropdownItem>
          ))
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdownNotif
