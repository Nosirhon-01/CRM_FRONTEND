import { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Groups from './Groups';
import GroupDetails from './GroupDetails';
import HomeworkDetail from './HomeworkDetail';
import HomeworkSubmissions from './HomeworkSubmissions';
import HomeworkVerification from './HomeworkVerification';
import CreateExamPage from './CreateExamPage';
import ExamDetailsPage from './ExamDetailsPage';
import ExamReviewPage from './ExamReviewPage';

const TeacherDashboard = ({ onLogout, userEmail, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Custom sidebar items for teacher
  const teacherMenuItems = [
    { id: 'groups', label: 'Guruhlar' },
    { id: 'profile', label: 'Profil' },
  ];

  const activeTab = location.pathname.split('/')[2] || 'groups';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8f9fc]'}`}>
      <Sidebar 
        isCollapsed={isCollapsed}
        isDarkMode={isDarkMode}
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        activeItem={activeTab} 
        onItemClick={(id) => navigate(`/dashboard/${id}`)}
        menuItems={teacherMenuItems}
      />
      
      <main 
        className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '80px' : '250px' }}
      >
        <header className={`h-20 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 ${isDarkMode ? 'bg-[#1e293b]/80 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-gray-100 backdrop-blur-md'}`}>
          <div className="flex-1">
             <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>
               Teacher Dashboard
             </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')} className={`relative w-[88px] h-10 rounded-full p-1 ${isDarkMode ? 'bg-[#334155]' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-[40px] h-8 rounded-full flex items-center justify-center text-xs font-black tracking-wide shadow-md transition-all duration-500 ${language === 'uz' ? 'left-1 bg-indigo-600 text-white' : 'left-[44px] bg-indigo-600 text-white'}`}>{language === 'uz' ? 'UZ' : 'RU'}</div>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm ${isDarkMode ? 'bg-yellow-400 text-white' : 'bg-white text-blue-400 border border-gray-100'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z"/></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>}
            </button>
            <button onClick={() => setShowLogoutModal(true)} className={`w-10 h-10 flex items-center justify-center text-red-400 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${isDarkMode ? 'border-indigo-500/40 bg-indigo-900/30' : 'border-indigo-200 bg-indigo-100'}`}><img src={`https://ui-avatars.com/api/?name=${userEmail}&background=random&color=fff&bold=true`} alt="Profile" /></div>
          </div>
        </header>

        <div className={`flex-1 px-6 py-8 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fdfdff]'}`}>
          <Routes>
            <Route index element={<Navigate to="/dashboard/groups" replace />} />
            <Route path="groups" element={<Groups isDarkMode={isDarkMode} isTeacher={true} />} />
            <Route path="groups/:id" element={<GroupDetails isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/create" element={<CreateExamPage isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/:examId/check/:studentId" element={<ExamReviewPage isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/:examId" element={<ExamDetailsPage isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId" element={<HomeworkDetail isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId/submissions" element={<HomeworkSubmissions isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId/verify/:answerId" element={<HomeworkVerification isDarkMode={isDarkMode} />} />
            <Route path="homework/verify/:answerId" element={<HomeworkVerification isDarkMode={isDarkMode} />} />
            
            <Route path="profile" element={
              <div className="flex flex-col items-center justify-center p-10 mt-10">
                 <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-6">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>
                 <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{user?.first_name} {user?.last_name}</h2>
                 <p className="text-gray-500 mb-8">{userEmail}</p>
                 <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold uppercase tracking-widest">O'qituvchi Profil</span>
              </div>
            } />
            <Route path="*" element={<Navigate to="/dashboard/groups" replace />} />
          </Routes>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} /><div className={`relative w-full max-w-sm mx-4 rounded-3xl p-8 shadow-2xl border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></div><h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Hisobdan chiqish</h3><p className="text-sm mb-8 text-gray-500">Rostdan ham hisobdan chiqmoqchimisiz?</p><div className="flex w-full space-x-3"><button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 text-gray-600 font-medium">Bekor qilish</button><button onClick={onLogout} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Ha, chiqaman</button></div></div></div></div>}
    </div>
  );
};

export default TeacherDashboard;
