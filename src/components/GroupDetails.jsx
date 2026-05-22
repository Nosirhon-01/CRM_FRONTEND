import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupById } from '../services/groups.service';
import * as lessonsService from '../services/lessons.service';
import * as attendanceService from '../services/attendance.service';
import * as homeworkService from '../services/homework.service';
import VideosTab from './VideosTab';
import { toast } from 'react-hot-toast';
import { BookOpen, CheckCircle2, ClipboardList, Clock3, GraduationCap, Pencil, Plus, Trash2, Users, Video } from 'lucide-react';

const GroupDetails = ({ isDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('info');
  const [activeLessonTab, setActiveLessonTab] = useState('lessons');
  const [openAccordion, setOpenAccordion] = useState('mentors'); // 'mentors', 'params', 'schedule'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);
  const [topic, setTopic] = useState('');
  const [studentAttendance, setStudentAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [homeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ lesson_id: '', title: '', file: null });
  const [savingHomework, setSavingHomework] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ id: '', topic: '', lesson_date: '' });
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const scrollRef = useRef(null);

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getLessonDate = (lesson) => lesson?.lesson_date || lesson?.created_at;

  const findLessonForDate = (lessonList, date) => {
    const dayLessons = lessonList.filter(l => isSameDay(new Date(getLessonDate(l)), date));
    return dayLessons.find(l => l.attendances?.length > 0) || dayLessons[0];
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchLessons();
  }, [id]);

  useEffect(() => {
    // When date changes, find lesson for that date
    const lesson = findLessonForDate(lessons, selectedDate);
    if (lesson) {
        setTopic(lesson.topic || '');
        const attendanceMap = {};
        lesson.attendances?.forEach(a => {
            attendanceMap[a.student_id] = a.isPresent;
        });
        setStudentAttendance(attendanceMap);
    } else {
        setTopic('');
        setStudentAttendance({});
    }
  }, [selectedDate, lessons]);

  const fetchLessons = async () => {
    try {
        const res = await lessonsService.getGroupLessons(id);
        if (res.success) {
            setLessons(res.data);
        }
    } catch (err) {
        console.error('Failed to fetch lessons:', err);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await getGroupById(id);
      if (res.success) {
        setGroup(res.data);
      } else {
        setError('Guruh ma\'lumotlarini yuklab bo\'lmadi');
      }
    } catch (err) {
      console.error(err);
      setError('Xatolik yuz berdi');
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for the top bar (current month, non-weekends)
  const getMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip Sat, Sun
        result.push(d);
      }
    }
    return result;
  };

  const dates = getMonthDates();

  const formatDate = (date, options) => {
    return new Intl.DateTimeFormat('uz-UZ', options).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-xl font-bold mb-4">{error || 'Guruh topilmadi'}</div>
        <button 
          onClick={() => navigate('/dashboard/groups')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
        >
          Guruhlarga qaytish
        </button>
      </div>
    );
  }

  const currentTeacher = group?.teachers;
  const currentRoom = group?.rooms;
  const selectedLesson = findLessonForDate(lessons, selectedDate);
  const selectedLessonHasAttendance = !!selectedLesson?.attendances?.length;

  const mainTabs = [
    { id: 'info', label: "Ma'lumotlar" },
    { id: 'lessons', label: 'Guruh darsliklari' },
    { id: 'attendance', label: 'Akademik davomati' }
  ];

  const lessonSubTabs = [
    { id: 'lessons', label: 'Guruh darsliklari', icon: BookOpen },
    { id: 'homework', label: 'Uyga vazifa', icon: ClipboardList },
    { id: 'videos', label: 'Videolar', icon: Video },
    { id: 'exams', label: 'Imtihonlar', icon: GraduationCap },
    { id: 'journal', label: 'Jurnal', icon: ClipboardList }
  ];

  const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

  const getValidDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDateInput = (value) => {
    const date = getValidDate(value);
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const mergeDateInputWithLessonTime = (dateInput, lesson) => {
    const [year, month, day] = dateInput.split('-').map(Number);
    const originalDate = getValidDate(getLessonDate(lesson)) || new Date();
    const nextDate = new Date(originalDate);

    nextDate.setFullYear(year, month - 1, day);

    return nextDate.toISOString();
  };

  const formatLessonDateTime = (value) => {
    const date = getValidDate(value);
    if (!date) return { date: '-', time: '' };

    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return {
      date: `${day} ${month}, ${year}`,
      time: `${hours}:${minutes}`
    };
  };

  const calculateAverageAge = (students) => {
    if (!students || students.length === 0) return 0;
    const currentYear = new Date().getFullYear();
    const sumAges = students.reduce((sum, s) => {
      const birthYear = new Date(s.birth_date).getFullYear();
      return sum + (currentYear - birthYear);
    }, 0);
    return Math.round(sumAges / students.length);
  };

  const getLessonsPerMonth = (weekDays) => {
    if (!weekDays) return 0;
    try {
      const days = typeof weekDays === 'string' ? JSON.parse(weekDays) : weekDays;
      return Array.isArray(days) ? days.length * 4 : 0;
    } catch (e) {
      return 0;
    }
  };

  const addHours = (value, hours) => {
    const date = getValidDate(value);
    if (!date) return null;
    date.setHours(date.getHours() + hours);
    return date;
  };

  const getPresentCount = (lesson) => lesson?.attendances?.filter(a => a.isPresent).length || 0;
  const getAbsentCount = (lesson) => lesson?.attendances?.filter(a => !a.isPresent).length || 0;

  const lessonRows = [...lessons].sort((a, b) => new Date(getLessonDate(b)) - new Date(getLessonDate(a)));
  const homeworkRows = lessonRows.flatMap(lesson => (
    lesson.homework || []
  ).map(homework => ({
    ...homework,
    lesson
  })));

  const tableRows = activeLessonTab === 'homework'
    ? homeworkRows.map(homework => ({
        id: homework.id,
        title: homework.title,
        createdAt: homework.created_at,
        deadlineAt: addHours(homework.created_at, 16),
        lessonDate: getLessonDate(homework.lesson),
        lesson: homework.lesson
      }))
    : lessonRows.map(lesson => ({
        id: lesson.id,
        title: lesson.topic,
        createdAt: lesson.created_at,
        deadlineAt: addHours(lesson.created_at, 16),
        lessonDate: getLessonDate(lesson),
        lesson
      }));

  const canShowLessonTable = activeLessonTab === 'lessons' || activeLessonTab === 'homework';

  const openHomeworkModal = () => {
    if (!lessonRows.length) {
      toast.error("Avval dars mavzusini saqlang");
      return;
    }

    setHomeworkForm({ lesson_id: String(lessonRows[0].id), title: '', file: null });
    setHomeworkModalOpen(true);
  };

  const closeHomeworkModal = () => {
    if (savingHomework) return;
    setHomeworkModalOpen(false);
  };

  const handleSaveHomework = async () => {
    if (!homeworkForm.lesson_id) {
      toast.error("Darsni tanlang");
      return;
    }

    if (!homeworkForm.title.trim()) {
      toast.error("Uyga vazifa mavzusini kiriting");
      return;
    }

    setSavingHomework(true);
    const toastId = toast.loading("Uyga vazifa saqlanmoqda...");
    try {
      await homeworkService.createHomework({
        lesson_id: homeworkForm.lesson_id,
        group_id: id,
        title: homeworkForm.title.trim(),
        file: homeworkForm.file
      });
      toast.success("Uyga vazifa saqlandi!", { id: toastId });
      setHomeworkModalOpen(false);
      setActiveLessonTab('homework');
      await fetchLessons();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Uyga vazifani saqlashda xatolik", { id: toastId });
    } finally {
      setSavingHomework(false);
    }
  };

  const openLessonModal = (lesson) => {
    setLessonForm({
      id: lesson.id,
      topic: lesson.topic || '',
      lesson_date: formatDateInput(getLessonDate(lesson))
    });
    setLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    if (savingLesson) return;
    setLessonModalOpen(false);
  };

  const handleUpdateLesson = async () => {
    if (!lessonForm.topic.trim()) {
      toast.error("Mavzuni kiriting");
      return;
    }

    if (!lessonForm.lesson_date) {
      toast.error("Dars sanasini kiriting");
      return;
    }

    const lesson = lessonRows.find(item => item.id === +lessonForm.id);
    if (!lesson) {
      toast.error("Dars topilmadi");
      return;
    }

    setSavingLesson(true);
    const toastId = toast.loading("Dars yangilanmoqda...");
    try {
      await lessonsService.updateLesson(lessonForm.id, {
        topic: lessonForm.topic.trim(),
        lesson_date: mergeDateInputWithLessonTime(lessonForm.lesson_date, lesson)
      });
      toast.success("Dars yangilandi!", { id: toastId });
      setLessonModalOpen(false);
      await fetchLessons();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Darsni yangilashda xatolik", { id: toastId });
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson) => {
    const isConfirmed = window.confirm(`"${lesson.topic}" darsini o'chirasizmi?`);
    if (!isConfirmed) return;

    setDeletingLessonId(lesson.id);
    const toastId = toast.loading("Dars o'chirilmoqda...");
    try {
      await lessonsService.deleteLesson(lesson.id);
      toast.success("Dars o'chirildi!", { id: toastId });
      await fetchLessons();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Darsni o'chirishda xatolik", { id: toastId });
    } finally {
      setDeletingLessonId(null);
    }
  };



  return (
    <div className={`space-y-6 animate-in fade-in duration-500 pb-10 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/groups')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black">{group?.name}</h1>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-[#10b981] text-[10px] font-black rounded-lg uppercase tracking-wider">
              {group?.status === 'ACTIVE' ? 'AKTIV' : (group?.status || 'AKTIV')}
            </span>
          </div>
        </div>
        <button className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[13px] font-bold transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          Statistika
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b dark:border-gray-800 overflow-x-auto no-scrollbar">
        {mainTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`pb-3 text-[14px] font-bold transition-all relative whitespace-nowrap ${activeMainTab === tab.id ? 'text-[#10b981]' : 'text-gray-300 hover:text-gray-400'}`}
          >
            {tab.label}
            {activeMainTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#10b981] rounded-full" />}
          </button>
        ))}
      </div>

      {activeMainTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* Column 1: Mentors and Akademiklar */}
          <div className="space-y-6">
            {/* Guruh mentorlari Card */}
            <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="bg-[#3b82f6] px-5 py-4 flex items-center justify-between">
                <span className="text-[15px] font-black uppercase tracking-wide text-white">Guruh mentorlari</span>
                <button className="text-white/80 hover:text-white">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-12 justify-start items-center">
                  {/* Teacher */}
                  <div className="flex flex-col items-center text-center max-w-[120px]">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-emerald-500 p-0.5">
                       <img 
                        src={group.teachers?.photo ? `http://localhost:3000/files/${group.teachers.photo}` : `https://ui-avatars.com/api/?name=${group.teachers?.first_name}+${group.teachers?.last_name}&background=ccc&color=fff`} 
                        alt="Teacher"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Teacher</span>
                    <h4 className="text-[14px] font-black leading-tight">{group.teachers?.first_name} {group.teachers?.last_name}</h4>
                  </div>
                  
                  {/* Assistants can be added here if they come from backend in the future */}
                </div>
              </div>
            </div>

            {/* Akademiklar Accordion Placeholder */}
            <div className={`rounded-2xl border flex items-center justify-between p-5 ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
               <span className={`text-[15px] font-black/80 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Akademiklar va ularning o'qitgan soatlari</span>
               <div className="text-gray-400">
                  <Plus className="w-5 h-5" />
               </div>
            </div>
          </div>

          {/* Column 2: Parametrlar Card */}
          <div className="space-y-6">
            <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="bg-[#3b82f6] px-5 py-4 flex items-center justify-between">
                <span className="text-[15px] font-black uppercase tracking-wide text-white">Parametrlar</span>
                <button className="text-white/80 hover:text-white">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { label: 'Filial:', value: group?.rooms?.name || 'Noma\'lum', valueColor: '#3b82f6' },
                      { label: 'Kurs:', value: group?.courses?.name || 'Noma\'lum', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'Turi:', value: group?.courses?.level || 'Noma\'lum', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'Kategoriya:', value: group?.description || 'Programming', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'To\'lov turi:', value: group?.courses?.price ? `${Number(group.courses.price).toLocaleString()} UZS` : 'Noma\'lum', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'O\'rta yosh:', value: calculateAverageAge(group?.students) + ' yosh', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'O\'quvchilar sig\'imi:', value: group?.max_student || '0', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'Mavjud o\'quvchilar:', value: group?.students?.length || '0', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'O\'quv oyidagi darslar soni:', value: getLessonsPerMonth(group?.week_day) || '0', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'Kurs davomiyligi (oy):', value: group?.courses?.duration_month || '0', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                      { label: 'Jami darslar soni:', value: (getLessonsPerMonth(group?.week_day) * (group?.courses?.duration_month || 0)) || '0', valueColor: isDarkMode ? '#f3f4f6' : '#111827' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-3 text-[14px] font-extrabold text-[#374151] dark:text-gray-400">{row.label}</td>
                        <td className="py-3 text-[14px] font-black text-right" style={{ color: row.valueColor }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeMainTab === 'info' || activeMainTab === 'attendance') && (
        <div className="space-y-8">
            {/* Calendar Section */}
            <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white border border-gray-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h3 className="text-[14px] font-bold">1-o'quv oyi</h3>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Kelgan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Kelmagan</span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div 
                        ref={scrollRef}
                        className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                    >
                        {dates.map((date, idx) => {
                            const isSelected = isSameDay(date, selectedDate);
                            // Find lesson for this date to show status
                            const lesson = findLessonForDate(lessons, date);
                            const hasAttendance = lesson?.attendances?.length > 0;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-shrink-0 w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center transition-all border ${
                                        isSelected 
                                            ? 'bg-[#10b981] border-[#10b981] text-white shadow-lg' 
                                            : isDarkMode 
                                                ? 'bg-[#1e293b] text-gray-500 border-gray-700 hover:border-gray-600' 
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                        {formatDate(date, { month: 'short' }).replace('.', '')}
                                    </span>
                                    <span className="text-[18px] font-black leading-none">{formatDate(date, { day: '2-digit' })}</span>
                                    {hasAttendance && !isSelected && (
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Students List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-black uppercase tracking-tight">O'quvchilar</h2>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {group.students?.length} TA AKTIV O'QUVCHI
                    </span>
                </div>

                <div className="space-y-3">
                    {group.students?.map((student, idx) => {
                         const phone = (student.phone || '+998883991330'); 
                         const isPresent = !!(studentAttendance && studentAttendance[student.id]);
                         return (
                            <div 
                                key={student.id} 
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=6366f1&color=fff`} 
                                            alt={student.first_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold leading-tight">{student.first_name} {student.last_name}</h4>
                                        <p className="text-[12px] text-gray-400 font-medium">{phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => {
                                            if (selectedLessonHasAttendance) {
                                                toast.error("Bu sana uchun davomat allaqachon saqlangan!");
                                                return;
                                            }
                                            setStudentAttendance(prev => ({
                                                ...(prev || {}),
                                                [student.id]: !prev?.[student.id]
                                            }));
                                        }}
                                        className={`relative inline-flex items-center transition-all duration-300 w-11 h-6 rounded-full border ${selectedLessonHasAttendance ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isPresent ? 'bg-[#10b981] border-[#10b981]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isPresent ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                    </div>
                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-6 flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                         <input 
                            type="text"
                            placeholder="Mavzu"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={savingAttendance || selectedLessonHasAttendance}
                            className={`flex-1 px-5 py-3 rounded-2xl border outline-none text-[14px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-gray-50 border-gray-100 focus:border-[#6366f1]'}`}
                        />
                        <button
                            onClick={async () => {
                                if (selectedLessonHasAttendance) {
                                    toast.error("Bu sana uchun davomat allaqachon saqlangan!");
                                    return;
                                }
                                if (!topic) {
                                    toast.error("Mavzuni kiriting!");
                                    return;
                                }
                                setSavingAttendance(true);
                                const toastId = toast.loading("Saqlanmoqda...");
                                try {
                                    const lessonPayload = {
                                        group_id: +id,
                                        topic: topic,
                                        lesson_date: selectedDate.toISOString(),
                                        description: ""
                                    };
                                    const lessonRes = selectedLesson
                                        ? { success: true, data: selectedLesson }
                                        : await lessonsService.createLesson(lessonPayload);
                                    
                                    if (lessonRes.success) {
                                        const newLessonId = lessonRes.data.id;
                                        const attendancePayload = {
                                            lesson_id: newLessonId,
                                            attendances: group.students.map(s => ({
                                                student_id: s.id,
                                                isPresent: !!studentAttendance[s.id]
                                            }))
                                        };
                                        await attendanceService.createBulkAttendance(attendancePayload);
                                        toast.success("Davomat saqlandi!", { id: toastId });
                                        await fetchLessons();
                                    } else {
                                        throw new Error("Lesson creation failed");
                                    }
                                } catch (err) {
                                    console.error(err);
                                    toast.error(err.message || "Saqlashda xatolik yuz berdi", { id: toastId });
                                } finally {
                                    setSavingAttendance(false);
                                }
                            }}
                            disabled={savingAttendance || selectedLessonHasAttendance}
                            className="px-8 py-3 bg-[#6366f1] text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-[#4f46e5] text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingAttendance ? 'Saqlanmoqda...' : selectedLessonHasAttendance ? 'Saqlangan' : 'Saqlash'}
                        </button>
                     </div>
                </div>
            </div>
        </div>
      )}

      {activeMainTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <h2 className="text-[18px] font-black whitespace-nowrap">Guruh darsliklari</h2>
              <div className={`inline-flex w-full overflow-x-auto rounded-lg border p-1 lg:w-auto ${isDarkMode ? 'bg-[#111827] border-gray-800' : 'bg-[#f8fafc] border-gray-100'}`}>
                {lessonSubTabs.map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLessonTab(tab.id)}
                      className={`flex min-w-max items-center gap-2 rounded-md px-5 py-2 text-[13px] font-bold transition-all ${
                        activeLessonTab === tab.id
                          ? isDarkMode ? 'bg-[#1e293b] text-white shadow-sm' : 'bg-white text-[#1e2a4a] shadow-sm'
                          : 'text-gray-400 hover:text-[#10b981]'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {activeLessonTab !== 'videos' && (
              <button
                type="button"
                onClick={openHomeworkModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-5 py-2.5 text-[13px] font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#059669]"
              >
                <Plus className="h-4 w-4" />
                Uyga vazifa qo'shish
              </button>
            )}
          </div>

          {activeLessonTab === 'videos' ? (
            <VideosTab groupId={id} isDarkMode={isDarkMode} />
          ) : canShowLessonTable ? (
            tableRows.length ? (
              <div className={`overflow-x-auto rounded-xl border ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white shadow-sm'}`}>
                <table className={`w-full border-collapse text-left ${activeLessonTab === 'lessons' ? 'min-w-[980px]' : 'min-w-[900px]'}`}>
                  <thead>
                    <tr className={`border-b text-[13px] font-black ${isDarkMode ? 'border-gray-800 text-gray-300' : 'border-gray-100 text-[#334155]'}`}>
                      <th className="w-16 px-4 py-4">#</th>
                      <th className="px-4 py-4">Mavzu</th>
                      <th className="w-16 px-4 py-4 text-center">
                        <Users className="mx-auto h-4 w-4 text-gray-500" />
                      </th>
                      <th className="w-16 px-4 py-4 text-center">
                        <Clock3 className="mx-auto h-4 w-4 text-amber-500" />
                      </th>
                      <th className="w-16 px-4 py-4 text-center">
                        <CheckCircle2 className="mx-auto h-4 w-4 text-[#10b981]" />
                      </th>
                      <th className="w-36 px-4 py-4 text-center">Berilgan vaqt</th>
                      <th className="w-36 px-4 py-4 text-center">Tugash vaqti</th>
                      <th className="w-36 px-4 py-4 text-center">Dars sanasi</th>
                      {activeLessonTab === 'lessons' && (
                        <th className="w-28 px-4 py-4 text-right">Amallar</th>
                      )}
                      {activeLessonTab === 'homework' && (
                        <th className="w-36 px-4 py-4 text-right">Topshiriqlar</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => {
                      const givenAt = formatLessonDateTime(row.createdAt);
                      const deadlineAt = formatLessonDateTime(row.deadlineAt);
                      const lessonDate = formatLessonDateTime(row.lessonDate);
                      const studentCount = group.students?.length || row.lesson?.attendances?.length || 0;

                      return (
                        <tr key={`${activeLessonTab}-${row.id}`} className={`border-b text-[14px] font-bold last:border-b-0 ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <td className="px-4 py-4 text-gray-500">{row.lesson?.id || row.id}</td>
                          <td className="px-4 py-4">
                            <div className="max-w-[540px] leading-snug">{row.title || '-'}</div>
                          </td>
                          <td className="px-4 py-4 text-center">{studentCount}</td>
                          <td className="px-4 py-4 text-center">{getAbsentCount(row.lesson)}</td>
                          <td className="px-4 py-4 text-center">{getPresentCount(row.lesson)}</td>
                          <td className="px-4 py-4 text-center">
                            <div>{givenAt.date}</div>
                            {givenAt.time && <div className="mt-1 text-[12px] text-gray-400">{givenAt.time}</div>}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div>{deadlineAt.date}</div>
                            {deadlineAt.time && <div className="mt-1 text-[12px] text-gray-400">{deadlineAt.time}</div>}
                          </td>
                          <td className="px-4 py-4 text-center">{lessonDate.date}</td>
                          {activeLessonTab === 'lessons' && (
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openLessonModal(row.lesson)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6366f1] transition-colors hover:bg-indigo-50 dark:hover:bg-gray-800"
                                  title="Tahrirlash"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(row.lesson)}
                                  disabled={deletingLessonId === row.lesson?.id}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#f43f5e] transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                                  title="O'chirish"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                          {activeLessonTab === 'homework' && (
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  sessionStorage.setItem(`hw_${row.id}`, JSON.stringify({
                                    id: row.id,
                                    title: row.title,
                                    created_at: row.createdAt,
                                    deadline_at: row.deadlineAt,
                                  }));
                                  navigate(`/dashboard/homework/${row.id}/submissions`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Topshiriqlar
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`rounded-xl border py-16 text-center text-[14px] font-bold text-gray-400 ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
                Ma'lumot topilmadi
              </div>
            )
          ) : (
            <div className={`rounded-xl border py-16 text-center text-[14px] font-bold text-gray-400 ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
              Bu bo'lim hali bo'sh
            </div>
          )}
        </div>
      )}

      {homeworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center justify-between border-b p-5 dark:border-gray-800">
              <h3 className="text-[18px] font-black">Uyga vazifa qo'shish</h3>
              <button
                type="button"
                onClick={closeHomeworkModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-gray-400">Dars</label>
                <select
                  value={homeworkForm.lesson_id}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, lesson_id: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] font-bold outline-none ${isDarkMode ? 'border-gray-700 bg-[#111827]' : 'border-gray-100 bg-gray-50'}`}
                >
                  {lessonRows.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>{lesson.topic}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-gray-400">Vazifa mavzusi</label>
                <input
                  type="text"
                  value={homeworkForm.title}
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Uyga vazifa"
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] font-bold outline-none ${isDarkMode ? 'border-gray-700 bg-[#111827]' : 'border-gray-100 bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-gray-400">Fayl</label>
                <input
                  type="file"
                  onChange={(e) => setHomeworkForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className={`w-full rounded-xl border px-4 py-3 text-[13px] font-bold ${isDarkMode ? 'border-gray-700 bg-[#111827]' : 'border-gray-100 bg-gray-50'}`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t p-5 dark:border-gray-800">
              <button
                type="button"
                onClick={closeHomeworkModal}
                disabled={savingHomework}
                className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveHomework}
                disabled={savingHomework}
                className="rounded-xl bg-[#10b981] px-6 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-[#059669] disabled:opacity-50"
              >
                {savingHomework ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center justify-between border-b p-5 dark:border-gray-800">
              <h3 className="text-[18px] font-black">Darsni tahrirlash</h3>
              <button
                type="button"
                onClick={closeLessonModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-gray-400">Mavzu</label>
                <input
                  type="text"
                  value={lessonForm.topic}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Dars mavzusi"
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] font-bold outline-none ${isDarkMode ? 'border-gray-700 bg-[#111827]' : 'border-gray-100 bg-gray-50'}`}
                />
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-black uppercase text-gray-400">Dars sanasi</label>
                <input
                  type="date"
                  value={lessonForm.lesson_date}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, lesson_date: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] font-bold outline-none ${isDarkMode ? 'border-gray-700 bg-[#111827]' : 'border-gray-100 bg-gray-50'}`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t p-5 dark:border-gray-800">
              <button
                type="button"
                onClick={closeLessonModal}
                disabled={savingLesson}
                className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleUpdateLesson}
                disabled={savingLesson}
                className="rounded-xl bg-[#6366f1] px-6 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
              >
                {savingLesson ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
