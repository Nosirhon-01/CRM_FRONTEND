import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Trash2, GraduationCap, X, Plus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGroupExams, createExam, updateExam, deleteExam } from '../services/exams.service';
import { getGroupLessons } from '../services/lessons.service';

const ExamsTab = ({ groupId, isDarkMode, groupStudentsCount }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    lesson_id: '',
    exam_date: new Date().toISOString().slice(0, 16),
    duration_minutes: 60,
    max_score: 100
  });

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, lessonsRes] = await Promise.all([
        getGroupExams(groupId),
        getGroupLessons(groupId)
      ]);
      if (examsRes.success) setExams(examsRes.data);
      if (lessonsRes.success) setLessons(lessonsRes.data);
    } catch (err) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, withTime = true) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const months = ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const dateStr = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    if (!withTime) return dateStr;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return (
      <div className="flex flex-col items-center">
         <span>{dateStr}</span>
         <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{timeStr}</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>Aktiv</span>;
      case 'FINISHED':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>Tugagan</span>;
      default:
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-amber-900/20 text-amber-500 border-amber-800/50' : 'bg-amber-50 text-amber-600 border-amber-200/50'}`}>Kutilmoqda</span>;
    }
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      lesson_id: '',
      exam_date: new Date().toISOString().slice(0, 16),
      duration_minutes: 60,
      max_score: 100
    });
    setEditingExamId(null);
    setModalOpen(true);
  };

  const openEditModal = (exam) => {
    setFormData({
      title: exam.title || '',
      lesson_id: exam.lesson_id || '',
      exam_date: exam.exam_date ? new Date(exam.exam_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      duration_minutes: exam.duration_minutes || 60,
      max_score: exam.max_score || 100
    });
    setEditingExamId(exam.id);
    setOpenMenuId(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.exam_date) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saqlanmoqda...');
    try {
      const payload = {
        title: formData.title,
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : undefined,
        exam_date: new Date(formData.exam_date).toISOString(),
        duration_minutes: parseInt(formData.duration_minutes),
        max_score: parseInt(formData.max_score)
      };

      if (editingExamId) {
        await updateExam(groupId, editingExamId, payload);
        toast.success("Imtihon yangilandi", { id: toastId });
      } else {
        await createExam(groupId, payload);
        toast.success("Yangi imtihon qo'shildi", { id: toastId });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Xatolik yuz berdi', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading('O\'chirilmoqda...');
    try {
      await deleteExam(groupId, examToDelete.id);
      toast.success("Imtihon o'chirildi", { id: toastId });
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("O'chirishda xatolik", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/dashboard/groups/${groupId}/exams/create`)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-5 py-2 text-[13px] font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#059669]"
        >
          <Plus className="w-4 h-4" />
          Yangi imtihon
        </button>
      </div>

      <div className={`rounded-2xl border overflow-x-auto ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        {exams.length > 0 ? (
          <table className="w-full min-w-max">
            <thead>
              <tr className={`border-b text-[13px] font-black ${isDarkMode ? 'bg-[#0f172a] border-gray-800 text-gray-300' : 'bg-[#f8fafc] border-gray-100 text-gray-600'}`}>
                <th className="px-4 py-4 text-left whitespace-nowrap">#</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Mavzu</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  <svg className="w-4 h-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">
                  <X className="w-4 h-4 mx-auto text-red-400" />
                </th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Status</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Dars vaqti</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Berilgan vaqt</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">E'lon qilingan vaqt</th>
                <th className="px-4 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, idx) => (
                <tr
                  key={exam.id}
                  onClick={() => navigate(`/dashboard/groups/${groupId}/exams/${exam.id}`)}
                  className={`cursor-pointer border-b text-[14px] font-medium last:border-b-0 transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <td className={`px-4 py-4 text-[13px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{idx + 1}</td>
                  <td className="px-4 py-4">
                    <span className="text-blue-500 hover:underline font-bold">{exam.title}</span>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-[13px]">{groupStudentsCount}</td>
                  <td className="px-4 py-4 text-center font-bold text-[13px]">0</td>
                  <td className="px-4 py-4 text-center">{getStatusBadge(exam.status)}</td>
                  <td className="px-4 py-4 text-center text-sm">{formatDate(exam.lesson?.lesson_date)}</td>
                  <td className="px-4 py-4 text-center text-sm">{formatDate(exam.created_at)}</td>
                  <td className="px-4 py-4 text-center text-sm">
                    {/* Announcement time is mock here, assuming 3 days ahead as in screenshot approx */}
                    {formatDate(new Date(new Date(exam.created_at).getTime() + 3*24*60*60*1000))}
                  </td>
                  <td className="px-4 py-4 text-center relative">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === exam.id ? null : exam.id); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors mx-auto ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === exam.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                        <div onClick={(e) => e.stopPropagation()} className={`absolute right-14 top-1/2 -translate-y-1/2 w-36 rounded-xl shadow-xl z-50 overflow-hidden border py-1 ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
                           <button onClick={(e) => { e.stopPropagation(); openEditModal(exam); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors border-b ${isDarkMode ? 'border-gray-700/50 text-gray-300 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-gray-50'}`}>
                              <Pencil className="w-4 h-4 text-blue-400" /> Tahrirlash
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); setExamToDelete(exam); setDeleteModalOpen(true); setOpenMenuId(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}>
                              <Trash2 className="w-4 h-4" /> O'chirish
                           </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500 font-medium">Bu guruhda hali imtihonlar yo'q</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
           <div className={`w-full max-w-md rounded-3xl border shadow-2xl ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
             <div className="flex items-center justify-between border-b p-5 dark:border-gray-800">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                     <GraduationCap fill="currentColor" className="w-5 h-5 text-indigo-500" />
                   </div>
                   <h3 className="text-[18px] font-black">{editingExamId ? 'Imtihonni tahrirlash' : 'Yangi imtihon'}</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className={`block mb-2 text-[12px] font-extrabold uppercase tracking-wide px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mavzu nomini kiriting</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Masalan: 1-oy imtihoni"
                    className={`w-full rounded-2xl border px-5 py-3.5 text-[14px] font-bold outline-none transition-all ${
                      isDarkMode 
                        ? 'border-gray-700 bg-[#0f172a] text-white focus:border-indigo-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-indigo-500 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-2 text-[12px] font-extrabold uppercase tracking-wide px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Darsni tanlang (Ixtiyoriy)</label>
                  <select
                    value={formData.lesson_id}
                    onChange={(e) => setFormData({...formData, lesson_id: e.target.value})}
                    className={`w-full rounded-2xl border px-5 py-3.5 text-[14px] font-bold outline-none appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'border-gray-700 bg-[#0f172a] text-white focus:border-indigo-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-indigo-500 focus:bg-white'
                    }`}
                  >
                    <option value="">Darsga ulanmasin</option>
                    {lessons.map(l => (
                       <option key={l.id} value={l.id}>{l.topic}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className={`block mb-2 text-[12px] font-extrabold uppercase tracking-wide px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Boshlanish vaqti</label>
                     <input
                       type="datetime-local"
                       value={formData.exam_date}
                       onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                       className={`w-full rounded-2xl border px-5 py-3.5 text-[14px] font-bold outline-none ${
                        isDarkMode ? 'border-gray-700 bg-[#0f172a] focus:border-indigo-500' : 'border-gray-200 bg-gray-50 focus:border-indigo-500'
                       }`}
                     />
                   </div>
                   <div>
                     <label className={`block mb-2 text-[12px] font-extrabold uppercase tracking-wide px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Davomiylik (daq)</label>
                     <input
                       type="number"
                       value={formData.duration_minutes}
                       onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                       className={`w-full rounded-2xl border px-5 py-3.5 text-[14px] font-bold outline-none ${
                        isDarkMode ? 'border-gray-700 bg-[#0f172a] focus:border-indigo-500' : 'border-gray-200 bg-gray-50 focus:border-indigo-500'
                       }`}
                     />
                   </div>
                </div>

                <div className="pt-2">
                   <button 
                     type="submit" 
                     disabled={saving}
                     className="w-full bg-[#10b981] text-white rounded-2xl py-3.5 text-[15px] font-bold shadow-lg shadow-emerald-500/20 hover:bg-[#059669] transition-all disabled:opacity-50"
                   >
                     {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteModalOpen && examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className={`w-full max-w-sm rounded-[24px] border p-6 text-center shadow-2xl ${isDarkMode ? 'border-gray-800 bg-[#1e293b]' : 'border-gray-100 bg-white'}`}>
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4 dark:bg-red-900/20">
               <Trash2 className="h-8 w-8 text-red-500" />
             </div>
             <h3 className="mb-2 text-[18px] font-black">"{examToDelete.title}" ni o'chirasizmi?</h3>
             <p className={`mb-6 text-[14px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bu amalni ortga qaytarib bo'lmaydi.</p>
             <div className="flex gap-3">
               <button onClick={() => setDeleteModalOpen(false)} disabled={deleting} className={`flex-1 rounded-xl px-4 py-3 text-[14px] font-bold transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>Bekor qilish</button>
               <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-[14px] font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50">O'chirish</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsTab;
