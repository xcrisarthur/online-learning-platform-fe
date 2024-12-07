import React from 'react'
import { CFooter } from '@coreui/react-pro'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://" target="_blank" rel="noopener noreferrer">
          Universitas Kristen Maranatha
        </a>
        <span className="ms-1">&copy; 2024.</span>
      </div>
      {/* <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a
          href="https://coreui.io/product/react-dashboard-template/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CoreUI React Admin &amp; Dashboard Template
        </a>
      </div> */}
    </CFooter>
  )
}

export default React.memo(AppFooter)
