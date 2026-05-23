import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

// Service imports
import { getCourses, createCourse, deleteCourse } from '../services/courses.service';
import roomsService from '../services/rooms.service';
import studentsService from '../services/students.service';
import * as teachersService from '../services/teachers.service';
import { getGroups, createGroup, deleteGroup } from '../services/groups.service';
import { Courses } from './Courses';
import Groups from './Groups';
import Teachers from './Teachers';
import Branches from './Branches';
import Rooms from './Rooms';
import Students from './Students';
import GroupDetails from './GroupDetails';
import HomeworkDetail from './HomeworkDetail';
import HomeworkSubmissions from './HomeworkSubmissions';
import HomeworkVerification from './HomeworkVerification';
import CreateExamPage from './CreateExamPage';
import ExamDetailsPage from './ExamDetailsPage';
import ExamReviewPage from './ExamReviewPage';

const SidebarIcon = ({ name }) => {
  switch (name) {
    case 'home':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
    case 'teachers':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
    case 'classes':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>;
    case 'students':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>;
    case 'gifts':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 0h4a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h4"/></svg>;
    case 'settings':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
    case 'courses':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;
    case 'finance':
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>;
    default:
      return null;
  }
};

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0 mln';
  return `${new Intl.NumberFormat('uz-UZ').format(numericValue)} mln`;
};


