import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import apiClient from '../services/api';
import StudentLessonDetail from './StudentLessonDetail';

const HomeTab = ({ isDarkMode, user }) => {
  const [groups, setGroups] = useState([]);
  const [coin, setCoin] = useState(user?.coin || 0);

  useEffect(() => {
    apiClient.get('/students/my/groups').then(res => {
        if (res.data?.data) {
            setGroups(res.data.data.groups || []);
            if (res.data.data.student && res.data.data.student.coin !== undefined) {
                setCoin(res.data.data.student.coin);
            }
        }
    }).catch(console.error);
  }, []);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 to 11
  
  // Format month name like "Iyun" automatically based on Locale uz-UZ
  const monthNameRaw = new Intl.DateTimeFormat('uz-UZ', { month: 'long' }).format(currentDate);
  const currentMonthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dayOfWeekNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  const hasClassOnDay = (dayIndex) => {
      const dateObj = new Date(currentYear, currentMonth, dayIndex);
      const dayString = dayOfWeekNames[dateObj.getDay()];
      return groups.some(g => {
          if (Array.isArray(g.week_day)) {
              return g.week_day.includes(dayString);
          } else if (typeof g.week_day === 'string') {
              try {
                  const arr = JSON.parse(g.week_day);
                  return Array.isArray(arr) && arr.includes(dayString);
              } catch(e) { return false; }
          }
          return false;
      });
  };

  const calculateSessionTime = (startStr) => {
      if (!startStr) return "";
      const parts = startStr.split(':');
      if (parts.length < 2) return startStr;
      let h = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let endH = h + 1;
      let endM = m + 30;
      if (endM >= 60) {
          endH++;
          endM -= 60;
      }
      const pad = (n) => n.toString().padStart(2, '0');
      return `${pad(h)}:${pad(m)} - ${pad(endH)}:${pad(endM)}`;
  };
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>
          Coin: {coin}
        </h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <path d="M6 3h12l4 6-10 13L2 9z"/>
          <path d="M11 3 8 9l4 13 4-13-3-6"/>
          <path d="M2 9h20"/>
        </svg>
      </div>

      <div className={`p-6 rounded-2xl shadow-sm border w-full max-w-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2 mb-4 font-bold text-[#1e2a4a]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          <span className={isDarkMode ? 'text-white' : ''}>Bosqich: 3</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">848 / 1100</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 mb-4 font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          XP: 848
        </div>

        <div>
          <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Reyting</h3>
          <p className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Umumiy: 1218 - o'rin</p>
        </div>
      </div>

      <div>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Dars jadvali</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          <div className={`p-6 rounded-2xl shadow-sm border w-full max-w-[320px] ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{currentMonthName} {currentYear}</span>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
                <button className="text-gray-400 hover:text-gray-700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D','S','C','P','J','S','Y'].map((d, index) => (
                <div key={index} className="text-xs font-semibold text-gray-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(daysInMonth)].map((_, i) => {
                const dayDate = i + 1;
                const isSelected = dayDate === currentDate.getDate();
                const hasDot = hasClassOnDay(dayDate);
                return (
                  <div key={i} className="flex flex-col items-center justify-center p-1">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full ${isSelected ? 'border-2 border-gray-800 font-bold' : ''}`}>
                      {dayDate}
                    </div>
                    {hasDot && <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-0.5"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            {groups.length === 0 ? (
                <div className={`text-sm opacity-50 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sizda faol guruhlar yo'q</div>
            ) : (
                groups.map(group => (
                    <div key={group.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border-l-green-500 font-medium ${isDarkMode ? 'bg-green-900/20 text-green-100' : 'bg-green-50 text-green-900'}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {group.name && <span className="font-bold mr-2 text-xs opacity-70">[{group.name}]</span>}
                        {calculateSessionTime(group.start_time) || "Noma'lum vaqt"}
                    </div>
                ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const GroupsTab = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    apiClient.get('/students/my/groups').then(res => {
        if (res.data?.data) {
            setGroups(res.data.data.groups || []);
        }
    }).catch(console.error);
  }, []);

  const formatDate = (dateString) => {
    if(!dateString) return "-";
    const date = new Date(dateString);
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const activeGroups = groups.filter(g => g.status === 'active' || g.status === 'planned');
  const completedGroups = groups.filter(g => g.status === 'completed');

  const displayedGroups = tab === 'active' ? activeGroups : completedGroups;

  return (
    <div className={`p-2 lg:p-6 rounded-md shadow-sm border max-w-5xl mx-auto w-full ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex border-b mb-4 select-none mt-2 lg:px-4">
            <button 
                onClick={() => setTab('active')} 
                className={`pb-3 px-6 font-medium text-[15px] transition-all relative ${tab === 'active' ? 'text-[#b47a46]' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Faol
                {tab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b47a46]" />}
            </button>
            <button 
                onClick={() => setTab('completed')} 
                className={`pb-3 px-6 font-medium text-[15px] transition-all relative ${tab === 'completed' ? 'text-[#b47a46]' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Tugagan
                {tab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b47a46]" />}
            </button>
        </div>

        <div className="overflow-x-auto lg:px-4 pb-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className={`py-4 px-2 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>#</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Guruh nomi</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Yo'nalishi</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>O'qituvchi</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Boshlash vaqti</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedGroups.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="py-12 text-center text-gray-400 text-[14px]">Sizda bunday guruhlar mavjud emas</td>
                        </tr>
                    ) : (
                        displayedGroups.map((g, i) => (
                            <tr key={g.id} onClick={() => navigate(`/dashboard/groups/${g.id}`)} className={`border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-50'}`}>
                                <td className={`py-4 px-2 text-[14px] font-medium ${isDarkMode ? 'text-indigo-400' : 'text-[#3b82f6]'}`}>{i + 1}</td>
                                <td className={`py-4 px-4 text-[14px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{g.name}</td>
                                <td className={`py-4 px-4 text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{g.courses?.name || "-"}</td>
                                <td className="py-4 px-4">
                                    <div className="w-8 h-8 rounded-full bg-[#d6a56e] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                                        {g.teachers && g.teachers.length > 0 ? (g.teachers[0].first_name.charAt(0) + (g.teachers[0].last_name ? g.teachers[0].last_name.charAt(0) : '')) : '?'}
                                    </div>
                                </td>
                                <td className={`py-4 px-4 text-[14px] font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(g.start_date)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const GroupDetailsTab = ({ isDarkMode }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    // If we wanted to get group name we could fetch group details or pass it. 
    // Here we focus on fetching lessons as requested.
    apiClient.get(`/lessons/my/group/${groupId}`).then(res => {
        if (res.data?.data) {
            setLessons(res.data.data);
        }
    }).catch(console.error);
    
    // Quick fetch for group name so the header matches the screenshot "Bootcamp Full Stack N26"
    apiClient.get('/students/my/groups').then(res => {
        if (res.data?.data) {
            const found = res.data.data.groups.find(g => g.id === parseInt(groupId, 10));
            if (found) setGroup(found);
        }
    }).catch(console.error);
  }, [groupId]);

  const formatDate = (dateString, includeTime = false) => {
    if(!dateString) return "-";
    const date = new Date(dateString);
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const formatted = `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    if (includeTime) {
      return `${formatted} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return formatted;
  };

  const getHomeworkStatus = (hwArr) => {
      if (!hwArr || hwArr.length === 0) {
          return { label: 'Berilmagan', bg: isDarkMode ? 'bg-gray-600' : 'bg-gray-500', text: 'text-white' };
      }
      const hw = hwArr[0];
      const answers = hw.homeworkAnswerStudents || [];
      if (answers.length === 0) {
          return { label: 'Bajarilmagan', bg: 'bg-red-500', text: 'text-white' };
      }
      const st = answers[0].status;
      if (st === 'PENDING') {
          return { label: 'Kutayotganlar', bg: 'bg-blue-500', text: 'text-white' };
      }
      if (st === 'ACCEPTED') {
          return { label: 'Qabul qilingan', bg: 'bg-green-500', text: 'text-white' };
      }
      if (st === 'REJECTED') {
          return { label: 'Qaytarilgan', bg: 'bg-red-500', text: 'text-white' };
      }
      return { label: 'Bajarilgan', bg: 'bg-blue-500', text: 'text-white' };
  };

  return (
    <div className={`p-2 lg:p-6 rounded-md shadow-sm border max-w-6xl mx-auto w-full ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uy vazifa statusi</p>
                <select className={`border rounded-md px-4 py-2 text-sm outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600 outline-none text-white' : 'bg-white border-gray-300'}`}>
                    <option>Barchasi</option>
                    <option>Berilmagan</option>
                    <option>Bajarilmagan</option>
                    <option>Kutayotganlar</option>
                </select>
            </div>
            <h2 className={`text-xl font-bold mt-4 md:mt-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {group?.name || "Yuklanmoqda..."}
            </h2>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Mavzular</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Video</th>
                        <th className={`py-4 px-4 font-bold text-[14px] ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Uyga vazifa Holati</th>
                        <th className={`py-4 px-4 font-bold text-[14px] flex items-center gap-1 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>
                            Uyga vazifa tugash vaqti <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                        </th>
                        <th className={`py-4 px-4 font-bold text-[14px] whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>
                            Dars sanasi <svg className="inline text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {lessons.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="py-12 text-center text-gray-400 text-[14px]">Darslar mavjud emas</td>
                        </tr>
                    ) : (
                        lessons.map((lesson) => {
                            const hwStatus = getHomeworkStatus(lesson.homework);
                            const videoCount = lesson.videos?.length || 0;
                            // Estimate deadline from homework creation date or just put "-" if no homework
                            const hwDeadline = lesson.homework && lesson.homework.length > 0 
                                ? formatDate(new Date(new Date(lesson.homework[0].created_at).getTime() + 86400000), true) // Mock 1 day later
                                : "-";
                            
                            return (
                                <tr key={lesson.id} onClick={() => navigate(`/dashboard/groups/${groupId}/lessons/${lesson.id}`)} className={`border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-50'}`}>
                                    <td className={`py-5 px-4 text-[14px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{lesson.topic}</td>
                                    <td className="py-5 px-4 text-center">
                                        <div className="inline-flex w-7 h-7 rounded-full border border-blue-200 items-center justify-center text-[12px] font-semibold text-blue-500">
                                            {videoCount}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className={`px-4 py-1.5 rounded-md text-[13px] font-medium ${hwStatus.bg} ${hwStatus.text}`}>
                                            {hwStatus.label}
                                        </span>
                                    </td>
                                    <td className={`py-5 px-4 text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{hwDeadline}</td>
                                    <td className={`py-5 px-4 text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(lesson.lesson_date)}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

const StudentDashboard = ({ onLogout, userEmail, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const studentMenuItems = [
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'payments', label: "To'lovlarim" },
    { id: 'groups', label: 'Guruhlarim' },
    { id: 'metrics', label: "Ko'rsatgichlarim" },
    { id: 'rating', label: 'Reyting' },
    { id: 'shop', label: "Do'kon" },
    { id: 'extra', label: "Qo'shimcha darslar" },
    { id: 'settings', label: 'Sozlamalar' },
  ];

  const activeTab = location.pathname.split('/')[2] || 'home';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f4f7f6]'}`}>
      <Sidebar 
        isCollapsed={isCollapsed}
        isDarkMode={isDarkMode}
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        activeItem={activeTab} 
        onItemClick={(id) => navigate(`/dashboard/${id}`)}
        menuItems={studentMenuItems}
      />
      
      <main 
        className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '80px' : '250px' }}
      >
        <header className={`h-16 flex items-center justify-end px-4 md:px-8 top-0 z-40 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f4f7f6]'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm ${isDarkMode ? 'bg-yellow-400 text-white' : 'bg-white text-blue-400 border border-gray-100'}`}>
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z"/></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>}
            </button>
            <div className="relative">
               <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
            </div>
            <button onClick={() => setShowLogoutModal(true)} className={`w-10 h-10 flex items-center justify-center text-red-500 rounded-xl transition-colors hover:bg-red-50`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        <div className={`flex-1 px-6 py-4 md:px-10`}>
          <Routes>
            <Route index element={<Navigate to="/dashboard/home" replace />} />
            <Route path="home" element={<HomeTab isDarkMode={isDarkMode} user={user} />} />
            <Route path="groups" element={<GroupsTab isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId" element={<GroupDetailsTab isDarkMode={isDarkMode} />} />
            <Route path="groups/:groupId/lessons/:lessonId" element={<StudentLessonDetail isDarkMode={isDarkMode} />} />
            <Route path="*" element={
               <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <p>Hali tayyor emas...</p>
               </div>
            } />
          </Routes>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && <div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} /><div className={`relative w-full max-w-sm mx-4 rounded-3xl p-8 shadow-2xl border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></div><h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Hisobdan chiqish</h3><p className="text-sm mb-8 text-gray-500">Rostdan ham hisobdan chiqmoqchimisiz?</p><div className="flex w-full space-x-3"><button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 text-gray-600 font-medium">Bekor qilish</button><button onClick={onLogout} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Ha, chiqaman</button></div></div></div></div>}
    </div>
  );
};

export default StudentDashboard;
