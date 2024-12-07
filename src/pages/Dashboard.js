/* eslint-disable prettier/prettier */
// src/pages/Dashboard.js
// eslint-disable-next-line prettier/prettier
import React, { useState, useEffect } from 'react';
import { getEnrolledCourses } from '../services/api'; // Panggil API untuk kursus yang sudah terdaftar
// eslint-disable-next-line prettier/prettier
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Mendapatkan kursus yang terdaftar
        const data = await getEnrolledCourses();
        setCourses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();

    // Set role dari localStorage ke state
    const role = localStorage.getItem('role');
    if (role) {
      setUserRole(role);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {/* {(userRole === 'admin' || userRole === 'dosen') && (
        <button onClick={handleCreateCourse}>Buat Kursus Baru</button>
      )}
      <h3>Daftar Kursus yang Terdaftar</h3>
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.course_id}>
              <h4>{course.title}</h4>
              <p>{course.description}</p>
              <button onClick={() => handleCourseClick(course.course_id)}>
                {userRole === 'student' ? 'Ikuti Kursus' : 'Kelola Kursus'}
              </button>
            </li>
          ))
        ) : (
          <li>Tidak ada kursus tersedia</li>
        )}
      </ul>
      <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
};

export default Dashboard;