const SectionPage = ({ title, subtitle, icon, isDarkMode, items, type, onAdd, onDelete }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{title}</h2>
        <p className="mt-2 text-sm font-medium text-gray-500">{subtitle}</p>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all"
        >
          <span>+</span> Qo'shish
        </button>
      )}
    </div>
    {!items || items.length === 0 ? (
      <div className={`rounded-lg border p-8 ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${isDarkMode ? 'bg-[#0f172a] text-indigo-300' : 'bg-indigo-50 text-[#7c4dff]'}`}>
          <SidebarIcon name={icon} />
        </div>
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{title}</h3>
        <p className="mt-2 max-w-xl text-sm text-gray-500">Hozircha ma'lumotlar mavjud emas.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div key={item.id || idx} className={`p-6 rounded-xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center space-x-4 mb-4 relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200">
                <img src={item.photo ? `http://localhost:3000/files/${item.photo}` : `https://ui-avatars.com/api/?name=${item.first_name}+${item.last_name}&background=random&color=fff`} className="w-full h-full object-cover" alt={item.first_name} />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{item.first_name} {item.last_name}</h4>
                <p className="text-xs text-gray-500 capitalize">{type === 'teacher' ? 'O\'qituvchi' : 'Talaba'}</p>
              </div>
              {onDelete && (
                <button onClick={() => onDelete(item.id)} className="absolute top-0 right-0 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="O'chirish">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>{item.phone}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>{item.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Dashboard = ({ onLogout, userEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [language, setLanguage] = useState('uz');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '' });
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddRoomSidebar, setShowAddRoomSidebar] = useState(false);
  const [counts, setCounts] = useState({ groups: 0, courses: 0, students: 0, gifts: 0, teachers: 0 });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const activeTab = location.pathname.split('/')[2] || 'home';
  const activeSettingsTab = location.pathname.split('/')[3] || 'courses';

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // Business logic functions
  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.capacity) return;
    try {
      if (editingRoom) {
        await axios.patch(`http://localhost:3000/api/v1/rooms/${editingRoom.id}`, {
          name: newRoom.name,
          capacity: parseInt(newRoom.capacity)
        }, getHeaders());
        setEditingRoom(null);
      } else {
        await roomsService.createRoom({
           name: newRoom.name,
           capacity: parseInt(newRoom.capacity)
        });
      }
      const res = await roomsService.getAllRooms();
      const roomList = Array.isArray(res) ? res : res?.data || [];
      setRooms(roomList);
      closeRoomSidebar();
    } catch (error) {
      console.error('Error adding/updating room:', error);
      closeRoomSidebar();
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await roomsService.deleteRoom(id);
      const res = await roomsService.getAllRooms();
      const roomList = Array.isArray(res) ? res : res?.data || [];
      setRooms(roomList);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const openEditSidebar = (room) => {
    setEditingRoom(room);
    setNewRoom({ name: room.name, capacity: room.capacity });
    setShowAddRoomSidebar(true);
  };

  const closeRoomSidebar = () => {
    setShowAddRoomSidebar(false);
    setEditingRoom(null);
    setNewRoom({ name: '', capacity: '' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, groupsRes, coursesRes, studentsRes, teachersRes] = await Promise.all([
          roomsService.getAllRooms(),
          getGroups(),
          getCourses(),
          studentsService.getAllStudents(),
          teachersService.getAllTeachers()
        ]);
        
        setRooms(Array.isArray(roomsRes) ? roomsRes : roomsRes?.data || []);
        const groupList = Array.isArray(groupsRes) ? groupsRes : groupsRes?.data || [];
        const courseList = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];
        setCourses(courseList);
        
        const studentList = Array.isArray(studentsRes) ? studentsRes : studentsRes?.data || [];
        setStudents(studentList);
        
        const teachersList = Array.isArray(teachersRes) ? teachersRes : teachersRes?.data || [];
        setTeachers(teachersList);
        
        setCounts({
          groups: groupList.length,
          courses: courseList.length,
          students: studentList.length,
          gifts: 0,
          teachers: teachersList.length
        });
      } catch (error) {
        console.error('Data fetch failed:', error);
      }
    };
    fetchData();
  }, []);

  const translations = {
    uz: {
      home: 'Asosiy', teachers: 'O\'qituvchilar', groups: 'Guruhlar', courses: 'Kurslar', students: 'Talabalar', gifts: 'Sovg\'alar', finance: 'Moliya', settings: 'Boshqarish', subscription: 'Obuna', subExpired: 'Obunangiz tugagan', renew: 'Obunani yangilash', welcome: 'Salom, creator!', welcomeSub: 'CRMga xush kelibsiz!', schedule: 'Dars Jadvali', logout: 'Chiqish', logoutTitle: 'Hisobdan chiqish', logoutMessage: 'Rostdan ham hisobdan chiqmoqchimisiz?', logoutConfirm: 'Ha, chiqaman', logoutCancel: 'Yo\'q, qolaman', menu: 'Menu',
      settingsMenu: { courses: 'Kurslar', rooms: 'Xonalar', branch: 'Filiallar', employees: 'Xodimlar', reasons: 'Sabablar', roles: 'Rollar', coin: 'Coin', sendMessage: 'Xabar yuborish', faq: 'FAQ', check: 'Tekshiruv', telegramBot: 'Telegram bot' }
    },
    ru: {
      home: 'Главная', teachers: 'Учителя', groups: 'Группы', courses: 'Курсы', students: 'Студенты', gifts: 'Подарки', finance: 'Финансы', settings: 'Управление', subscription: 'Подписка', subExpired: 'Ваша подписка истекла', renew: 'Продлить подписку', welcome: 'Привет, создатель!', welcomeSub: 'Добро пожаловать в CRM!', schedule: 'Расписание занятий', logout: 'Выйти', logoutTitle: 'Выйти из аккаунта', logoutMessage: 'Вы действительно хотите выйти?', logoutConfirm: 'Да, выйти', logoutCancel: 'Нет, остаться', menu: 'Меню',
      settingsMenu: { courses: 'Курсы', rooms: 'Кабинеты', branch: 'Филиалы', employees: 'Сотрудники', reasons: 'Причины', roles: 'Роли', coin: 'Монеты', sendMessage: 'Отправить сообщение', faq: 'ЧАВО', check: 'Проверка', telegramBot: 'Telegram bot' }
    }
  };

  const t = translations[language];
  const dashboardStats = [
    { label: t.groups, icon: 'classes', color: 'text-purple-600', bg: 'bg-purple-50', to: '/dashboard/groups', count: counts.groups },
    { label: t.settingsMenu.courses, icon: 'courses', color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/dashboard/settings/courses', count: counts.courses },
    { label: t.students, icon: 'students', color: 'text-blue-600', bg: 'bg-blue-50', to: '/dashboard/students', count: counts.students },
    { label: t.gifts, icon: 'gifts', color: 'text-pink-600', bg: 'bg-pink-50', to: '/dashboard/gifts', count: counts.gifts },
    { label: t.teachers, icon: 'teachers', color: 'text-orange-600', bg: 'bg-orange-50', to: '/dashboard/teachers', count: counts.teachers },
  ];
  const settingsTabs = [
    { id: 'courses', label: t.settingsMenu.courses },
    { id: 'rooms', label: t.settingsMenu.rooms },
    { id: 'branch', label: t.settingsMenu.branch },
    { id: 'employees', label: t.settingsMenu.employees },
    { id: 'roles', label: t.settingsMenu.roles },
    { id: 'coin', label: t.settingsMenu.coin },
    { id: 'reasons', label: t.settingsMenu.reasons },
    { id: 'send-message', label: t.settingsMenu.sendMessage },
    { id: 'faq', label: t.settingsMenu.faq },
    { id: 'telegram-bot', label: t.settingsMenu.telegramBot || 'Telegram bot' },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8f9fc]'}`}>
      <Sidebar 
        isCollapsed={isCollapsed}
        isDarkMode={isDarkMode}
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        activeItem={activeTab === 'settings' ? 'manage' : activeTab} 
        onItemClick={(id) => {
          if (id === 'manage') navigate('/dashboard/settings/courses');
          else navigate(`/dashboard/${id}`);
        }}
      />
      
      <main 
        className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '80px' : '250px' }}
      >
        <header className={`h-20 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 ${isDarkMode ? 'bg-[#1e293b]/80 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-gray-100 backdrop-blur-md'}`}>
          <div className={`hidden sm:flex items-center space-x-4 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#334155] border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <span className="text-xs font-semibold">May 1, 2026 - May 31, 2026</span>
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
            <Route index element={<Navigate to="/dashboard/home" replace />} />
            <Route path="home" element={<>
              <div className="mb-10"><h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{t.welcome}</h2><p className="font-medium text-gray-500">{t.welcomeSub}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                {dashboardStats.map((stat) => (
                  <button type="button" key={stat.label} onClick={() => navigate(stat.to)} className={`p-7 rounded-2xl border flex flex-col items-center group transition-all hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-[#1e293b] border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`mb-4 p-4 ${stat.bg} ${stat.color} rounded-2xl shadow-inner`}><SidebarIcon name={stat.icon} /></div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{stat.count}</div>
                  </button>
                ))}
              </div>
            </>} />
            <Route path="teachers" element={<Teachers isDarkMode={isDarkMode} />} />
            <Route path="students" element={<Students isDarkMode={isDarkMode} />} />
            <Route path="groups" element={<Groups isDarkMode={isDarkMode} />} />
            <Route path="groups/:id" element={<GroupDetails isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/create" element={<CreateExamPage isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/:examId/check/:studentId" element={<ExamReviewPage isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/exams/:examId" element={<ExamDetailsPage isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId" element={<HomeworkDetail isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId/submissions" element={<HomeworkSubmissions isDarkMode={isDarkMode} />} />
            <Route path="homework/:homeworkId/verify/:answerId" element={<HomeworkVerification isDarkMode={isDarkMode} />} />
            <Route path="homework/verify/:answerId" element={<HomeworkVerification isDarkMode={isDarkMode} />} />
            <Route path="settings/*" element={<>
              <div className="mb-5">
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{t.settings}</h2>
                <p className="mt-2 text-sm text-gray-500">Ushbu sahifada siz sovg'alarni boshqarish imkoniyatiga ega bo'lasiz. Har bir sovg'a haqida batafsil ma'lumot va yangi sovg'a qo'shish imkoniyati bor.</p>
                <div className="mt-6 flex gap-6 overflow-x-auto border-b dark:border-gray-700">
                  {settingsTabs.map(tab => (
                    <button key={tab.id} onClick={() => navigate(`/dashboard/settings/${tab.id}`)} className={`relative whitespace-nowrap pb-3 text-sm font-semibold transition-colors ${activeSettingsTab === tab.id ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') : (isDarkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600')}`}>
                      {tab.label}{activeSettingsTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                    </button>
                  ))}
                </div>
              </div>
              <Routes>
                <Route index element={<Navigate to="/dashboard/settings/courses" replace />} />
                <Route path="courses" element={<Courses isDarkMode={isDarkMode} />} />
                <Route path="rooms" element={<Rooms isDarkMode={isDarkMode} />} />
                <Route path="branch" element={<Branches isDarkMode={isDarkMode} />} />
                <Route path="*" element={<Navigate to="/dashboard/settings/courses" replace />} />
              </Routes>
            </>} />
            <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
          </Routes>
        </div>
      </main>

      {/* Modals and Sidebars */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl transition-transform duration-300 ${showAddRoomSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between dark:border-gray-700 border-gray-100`}><h2 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{editingRoom ? 'Xonani tahrirlash' : 'Xonani qo\'shish'}</h2><button onClick={closeRoomSidebar} className="p-2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div className="p-6 space-y-6">
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Nomi *</label><input type="text" value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Sig'imi *</label><input type="number" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
        </div>
        <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3"><button onClick={closeRoomSidebar} className="px-5 py-2.5 text-gray-600">Bekor qilish</button><button onClick={handleAddRoom} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">{editingRoom ? 'Saqlash' : 'Qo\'shish'}</button></div>
      </div>
      {showAddRoomSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={closeRoomSidebar} />}

      {/* Logout Modal */}
      {showLogoutModal && <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} /><div className={`relative w-full max-w-sm mx-4 rounded-3xl p-8 shadow-2xl border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></div><h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{t.logoutTitle}</h3><p className="text-sm mb-8 text-gray-500">{t.logoutMessage}</p><div className="flex w-full space-x-3"><button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 text-gray-600 font-medium">{t.logoutCancel}</button><button onClick={onLogout} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">{t.logoutConfirm}</button></div></div></div></div>}
    </div>
  );
};

export default Dashboard;
