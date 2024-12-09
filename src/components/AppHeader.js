/* eslint-disable prettier/prettier */
import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilMenu,
  cilMoon,
  cilSun,
  cilContrast,
} from '@coreui/icons'

import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-pro-react-admin-template-theme')
  
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // Add shadow effect on scroll
  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader 
      position="sticky" 
      className={`mb-4 p-0 ${colorMode === 'dark' ? 'dark-header' : ''}`}
      ref={headerRef}
    >
      <CContainer 
        className={`border-bottom px-4 ${colorMode === 'dark' ? 'border-dark' : ''}`} 
        fluid
      >
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
          className={colorMode === 'dark' ? 'text-light' : ''}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink 
              to="/dashboard" 
              as={NavLink}
              className={colorMode === 'dark' ? 'text-light' : ''}
            >
              Dashboard
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav className="ms-auto">
          <li className="nav-item py-1">
            <div className={`vr h-100 mx-2 ${colorMode === 'dark' ? 'text-light' : 'text-body'} text-opacity-75`}></div>
          </li>
          
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle 
              caret={false}
              className={colorMode === 'dark' ? 'text-light' : ''}
            >
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu className={colorMode === 'dark' ? 'dropdown-menu-dark' : ''}>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'} 
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center" 
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <li className="nav-item py-1">
            <div className={`vr h-100 mx-2 ${colorMode === 'dark' ? 'text-light' : 'text-body'} text-opacity-75`}></div>
          </li>

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <style>
        {`
          .dark-header {
            background-color: #1a1c1e !important;
            color: #fff;
          }

          .dark-header .border-dark {
            border-color: rgba(255,255,255,0.1) !important;
          }

          .dark-header .dropdown-menu-dark {
            background-color: #2d3436;
            border-color: rgba(255,255,255,0.1);
          }

          .dark-header .dropdown-item {
            color: #fff;
          }

          .dark-header .dropdown-item:hover,
          .dark-header .dropdown-item:focus {
            background-color: rgba(255,255,255,0.1);
          }

          .dark-header .dropdown-item.active {
            background-color: rgba(255,255,255,0.2);
          }

          @media (prefers-color-scheme: dark) {
            .header-auto {
              background-color: #1a1c1e;
              color: #fff;
            }
          }
        `}
      </style>
    </CHeader>
  )
}

export default AppHeader