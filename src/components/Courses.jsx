import { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../services/courses.service';

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0 mln';
  return `${new Intl.NumberFormat('uz-UZ').format(numericValue)} mln`;
};

const CourseCard = ({ course, index, isDarkMode, onDelete, onEdit }) => {
  const courseCardStyles = [
    'bg-[#f0f5ff] border-[#e0ebff]', // Blueish
    'bg-[#f5f0ff] border-[#ebdcf5]', // Purple-ish
    'bg-[#fff7e6] border-[#ffecd1]', // Orange-ish
    'bg-[#ebfbf5] border-[#d1f4e5]', // Greenish
    'bg-[#f0f9ff] border-[#e0f2fe]', // Light blue
  ];

  return (
    <div className={`rounded-xl border p-5 transition-all w-full ${isDarkMode ? 'bg-[#162033] border-gray-700' : courseCardStyles[index % courseCardStyles.length]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{course.name}</h4>
          <p className={`mt-2 line-clamp-2 text-sm leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {course.description || 'A little about the company and the team that you\'ll be working with. A little about the company...'}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-1 w-16">
          <button onClick={onDelete} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-500 hover:bg-white/50 hover:text-red-500'}`} aria-label="O'chirish">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button onClick={onEdit} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-500 hover:bg-white/50 hover:text-indigo-600'}`} aria-label="Tahrirlash">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-white text-gray-700 shadow-sm border border-black/5'}`}>{course.duration_hours || 90} min</span>
        <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-white text-gray-700 shadow-sm border border-black/5'}`}>{course.duration_month || 3} oy</span>
        <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${isDarkMode ? 'bg-[#0f172a] text-gray-300' : 'bg-white text-gray-700 shadow-sm border border-black/5'}`}>{formatPrice(course.price)}</span>
      </div>
    </div>
  );
};

export const Courses = ({ isDarkMode }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Filial 1');
  
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', description: '', price: '', duration_hours: 90, duration_month: 3, level: 'beginner' });
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((course) => course.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const closeSidebar = () => {
    setShowAddSidebar(false);
    setEditingCourse(null);
    setNewCourse({ name: '', description: '', price: '', duration_hours: 90, duration_month: 3, level: 'beginner' });
  };

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.price || !newCourse.level) return;
    try {
      const payload = {
        name: newCourse.name,
        description: newCourse.description,
        price: Number(newCourse.price),
        duration_hours: Number(newCourse.duration_hours),
        duration_month: Number(newCourse.duration_month),
        level: newCourse.level
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }

      await fetchCourses();
      closeSidebar();
    } catch (err) {
      console.error('Create/Update error:', err);
    }
  };

  const openEditSidebar = (course) => {
    setEditingCourse(course);
    setNewCourse({
      name: course.name,
      description: course.description || '',
      price: course.price,
      duration_hours: course.duration_hours,
      duration_month: course.duration_month,
      level: course.level || 'beginner'
    });
    setShowAddSidebar(true);
  };

  if (loading) return <div className="p-4">Yuklanmoqda...</div>;

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Kurslar</h2>
        <button
          onClick={() => setShowAddSidebar(true)}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all"
        >
          <span>+</span> Kurslar qoshish
        </button>
      </div>

      <div className="flex gap-2 mb-6 border rounded-xl w-fit p-1 bg-white shadow-sm dark:bg-transparent dark:border-gray-700">
        {['Filial 1', 'Filial 2', 'Arxiv'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${activeTab === tab ? 'bg-white shadow border border-gray-100 text-[#1e2a4a] dark:bg-[#334155] dark:text-white dark:border-none' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Filial 1' ? (
        <div className="flex items-center justify-center p-10 mt-10 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">{activeTab} uchun ma'lumot yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              isDarkMode={isDarkMode}
              onDelete={() => handleDelete(course.id)}
              onEdit={() => openEditSidebar(course)}
            />
          ))}
        </div>
      )}

      {/* Add Course Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] shadow-2xl transition-transform duration-300 ${showAddSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{editingCourse ? 'Kursni tahrirlash' : 'Kurs qo\'shish'}</h2>
          <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100vh-140px)]">
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Nomi *</label><input type="text" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Tavsif</label><textarea value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} rows="3" className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`}></textarea></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Narxi (so'm) *</label><input type="number" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Dars vaqti (minut)</label><input type="number" value={newCourse.duration_hours} onChange={(e) => setNewCourse({...newCourse, duration_hours: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
            <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Kurs muddati (oy)</label><input type="number" value={newCourse.duration_month} onChange={(e) => setNewCourse({...newCourse, duration_month: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          </div>
          <div>
            <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Kurs darajasi *</label>
            <select value={newCourse.level} onChange={(e) => setNewCourse({...newCourse, level: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
              <option value="beginner">Boshlang'ich (Beginner)</option>
              <option value="intermediate">O'rta (Intermediate)</option>
              <option value="advanced">Kuchli (Advanced)</option>
            </select>
          </div>
        </div>
        <div className={`p-6 border-t absolute bottom-0 w-full flex justify-end space-x-3 bg-white dark:bg-[#1e293b] ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={closeSidebar} className="px-5 py-2.5 text-gray-600 font-medium">Bekor qilish</button>
          <button onClick={handleCreateCourse} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">{editingCourse ? 'Saqlash' : 'Qo\'shish'}</button>
        </div>
      </div>
      {showAddSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={closeSidebar} />}
    </div>
  );
};
