import React, { useState, useEffect } from 'react';
import studentService from '../services/students.service';
import { getGroups } from '../services/groups.service';
import { toast } from 'react-hot-toast';

const Students = ({ isDarkMode }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  
  const [totalCount, setTotalCount] = useState(0);

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '', 
    password: '', address: '', birth_date: '', photo: null,
    group_id: '',
    gender: 'male'
  });
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');

  const txt = isDarkMode ? 'text-white' : 'text-[#1e2a4a]';
  const sub = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data || []);
    } catch { setGroups([]); }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAllStudents();
      if (res.success) {
        setStudents(res.data || []);
        setTotalCount(res.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.email || !form.birth_date || !form.address || (!editingId && !form.password)) {
      toast.error("Majburiy maydonlarni to'ldiring");
      return;
    }
    const toastId = toast.loading(editingId ? "Yangilanmoqda..." : "Yaratilmoqda...");
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      if (editingId) {
        await studentService.updateStudent(editingId, formData);
        toast.success("Muvaffaqiyatli saqlandi", { id: toastId });
      } else {
        await studentService.createStudent(formData);
        toast.success("Muvaffaqiyatli yaratildi", { id: toastId });
      }
      await fetchStudents();
      closeSidebar();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error?.message || "Saqlashda xatolik yuz berdi", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await studentService.deleteStudent(id);
      toast.success("Talaba o'chirildi");
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleCoin = async (id, amount) => {
    try {
      await studentService.updateStudentCoin(id, amount);
      toast.success(`Coin ${amount > 0 ? 'qo\'shildi' : 'ayirildi'}`);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, coin: (s.coin || 0) + amount } : s));
    } catch {
      toast.error("Coin yangilashda xatolik");
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingId(null);
    setForm({ 
        first_name: '', last_name: '', phone: '', email: '', 
        password: '', address: '', birth_date: '', photo: null,
        group_id: '',
        gender: 'male'
    });
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      phone: student.phone,
      email: student.email,
      password: '',
      address: student.address || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
      photo: null,
      group_id: student.groups?.[0]?.id || '',
      gender: student.gender || 'male'
    });
    setShowSidebar(true);
  };

  // const totalPages = Math.ceil(totalCount / 10) || 1; // itemsPerPage was undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${txt}`}>Talabalar</h2>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz.
          </p>
        </div>
        <div className="flex gap-3">
          <button className={`px-4 py-2 border rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:shadow-sm transition-all ${isDarkMode ? 'bg-[#1e293b] border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Export
          </button>
          <button onClick={() => { closeSidebar(); setShowSidebar(true); }} className="px-4 py-2 bg-[#6366f1] text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all">
            <span>+</span> Qo'shish
          </button>
          <button className="px-4 py-2 bg-[#10b981] text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#059669] flex items-center gap-2 transition-all">
            <span>+</span> Talabani Excel dan qo'shish
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <button className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[13px] font-medium transition-colors ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Filters
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search" className={`ml-2 outline-none bg-transparent text-[13px] w-48 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 border-gray-100">
                <th className="pb-3 pl-2 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="pb-3 px-4">Nomi ↓</th>
                <th className="pb-3 px-4">Guruh</th>
                <th className="pb-3 px-4">Telefon raqamlari</th>
                <th className="pb-3 px-4 text-center">Tug'ilgan sanasi</th>
                <th className="pb-3 px-4 text-center">Yaratilgan sana</th>
                <th className="pb-3 px-4 text-center">Coin</th>
                <th className="pb-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr><td colSpan="8" className="py-10 text-center text-gray-400">Yuklanmoqda...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="8" className="py-10 text-center text-gray-400">Talabalar topilmadi</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className={`border-b last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-[#334155]/20 transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-[#1e2a4a]'}`}>
                    <td className="py-4 pl-2"><input type="checkbox" className="rounded" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex-shrink-0">
                          <img 
                            src={s.photo ? `http://localhost:3000/files/${s.photo}` : `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random&color=fff`} 
                            className="w-full h-full object-cover" alt="" 
                          />
                        </div>
                        <span className="font-bold whitespace-nowrap">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {s.groups?.map(g => (
                          <span key={g.id} className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>{g.name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 font-medium">{s.phone}</td>
                    <td className="py-4 px-4 text-center text-gray-500 whitespace-nowrap">
                      {s.birth_date ? new Date(s.birth_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500 whitespace-nowrap">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-4 px-4 font-bold text-center">
                       <span className="flex items-center justify-center gap-1">
                         <span className="text-yellow-500 text-[10px]">●</span>
                         {s.coin || 0}
                       </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 justify-end opacity-60 hover:opacity-100">
                         <button onClick={() => handleCoin(s.id, -5)} className="p-1 px-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Minus coin">-</button>
                         <button onClick={() => handleCoin(s.id, 5)} className="p-1 px-2 text-green-500 hover:bg-green-50 rounded transition-colors" title="Plus coin">+</button>
                         <button className="p-1.5 text-gray-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                         <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                         <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination removed as per request to see all students at once */}
      </div>

      {/* Sidebar Form */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] shadow-2xl transition-transform duration-300 ${showSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className="p-6 border-b flex items-center justify-between dark:border-gray-700 border-gray-100">
           <div>
             <h2 className={`text-[17px] font-bold ${txt}`}>Talaba qoshish</h2>
             <p className="text-[11px] text-gray-400">Bu yerda siz yangi Talaba qo'shishingiz mumkin.</p>
           </div>
           <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto h-[calc(100vh-140px)] custom-scrollbar pb-24">
           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Telefon raqam *</label>
             <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
               <input type="text" placeholder="+998" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-transparent outline-none text-[13px]" />
             </div>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Mail *</label>
             <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
               <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
               <input type="email" placeholder="Elektron pochtani kiriting" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-transparent outline-none text-[13px]" />
             </div>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Talaba FIO *</label>
             <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
               <input type="text" placeholder="Ma'lumotni kiriting" value={`${form.first_name} ${form.last_name}`.trim()} onChange={e => {
                 const parts = e.target.value.split(' ');
                 setForm({...form, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || ''});
               }} className="w-full bg-transparent outline-none text-[13px]" />
             </div>
           </div>

           {!editingId && (
             <div>
               <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Parol *</label>
               <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
             </div>
           )}

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Tug'ilgan sanasi *</label>
             <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
               <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
               <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className="w-full bg-transparent outline-none text-[13px] text-gray-400" />
             </div>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Manzil *</label>
             <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
               <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s7-4.438 7-11a7 7 0 10-14 0c0 6.562 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
               <input type="text" placeholder="Manzilni kiriting" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-transparent outline-none text-[13px]" />
             </div>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Guruh</label>
             <button
               type="button"
               onClick={() => setShowGroupModal(true)}
               className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between text-[13px] transition-all hover:border-indigo-300 ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
             >
               <div className="flex items-center gap-2 overflow-hidden">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                 {form.group_id ? (
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] font-bold border dark:border-gray-700 flex items-center gap-1">
                      {groups.find(g => g.id === +form.group_id)?.name}
                      <span className="text-[9px]">✕</span>
                    </span>
                 ) : (
                   <span className="text-gray-400">Guruh tanlanmagan</span>
                 )}
               </div>
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
             </button>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Jinsi</label>
             <div className="flex gap-6">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="gender" value="male" checked={form.gender !== 'female'} onChange={e => setForm({...form, gender: e.target.value})} className="w-4 h-4 text-indigo-600" />
                 <span className="text-[13px] font-medium text-gray-500">Erkak</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={e => setForm({...form, gender: e.target.value})} className="w-4 h-4 text-indigo-600" />
                 <span className="text-[13px] font-medium text-gray-500">Ayol</span>
               </label>
             </div>
           </div>

           <div>
             <label className={`block text-[12px] font-bold mb-2 ${txt}`}>Surati</label>
             <div className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-colors ${isDarkMode ? 'border-gray-700 bg-[#0f172a] hover:bg-[#1e293b]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
               <input type="file" onChange={e => setForm({...form, photo: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-2 text-gray-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
               </div>
               <p className="text-[11px] font-bold text-indigo-600">Click to upload <span className="text-gray-400">or drag and drop</span></p>
               <p className="text-[9px] text-gray-400 mt-1">JPG or PNG (max. 2 mb)</p>
             </div>
           </div>

           <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 border-gray-100 opacity-60">
             <div className="flex gap-4">
               {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700" />)}
             </div>
           </div>
        </div>
        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 absolute bottom-0 w-full bg-inherit">
           <button onClick={closeSidebar} className="px-5 py-2.5 font-bold text-gray-500 text-[13px]">Bekor qilish</button>
           <button onClick={handleSave} className="px-8 py-2.5 bg-[#f1f3f9] dark:bg-gray-800 text-gray-400 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-[13px]">Saqlash</button>
        </div>
      </div>
      {showSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={closeSidebar} />}

      {/* Group Selection Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGroupModal(false)} />
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="p-6 border-b dark:border-gray-700 border-gray-100 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${txt}`}>Guruhni tanlang</h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 border-b dark:border-gray-700 border-gray-100">
              <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  placeholder="Guruh nomi bo'yicha qidirish..." 
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())).map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setForm({...form, group_id: g.id});
                    setShowGroupModal(false);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors ${+form.group_id === g.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${txt}`}>{g.name}</p>
                    <p className="text-xs text-gray-500">{g.course?.name || 'Kurs nomi yo\'q'}</p>
                  </div>
                  {+form.group_id === g.id && (
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
    </div>
  );
};

export default Students;
