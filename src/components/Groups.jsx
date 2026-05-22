import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroups, createGroup, deleteGroup, toggleGroupStatus, updateGroup } from '../services/groups.service';
import { toast } from 'react-hot-toast';
import * as teachersService from '../services/teachers.service';
import * as coursesService from '../services/courses.service';
import * as studentsService from '../services/students.service';

const API_URL = 'http://localhost:3000/api/v1';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const WEEK_DAYS = [
  { value: 'MONDAY',    label: 'Du' },
  { value: 'TUESDAY',   label: 'Se' },
  { value: 'WEDNESDAY', label: 'Chor' },
  { value: 'THURSDAY',  label: 'Pay' },
  { value: 'FRIDAY',    label: 'Ju' },
  { value: 'SATURDAY',  label: 'Shan' },
  { value: 'SUNDAY',    label: 'Yak' },
];

const Groups = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [form, setForm] = useState({
    name: '', course_id: '', teacher_id: '', room_id: '',
    start_date: '', start_time: '', max_student: '', week_day: [],
    student_ids: []
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch groups
      try {
        const gData = await getGroups();
        setGroups(gData || []);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
        setGroups([]);
      }

      // Fetch teachers
      try {
        const tData = await teachersService.getAllTeachers();
        setTeachers(Array.isArray(tData) ? tData : tData?.data || []);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
        setTeachers([]);
      }

      // Fetch students
      try {
        const sRes = await studentsService.getAllStudents();
        setAllStudents(sRes?.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setAllStudents([]);
      }

      // courses
      try {
        const cRes = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
        const cJson = await cRes.json();
        setCourses(Array.isArray(cJson) ? cJson : cJson?.data || []);
      } catch { setCourses([]); }

      // rooms
      try {
        const rRes = await fetch(`${API_URL}/rooms`, { headers: getHeaders() });
        const rJson = await rRes.json();
        setRooms(Array.isArray(rJson) ? rJson : rJson?.data || []);
      } catch { setRooms([]); }
    } catch (err) {
      console.error('Global fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingGroupId(null);
    setSaveError('');
    setForm({ name: '', course_id: '', teacher_id: '', room_id: '', start_date: '', start_time: '', max_student: '', week_day: [], student_ids: [] });
  };

  const toggleWeekDay = (day) => {
    setForm(f => ({
      ...f,
      week_day: f.week_day.includes(day) ? f.week_day.filter(d => d !== day) : [...f.week_day, day]
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.course_id || !form.teacher_id || !form.room_id || !form.start_date || !form.start_time || !form.max_student) {
      toast.error("Barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    const toastId = toast.loading("Saqlanmoqda...");
    try {
      const payload = {
        name: form.name,
        course_id: +form.course_id,
        teacher_id: +form.teacher_id,
        room_id: +form.room_id,
        start_date: form.start_date,
        start_time: form.start_time,
        max_student: +form.max_student,
        week_day: form.week_day,
        student_ids: form.student_ids
      };

      let res;
      if (editingGroupId) {
        res = await updateGroup(editingGroupId, payload);
      } else {
        res = await createGroup(payload);
      }
      
      if (res.success) {
        toast.success(editingGroupId ? "Guruh muvaffaqiyatli tahrirlandi" : "Guruh muvaffaqiyatli yaratildi", { id: toastId });
        await fetchAll();
        closeSidebar();
      } else {
        toast.error(res.message || "Xatolik yuz berdi", { id: toastId });
      }
    } catch (e) {
      toast.error(e?.message || "Saqlashda xatolik yuz berdi", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Guruhni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`${API_URL}/groups/${id}/deactivate`, { method: 'PATCH', headers: getHeaders() });
      if (!res.ok) throw new Error();
      toast.success("Guruh muvaffaqiyatli o'chirildi");
      setGroups(prev => prev.map(g => g.id === id ? { ...g, status: 'inactive' } : g));
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleGroupStatus(id);
      if (res.success) {
        toast.success(`Guruh ${res.data.status === 'active' ? 'faollashtirildi' : 'faolsizlantirildi'}`);
        setGroups(prev => prev.map(g => g.id === id ? { ...g, status: res.data.status } : g));
      }
    } catch {
      toast.error("Statusni o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleEditClick = async (group) => {
    setEditingGroupId(group.id);
    setForm({
      name: group.name || '',
      course_id: group.courses?.id || '',
      teacher_id: group.teachers?.id || '',
      room_id: group.rooms?.id || '',
      start_date: group.start_date ? new Date(group.start_date).toISOString().split('T')[0] : '',
      start_time: group.start_time || '',
      max_student: group.max_student || '',
      week_day: group.week_day || [],
      // For students, we might need to fetch them if not already in the group object
      // But usually group object has basic info. Let's try to get current student_ids.
      student_ids: group.students?.map(s => s.id) || []
    });
    
    // If students are not in the 'group' object, we might need a separate fetch
    if (!group.students) {
       try {
         const res = await fetch(`${API_URL}/groups/one/students/${group.id}`, { headers: getHeaders() });
         const json = await res.json();
         if (json.success) {
           setForm(f => ({ ...f, student_ids: json.data.map(s => s.id) }));
         }
       } catch (e) { console.error("Failed to fetch group students", e); }
    }
    
    setShowSidebar(true);
  };

  // stats
  const totalGroups   = groups.length;
  const totalTeachers = [...new Set(groups.map(g => g.teachers?.id).filter(Boolean))].length;
  const totalStudents = groups.reduce((acc, g) => acc + (g.max_student || 0), 0);

  // pagination
  const totalPages      = Math.ceil(groups.length / itemsPerPage);
  const indexOfLast     = currentPage * itemsPerPage;
  const indexOfFirst    = indexOfLast - itemsPerPage;
  const currentItems    = groups.slice(indexOfFirst, indexOfLast);

  const weekDayLabel = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return '-';
    return arr.map(d => WEEK_DAYS.find(w => w.value === d)?.label || d).join(', ');
  };

  const courseColor = (courseName) => {
    const colors = {
      english: 'bg-blue-100 text-blue-700',
      math:    'bg-purple-100 text-purple-700',
      sat:     'bg-orange-100 text-orange-700',
      ielts:   'bg-green-100 text-green-700',
    };
    const key = (courseName || '').toLowerCase();
    for (const k of Object.keys(colors)) {
      if (key.includes(k)) return colors[k];
    }
    return 'bg-gray-100 text-gray-600';
  };

  const card = isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100';
  const txt  = isDarkMode ? 'text-white' : 'text-[#1e2a4a]';
  const sub  = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-3xl font-bold ${txt}`}>Guruhlar</h2>
        <button
          onClick={() => setShowSidebar(true)}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all"
        >
          <span>+</span> Guruh qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b dark:border-gray-700 border-gray-200">
        <button className="pb-2 text-[14px] font-semibold border-b-2 border-indigo-600 text-indigo-600">Guruhlar</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>, label: 'Jami guruhlar', value: totalGroups },
          { icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>, label: "O'qituvchilar", value: totalTeachers },
          { icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>, label: "O'quvchilar", value: totalStudents },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border shadow-sm ${card}`}>
            <div className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{s.icon}</div>
            <p className={`text-sm font-medium mb-1 ${sub}`}>{s.label}</p>
            <p className={`text-3xl font-bold ${txt}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border shadow-sm ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[12px] font-semibold text-gray-400 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Guruh</th>
                <th className="py-3 px-4">Kurs</th>
                <th className="py-3 px-4">Davomiyligi</th>
                <th className="py-3 px-4">Dars vaqti</th>
                <th className="py-3 px-4">Xona</th>
                <th className="py-3 px-4">O'qituvchi</th>
                <th className="py-3 px-4">Talabalar</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr><td colSpan="10" className="py-10 text-center text-gray-400">Yuklanmoqda...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="10" className="py-10 text-center text-gray-400">Guruhlar topilmadi</td></tr>
              ) : (
                currentItems.map(group => (
                  <tr 
                    key={group.id} 
                    onClick={() => {
                      navigate(`/dashboard/groups/${group.id}`);
                    }}
                    className={`border-b last:border-b-0 transition-all cursor-pointer ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#334155]/20' : 'border-gray-100 text-[#1e2a4a] hover:bg-gray-50/50'}`}
                  >
                    {/* Status toggle */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(group.id);
                          }}
                          className={`relative inline-flex items-center cursor-pointer transition-all duration-300 w-9 h-5 rounded-full ${group.status === 'active' ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${group.status === 'active' ? 'translate-x-4.5 left-0' : 'translate-x-0.5 left-0'}`}></div>
                        </div>
                        <span className={`text-[11px] font-bold uppercase transition-colors duration-300 ${group.status === 'active' ? 'text-indigo-500' : 'text-gray-400'}`}>
                          {group.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    {/* Name */}
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">{group.name}</td>
                    {/* Course */}
                    <td className="py-3 px-4">
                      {group.courses?.name ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${courseColor(group.courses.name)}`}>
                          {group.courses.name}
                        </span>
                      ) : '-'}
                    </td>
                    {/* Davomiyligi */}
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      <div className="text-[13px] font-medium">
                        {group.start_date ? new Date(group.start_date).toLocaleDateString('ru-RU') : '-'}
                      </div>
                    </td>
                    {/* Dars vaqti */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold">{group.start_time || '-'}</div>
                      <div className={`text-[11px] ${sub}`}>{weekDayLabel(group.week_day)}</div>
                    </td>
                    {/* Xona */}
                    <td className="py-3 px-4 whitespace-nowrap">{group.rooms?.name || '-'}</td>
                    {/* O'qituvchi */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {group.teachers?.first_name ? (
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {group.teachers.first_name[0]}
                          </span>
                          {group.teachers.first_name}
                        </span>
                      ) : <span className={sub}>O'qituvchi yo'q</span>}
                    </td>
                    {/* Talabalar */}
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${txt}`}>{group.max_student ?? '-'}</span>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditClick(group)}
                          className="p-1 text-gray-300 hover:text-indigo-500 transition-colors"
                          title="Tahrirlash"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          title="O'chirish"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`mt-2 flex items-center justify-between border-t px-6 py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className={`px-4 py-2 text-[14px] font-semibold border rounded-xl flex items-center gap-2 transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${currentPage === num ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {num}
                </button>
              ))}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className={`px-4 py-2 text-[14px] font-semibold border rounded-xl flex items-center gap-2 transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Add Group Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] shadow-2xl transition-transform duration-300 ${showSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-[17px] font-bold ${txt}`}>{editingGroupId ? "Guruhni tahrirlash" : "Guruh qo'shish"}</h2>
          <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100vh-140px)]">
          {saveError && <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm">{saveError}</div>}

          {[
            { label: "Guruh nomi *", key: 'name', type: 'text', placeholder: "Guruh nomini kiriting" },
            { label: "Boshlanish sanasi *", key: 'start_date', type: 'date', placeholder: "" },
            { label: "Dars vaqti *", key: 'start_time', type: 'time', placeholder: "" },
            { label: "Maksimal talabalar *", key: 'max_student', type: 'number', placeholder: "20" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-[14px] ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
          ))}

          {/* Week Days */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Dars kunlari *</label>
            <div className="grid grid-cols-4 gap-2">
              {WEEK_DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekDay(day.value)}
                  className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${
                    form.week_day.includes(day.value)
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : isDarkMode ? 'bg-[#0f172a] border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Kurs *</label>
            <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-[14px] ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
              <option value="">Kursni tanlang</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>O'qituvchi *</label>
            <button
              type="button"
              onClick={() => setShowTeacherModal(true)}
              className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between text-[14px] transition-all hover:border-indigo-300 ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              {form.teacher_id ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100">
                    <img 
                      src={teachers.find(t => t.id === +form.teacher_id)?.photo ? `http://localhost:3000/files/${teachers.find(t => t.id === +form.teacher_id).photo}` : `https://ui-avatars.com/api/?name=${teachers.find(t => t.id === +form.teacher_id)?.first_name}+${teachers.find(t => t.id === +form.teacher_id)?.last_name}&background=random&color=fff`} 
                      className="w-full h-full object-cover" alt="" 
                    />
                  </div>
                  <span className="font-semibold">{teachers.find(t => t.id === +form.teacher_id)?.first_name} {teachers.find(t => t.id === +form.teacher_id)?.last_name}</span>
                </div>
              ) : (
                <span className="text-gray-400 font-medium">O'qituvchini tanlang</span>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>

          {/* Room */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Xona *</label>
            <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-[14px] ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
              <option value="">Xonani tanlang</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Students selection */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Talabalar biriktirish</label>
            <button
              type="button"
              onClick={() => setShowStudentModal(true)}
              className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between text-[14px] transition-all hover:border-indigo-300 ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <span className="font-semibold text-[13px]">
                  {form.student_ids.length > 0 ? `${form.student_ids.length} ta talaba tanlandi` : "Talabalarni tanlang"}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {form.student_ids.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.student_ids.slice(0, 3).map(id => {
                  const s = allStudents.find(x => x.id === id);
                  return s ? (
                    <span key={id} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[11px] rounded-lg border border-indigo-100 dark:border-indigo-800">
                      {s.first_name}
                    </span>
                  ) : null;
                })}
                {form.student_ids.length > 3 && (
                  <span className="text-[11px] text-gray-400 self-center">+{form.student_ids.length - 3} yana</span>
                )}
              </div>
            )}
          </div>
          <div className="h-20"></div> {/* Extra spacing at the bottom for scrolling */}
        </div>
        <div className={`p-6 border-t flex justify-end gap-3 absolute bottom-0 w-full ${isDarkMode ? 'border-gray-700 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
          <button onClick={closeSidebar} className="px-5 py-2.5 text-gray-500 font-medium">Bekor qilish</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
      {showSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={closeSidebar} />}

      {/* Teacher Selection Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTeacherModal(false)} />
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6 border-b dark:border-gray-700 border-gray-100 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${txt}`}>O'qituvchini tanlang</h3>
              <button onClick={() => setShowTeacherModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 border-b dark:border-gray-700 border-gray-100">
              <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  placeholder="Ism bo'yicha qidirish..." 
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {teachers.filter(t => `${t.first_name} ${t.last_name}`.toLowerCase().includes(teacherSearch.toLowerCase())).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setForm({...form, teacher_id: t.id});
                    setShowTeacherModal(false);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors ${+form.teacher_id === t.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200">
                    <img src={t.photo ? `http://localhost:3000/files/${t.photo}` : `https://ui-avatars.com/api/?name=${t.first_name}+${t.last_name}&background=random&color=fff`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${txt}`}>{t.first_name} {t.last_name}</p>
                    <p className="text-xs text-gray-500">{t.phone}</p>
                  </div>
                  {+form.teacher_id === t.id && (
                    <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Selection Modal (Multi-select) */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowStudentModal(false)} />
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6 border-b dark:border-gray-700 border-gray-100 flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${txt}`}>Talabalarni tanlang</h3>
                <p className="text-xs text-gray-400 mt-1">{form.student_ids.length} ta tanlandi</p>
              </div>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 border-b dark:border-gray-700 border-gray-100">
              <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  placeholder="Talabani qidirish..." 
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {allStudents.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase())).map(s => {
                const isSelected = form.student_ids.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        student_ids: isSelected ? f.student_ids.filter(id => id !== s.id) : [...f.student_ids, s.id]
                      }));
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200">
                      <img src={s.photo ? `http://localhost:3000/files/${s.photo}` : `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random&color=fff`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${txt}`}>{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-gray-500">{s.phone}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t dark:border-gray-700 border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowStudentModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                Tayyor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
