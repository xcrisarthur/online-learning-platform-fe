/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarToggler,
  CNavGroup,
  CNavItem,
  CNavTitle,
  CHeaderBrand,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons'
import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import {
  getEnrolledCourses,
  getModulesByCourse,
  getAllTests,
  getTestResults,
} from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  fa1,
  fa2,
  fa3,
  fa4,
  fa5,
  fa6,
  fa7,
  fa8,
  fa9,
  faBook,
  faUser,
  faUsers,
  faWaveSquare,
  faCheckDouble,
  faRankingStar,
} from '@fortawesome/free-solid-svg-icons'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // State to hold navigation items and user role
  const [navItems, setNavItems] = useState([...navigation])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Ambil user ID dan role dari localStorage
      const currentUserId = parseInt(localStorage.getItem('userId'))
      const userRole = localStorage.getItem('role')

      // Fetch semua data yang diperlukan
      const [courses, allTestResults, allTests] = await Promise.all([
        getEnrolledCourses(),
        getTestResults(),
        getAllTests(),
      ])

      // Filter test results untuk user yang sedang login
      const userTestResults = allTestResults.filter((result) => result.student_id === currentUserId)
      const testModuleMap = new Map(allTests.map((test) => [test.test_id, test]))

      const leaderboardNavItems = [
        {
          component: CNavItem,
          name: 'Leaderboard',
          to: '/leaderboard',
          icon: <FontAwesomeIcon icon={faRankingStar} className="nav-icon" />,
        },
      ]

      const courseNavTitle = courses.map((course) => ({
        component: CNavTitle,
        name: course.title,
      }))

      // Only show data management for admin and lecturer roles
      const dataManagementItems = ['admin', 'lecturer'].includes(userRole)
        ? [
            {
              component: CNavTitle,
              name: 'Data Management',
            },
            {
              component: CNavItem,
              name: 'Module',
              to: '/course_management',
              icon: <FontAwesomeIcon icon={faBook} className="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Users',
              to: '/user_management',
              icon: <FontAwesomeIcon icon={faUsers} className="nav-icon" />,
            },
            // {
            //   component: CNavItem,
            //   name: 'Grades',
            //   to: '/grades',
            //   icon: <FontAwesomeIcon icon={faWaveSquare} className="nav-icon" />,
            // },
          ]
        : []

      const profileNavTitle = {
        component: CNavTitle,
        name: 'Profile',
      }

      const profileNavItems = [
        {
          component: CNavItem,
          name: 'Profile',
          to: '/profile',
          icon: <FontAwesomeIcon icon={faUser} className="nav-icon" />,
        },
      ]

      const modulesPromises = courses.map((course) => getModulesByCourse(course.course_id))
      const allModules = await Promise.all(modulesPromises)

      const tests = await getAllTests()
      const testsMap = new Map(tests.map((test) => [test.module_id, test.test_id]))
      const icons = [fa1, fa2, fa3, fa4, fa5, fa6, fa7, fa8, fa9]

      const modulesNavItems = courses.flatMap((course, index) =>
        Array.isArray(allModules[index])
          ? allModules[index]
              .filter((module) => module.module_type === 'materials')
              .map((module, moduleIndex) => ({
                component: CNavGroup,
                name: module.module_title,
                icon: (
                  <FontAwesomeIcon icon={icons[moduleIndex % icons.length]} className="nav-icon" />
                ),
                to: `/course/${course.course_id}/module/${module.module_id}`,
                items: Array.isArray(allModules[index])
                  ? allModules[index]
                      .filter((subModule) =>
                        subModule.module_title
                          .toLowerCase()
                          .includes(module.module_title.toLowerCase()),
                      )
                      .flatMap((subModule) => {
                        let modulePath = ''
                        const testId = testsMap.get(subModule.module_id)

                        switch (subModule.module_type) {
                          case 'pretest':
                            modulePath = `/course/${course.course_id}/module/${subModule.module_id}/pretest/${testId}`
                            break
                          case 'materials':
                            modulePath = `/course/${course.course_id}/module/${subModule.module_id}/materials`
                            break
                          case 'minitest':
                            modulePath = `/course/${course.course_id}/module/${subModule.module_id}/minitest/${testId}`
                            break
                          case 'posttest':
                            modulePath = `/course/${course.course_id}/module/${subModule.module_id}/posttest/${testId}`
                            break
                          default:
                            modulePath = `/course/${course.course_id}/module/${subModule.module_id}`
                        }

                        // Logic untuk menentukan disable status
                        let isDisabled = false // Default false untuk admin/lecturer

                        // Hanya terapkan logika disable untuk role student
                        if (userRole === 'student') {
                          isDisabled = true // Default true untuk student

                          if (userTestResults.length === 0) {
                            // Jika tidak ada test results, hanya module 1 yang enabled
                            isDisabled = subModule.module_id !== 1
                          } else {
                            // Cek setiap test result
                            userTestResults.forEach((result) => {
                              const testInfo = testModuleMap.get(result.test_id)
                              if (testInfo) {
                                const baseModuleId = testInfo.module_id
                                const testType = testInfo.test_type

                                // Enable module yang sudah ditest
                                if (subModule.module_id === baseModuleId) {
                                  isDisabled = false
                                }

                                // Logic berdasarkan test_type
                                if (testType === 'pretest') {
                                  if (
                                    subModule.module_id === baseModuleId + 1 ||
                                    subModule.module_id === baseModuleId + 2
                                  ) {
                                    if (
                                      subModule.module_type === 'materials' ||
                                      subModule.module_type === 'minitest'
                                    ) {
                                      isDisabled = false
                                    }
                                  }
                                } else if (testType === 'minitest') {
                                  if (subModule.module_id === baseModuleId + 1) {
                                    if (subModule.module_type === 'posttest') {
                                      isDisabled = false
                                    }
                                  }
                                } else if (testType === 'posttest') {
                                  if (subModule.module_id === baseModuleId + 1) {
                                    if (subModule.module_type === 'pretest') {
                                      isDisabled = false
                                    }
                                  }
                                }
                              }
                            })
                          }
                        }

                        return [
                          {
                            component: CNavItem,
                            name: (() => {
                              switch (subModule.module_type) {
                                case 'pretest':
                                  return 'Pre Test'
                                case 'materials':
                                  return 'Materials'
                                case 'minitest':
                                  return 'Quiz'
                                case 'posttest':
                                  return 'Post Test'
                                default:
                                  return subModule.module_title
                              }
                            })(),
                            to: modulePath,
                            disabled: isDisabled,
                          },
                        ]
                      })
                  : [],
              }))
          : [],
      )

      setNavItems(() => [
        ...navigation,
        ...leaderboardNavItems,
        ...dataManagementItems,
        profileNavTitle,
        ...profileNavItems,
        ...courseNavTitle,
        ...modulesNavItems,
      ])
    } catch (error) {
      console.error('Error fetching courses or modules:', error)
    }
  }

  return (
    <>
      <CSidebar
        className="border-end"
        colorScheme="dark"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch({ type: 'set', sidebarShow: visible })
        }}
      >
        <CSidebarBrand className="border-bottom">
          <CIcon
            customClassName="m-3 sidebar-brand-narrow"
            icon={icon.cilSpreadsheet}
            height={32}
          />
        </CSidebarBrand>
        <CHeaderBrand className="m-3 sidebar-brand-full">Integrity Academia</CHeaderBrand>

        <AppSidebarNav items={navItems} />

        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CSidebarFooter>
      </CSidebar>
    </>
  )
}

export default React.memo(AppSidebar)
