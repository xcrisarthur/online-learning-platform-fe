import React from 'react'
import { Translation } from 'react-i18next'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Leaderboard = React.lazy(() => import('./views/leaderboard/Leaderboard'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Grades = React.lazy(() => import('./views/grades/Grades'))

// const courses = React.lazy(() => import('./views/courses/Courses'))
const pretest = React.lazy(() => import('./views/courses/PreTest'))
const modules = React.lazy(() => import('./views/courses/Modules'))
const posttest = React.lazy(() => import('./views/courses/PostTest'))
const minitest = React.lazy(() => import('./views/courses/MiniTest'))
const modulemanagement = React.lazy(() => import('./views/dataManagement/ModuleManagement'))
const usermanagement = React.lazy(() => import('./views/dataManagement/UserManagement'))

const routes = [
  { path: '/', exact: true, name: <Translation>{(t) => t('home')}</Translation> },
  {
    path: '/dashboard',
    name: <Translation>{(t) => t('dashboard')}</Translation>,
    element: Dashboard,
  },
  {
    path: '/leaderboard',
    name: <Translation>{(t) => t('Leaderboard')}</Translation>,
    element: Leaderboard,
  },
  {
    path: '/profile',
    name: <Translation>{(t) => t('profile')}</Translation>,
    element: Profile,
  },
  {
    path: '/grades',
    name: <Translation>{(t) => t('grades')}</Translation>,
    element: Grades,
  },
  {
    path: '/course_management',
    name: <Translation>{(t) => t('Course Management')}</Translation>,
    element: modulemanagement,
  },
  {
    path: '/user_management',
    name: <Translation>{(t) => t('User Management')}</Translation>,
    element: usermanagement,
  },
  {
    path: '/course/:course_id/module/:module_id/pretest/:test_id',
    name: <Translation>{(t) => t('Pre Test')}</Translation>,
    element: pretest,
  },
  {
    path: '/course/:course_id/module/:module_id/materials',
    name: <Translation>{(t) => t('Overview')}</Translation>,
    element: modules,
  },
  {
    path: '/course/:course_id/module/:module_id/minitest/:test_id',
    name: <Translation>{(t) => t('Quiz')}</Translation>,
    element: minitest,
  },
  {
    path: '/course/:course_id/module/:module_id/posttest/:test_id',
    name: <Translation>{(t) => t('Post Test')}</Translation>,
    element: posttest,
  },
]

export default routes
