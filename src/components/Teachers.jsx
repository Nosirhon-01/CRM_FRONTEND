import React, { useState, useEffect } from 'react';
import * as teachersService from '../services/teachers.service';
import { getGroups, assignTeacherToGroup } from '../services/groups.service';
import { toast } from 'react-hot-toast';

const Teachers = ({ isDarkMode }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [showAddTeacherSidebar, setShowAddTeacherSidebar] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ fullName: '', phone: '', email: '', password: '', photo: null, group_id: '' });
  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data || []);
    } catch { setGroups([]); }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await teachersService.getAllTeachers();
      setTeachers(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeTeacherSidebar = () => {
    setShowAddTeacherSidebar(false);
    setEditingTeacherId(null);
    setNewTeacher({ fullName: '', phone: '', email: '', password: '', photo: null, group_id: '' });
  };

  const handleEditClick = (teacher) => {
    setEditingTeacherId(teacher.id);
    setNewTeacher({
      fullName: `${teacher.first_name} ${teacher.last_name}`,
      phone: teacher.phone,
      email: teacher.email,
      password: '',
      photo: null,
      group_id: teacher.groups?.[0]?.id || ''
    });
    setShowAddTeacherSidebar(true);
  };

  const handleSaveTeacher = async () => {
    const toastId = toast.loading(editingTeacherId ? "Yangilanmoqda..." : "Yaratilmoqda...");
    try {
      const parts = newTeacher.fullName.trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';

      const formData = new FormData();
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('phone', newTeacher.phone);
      if (newTeacher.email) formData.append('email', newTeacher.email);
      else formData.append('email', 'no-email@example.com');
      
      if (newTeacher.password) formData.append('password', newTeacher.password);
      
      formData.append('address', 'Toshkent');
      if (newTeacher.group_id) formData.append('group_id', newTeacher.group_id);
      if (newTeacher.photo) formData.append('photo', newTeacher.photo);

      if (editingTeacherId) {
        await teachersService.updateTeacher(editingTeacherId, formData);
        toast.success("O'qituvchi muvaffaqiyatli saqlandi", { id: toastId });
      } else {
        await teachersService.createTeacher(formData);
        toast.success("O'qituvchi muvaffaqiyatli yaratildi", { id: toastId });
      }
      await fetchTeachers();
      closeTeacherSidebar();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(error?.response?.data?.message || "Saqlashda xatolik yuz berdi", { id: toastId });
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
      await teachersService.deleteTeacher(id);
      toast.success("O'qituvchi muvaffaqiyatli o'chirildi");
      setTeachers(prev => {
        const nextList = prev.filter(t => t.id !== id);
        return nextList;
      });
      
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('O\'chirishda xatolik yuz berdi.');
    }
  };

  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = teachers.slice(indexOfFirstItem, indexOfLastItem);

  const txt = isDarkMode ? 'text-white' : 'text-[#1e2a4a]';
  const sub = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const getPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>O'qituvchilar</h2>
          <p className="mt-2 text-sm font-medium text-gray-500">Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz.</p>
        </div>
        <div className="flex gap-3">
          <button className={`px-4 py-2 ${isDarkMode ? 'bg-[#1e293b] border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700'} border rounded-xl text-[14px] font-semibold flex items-center gap-2 hover:shadow-sm transition-all`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Export
          </button>
          <button onClick={() => setShowAddTeacherSidebar(true)} className="px-4 py-2 bg-[#6366f1] text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-[#4f46e5] flex items-center gap-2 transition-all">
            <span>+</span> O'qituvchi qo'shish
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <button className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-[14px] font-medium transition-colors ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-gray-300 hover:bg-[#334155]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Filters
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex items-center px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200'}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search" className={`ml-2 outline-none bg-transparent text-[14px] w-48 ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`} />
            </div>
            <button className={`text-[14px] font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
              Arxiv
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[12px] font-semibold text-gray-400 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <th className="pb-3 pl-2 w-10">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="pb-3 px-4 min-w-[200px]">Nomi ↓</th>
                <th className="pb-3 px-4 min-w-[150px]">Guruh</th>
                <th className="pb-3 px-4 min-w-[150px]">Telefon raqamlari</th>
                <th className="pb-3 px-4 min-w-[150px]">Tug'ilgan sanasi</th>
                <th className="pb-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-500 cursor-default font-medium">Yuklanmoqda...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-500 cursor-default font-medium">Ma'lumot topilmadi</td></tr>
              ) : (
                currentItems.map((teacher) => (
                  <tr key={teacher.id} className={`border-b last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-[#334155]/20 transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-[#1e2a4a]'}`}>
                    <td className="py-4 pl-2">
                       <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200">
                           <img src={teacher.photo ? `http://localhost:3000/files/${teacher.photo}` : `https://ui-avatars.com/api/?name=${teacher.first_name}+${teacher.last_name}&background=random&color=fff`} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <span className={`font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{teacher.first_name} {teacher.last_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {teacher.groups && teacher.groups.length > 0 ? (
                          teacher.groups.map(g => (
                            <span key={g.id} className={`px-2 py-0.5 rounded text-[11px] font-medium ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>{g.name}</span>
                          ))
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${isDarkMode ? 'bg-[#334155] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Yo'q</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">{teacher.phone}</td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">-</td>
                    <td className="py-4 px-4">
                       <div className="flex items-center gap-2 justify-end opacity-60 hover:opacity-100 transition-opacity">
                         <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                         <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></button>
                         <button onClick={() => handleDeleteTeacher(teacher.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                         <button onClick={() => handleEditClick(teacher)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4 dark:border-gray-700 border-gray-100">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`px-4 py-2 text-[14px] font-semibold border rounded-xl flex items-center gap-2 transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'} ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Previous
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${currentPage === num ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#334155]'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`px-4 py-2 text-[14px] font-semibold border rounded-xl flex items-center gap-2 transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'} ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl transition-transform duration-300 ${showAddTeacherSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between dark:border-gray-700 border-gray-100`}>
          <h2 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{editingTeacherId ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}</h2>
          <button onClick={closeTeacherSidebar} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Telefon raqam *</label><input type="text" placeholder="+998" value={newTeacher.phone} onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Mail</label><input type="email" placeholder="Elektron pochtani kiriting" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>O'qituvchi FIO *</label><input type="text" placeholder="Ma'lumotni kiriting" value={newTeacher.fullName} onChange={(e) => setNewTeacher({...newTeacher, fullName: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Parol qo'shish {editingTeacherId ? '' : '*'}</label><input type="password" placeholder={editingTeacherId ? "Yangi parolni kiriting (majburiy emas)" : "Parolni kiriting"} value={newTeacher.password} onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div><label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Surati (Avatar)</label><input type="file" accept="image/*" onChange={(e) => setNewTeacher({...newTeacher, photo: e.target.files[0]})} className={`w-full px-4 py-2 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} /></div>
          <div>
            <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Guruhni tanlang</label>
            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between text-[14px] transition-all hover:border-indigo-300 ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              {newTeacher.group_id ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <span className="font-semibold">{groups.find(g => g.id === +newTeacher.group_id)?.name}</span>
                </div>
              ) : (
                <span className="text-gray-400 font-medium">Guruh tanlanmagan</span>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>
        <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3 absolute bottom-0 w-full bg-white dark:bg-[#1e293b]">
          <button onClick={closeTeacherSidebar} className="px-5 py-2.5 text-gray-600">Bekor qilish</button>
          <button onClick={handleSaveTeacher} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Saqlash</button>
        </div>
      </div>
      {showAddTeacherSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={closeTeacherSidebar} />}

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
              <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
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
                    setNewTeacher({...newTeacher, group_id: g.id});
                    setShowGroupModal(false);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors ${+newTeacher.group_id === g.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-[#334155]'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${txt}`}>{g.name}</p>
                    <p className="text-xs text-gray-500">{g.course?.name || 'Kurs nomi yo\'q'}</p>
                  </div>
                  {+newTeacher.group_id === g.id && (
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

export default Teachers;
