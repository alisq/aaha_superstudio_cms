import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProjectsHome from './pages/ProjectsHome'
import StudentSubmissionPage from './pages/StudentSubmissionPage'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ProjectsHome />} />
      <Route path="/submit" element={<StudentSubmissionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
