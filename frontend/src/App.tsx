import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentGateway from './pages/PaymentGateway';
import PaymentResult from './pages/PaymentResult';
import PaymentCallback from './pages/PaymentCallback';
import Dashboard from './pages/Dashboard';
import CourseViewer from './pages/CourseViewer';
import SidebarLayout from './components/SidebarLayout';
import MyCourses from './pages/MyCourses';
import Evaluations from './pages/Evaluations';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ExamRoom from './pages/ExamRoom';
import TeacherSidebarLayout from './components/TeacherSidebarLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCourseAccess from './pages/TeacherCourseAccess';
import TeacherEvaluations from './pages/TeacherEvaluations';
import TeacherAlerts from './pages/TeacherAlerts';
import AdminSidebarLayout from './components/AdminSidebarLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminSettings from './pages/AdminSettings';
import AdminGrades from './pages/AdminGrades';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminFormateurs from './pages/AdminFormateurs';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { PopupProvider } from './contexts/PopupContext';

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <PopupProvider>
      <PwaInstallPrompt />
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/exam-room/:id" element={<ExamRoom />} />
        <Route element={<TeacherSidebarLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<MyCourses />} />
          <Route path="/teacher/access" element={<TeacherCourseAccess />} />
          <Route path="/teacher/evaluations" element={<TeacherEvaluations />} />
          <Route path="/teacher/alerts" element={<TeacherAlerts />} />
          <Route path="/teacher/profile" element={<Profile />} />
          <Route path="/teacher/settings" element={<Settings />} />
        </Route>
        <Route element={<AdminSidebarLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/formateurs" element={<AdminFormateurs />} />
          <Route path="/admin/grades" element={<AdminGrades />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/enrollments" element={<AdminEnrollments />} />

        </Route>
        <Route path="/course/:courseId" element={<CourseViewer />} />
        <Route path="/payment-gateway" element={<PaymentGateway />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </PopupProvider>
  );
}

export default App;

