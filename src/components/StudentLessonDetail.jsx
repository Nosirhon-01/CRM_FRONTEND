import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { getMediaUrl } from '../utils/media-url';

const StudentLessonDetail = ({ isDarkMode }) => {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchLessons = () => {
    setLoading(true);
    return apiClient.get(`/lessons/my/group/${groupId}`)
      .then(res => {
        if (res.data?.data) {
          setLessons(res.data.data);
          const current = res.data.data.find(l => l.id === parseInt(lessonId, 10));
          setActiveLesson(current);
          if (current && current.videos && current.videos.length > 0) {
            setActiveVideo(current.videos[0]);
          } else {
            setActiveVideo(null);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, [groupId, lessonId]);

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

  if (loading) return <div className="p-10 text-center">Yuklanmoqda...</div>;
  if (!activeLesson) return <div className="p-10 text-center">Dars topilmadi</div>;

  const currentHomework = activeLesson.homework && activeLesson.homework.length > 0 ? activeLesson.homework[0] : null;
  const myAnswer = currentHomework && currentHomework.homeworkAnswerStudents?.length > 0 ? currentHomework.homeworkAnswerStudents[0] : null;
  const result = myAnswer && myAnswer.HomeworkResult?.length > 0 ? myAnswer.HomeworkResult[0] : null;

  return (
    <div className={`p-2 lg:p-4 min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f4f7f6]'}`}>
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        
        {/* LEFT COMPONENT - Video & Homework */}
        <div className="flex-1 space-y-6 overflow-hidden">
          {/* Video Player Box */}
          <div className={`rounded-xl shadow-sm border overflow-hidden relative ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
             <div className="w-full aspect-video bg-black flex items-center justify-center relative">
               {activeVideo && activeVideo.videoUrl ? (
                 <video
                   key={activeVideo.id}
                   controls
                   preload="metadata"
                   src={getMediaUrl(activeVideo.videoUrl, 'videos')}
                   className="w-full h-full object-contain"
                 ></video>
               ) : (
                 <div className="text-gray-500 font-medium">Video mavjud emas</div>
               )}
               {/* Custom poster overlay example (hidden if video starts) */}
               {activeVideo && !activeVideo.videoUrl && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-16 h-16 rounded-full bg-orange-400 text-white flex items-center justify-center pl-1">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                  </button>
               )}
             </div>
             
             {/* Homework Submissions Block */}
             {currentHomework && (
                <div className="p-6 border-t border-gray-100">
                   <h3 className={`font-bold mb-4 text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Mening jo'natmalarim</h3>
                   {myAnswer ? (
                     <div className="space-y-4">
                        <div className={`p-4 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-green-50/50'}`}>
                           <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{myAnswer.title || 'Uy ishi'}</p>
                           <span className="text-xs font-bold text-gray-500">{formatDate(myAnswer.created_at, true)}</span>
                        </div>
                        {result && (
                          <div className={`p-4 rounded-lg border-l-4 ${result.score > 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                             <div className="flex justify-between items-center mb-2">
                               <p className="text-sm font-bold text-gray-700">O'qituvchi izohi:</p>
                               <span className={`text-xs font-bold ${result.score > 0 ? 'text-green-600' : 'text-red-500'}`}>{result.score ? 'Qabul qilindi' : 'Rad etildi'}</span>
                             </div>
                             <p className="text-gray-600 text-sm">{result.comment || 'Izoh yozilmagan'}</p>
                             <p className="text-right text-xs text-gray-400 mt-2">{formatDate(result.created_at, true)}</p>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200 border-dashed border-2'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hali vazifa yuklamagansiz</p>
                     </div>
                   )}
                </div>
             )}
             {/* Student submission form (if not submitted yet) */}
             {currentHomework && !myAnswer && (
               <div className="p-6 border-t border-gray-100">
                 <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Uyga vazifani topshirish</h4>
                 {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
                 <div className="flex flex-col gap-3">
                   <textarea
                     value={submissionTitle}
                     onChange={(e) => setSubmissionTitle(e.target.value)}
                     placeholder="Izoh yoki javobni yozing (majburiy)"
                     className="w-full p-3 rounded border bg-white text-sm"
                     rows={4}
                   />
                   <input
                     type="file"
                     onChange={(e) => setSubmissionFile(e.target.files?.[0] ?? null)}
                     className="text-sm"
                     accept=".pdf,.docx,.zip,.png,.jpg,.jpeg"
                   />
                   <div className="flex items-center gap-3">
                     <button
                       disabled={uploading}
                       onClick={async () => {
                         setError('');
                         const user = JSON.parse(localStorage.getItem('user') || 'null');
                         const studentId = user?.id;
                         if (!submissionTitle || submissionTitle.trim().length < 2) {
                           setError('Iltimos, javob yoki izoh kiriting');
                           return;
                         }
                         if (!studentId) {
                           setError('Talaba aniqlanmadi. Iltimos tizimga qayta kiring');
                           return;
                         }

                         const fd = new FormData();
                         fd.append('homework_id', String(currentHomework.id));
                         fd.append('student_id', String(studentId));
                         fd.append('title', submissionTitle);
                         if (submissionFile) fd.append('file', submissionFile);

                         try {
                           setUploading(true);
                           const res = await apiClient.post('/homework-answer', fd, {
                             headers: { 'Content-Type': 'multipart/form-data' },
                           });
                           if (res.data?.success) {
                             // refresh lessons to show submission
                             await fetchLessons();
                             setSubmissionTitle('');
                             setSubmissionFile(null);
                           } else {
                             setError(res.data?.message || 'Yuklashda xatolik');
                           }
                         } catch (err) {
                           const msg = err?.message || err?.response?.data?.message || 'Yuklashda xatolik';
                           setError(msg);
                         } finally {
                           setUploading(false);
                         }
                       }}
                       className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
                     >
                       {uploading ? 'Jo'natilyapti...' : 'Jo'natish'}
                     </button>
                     <button onClick={() => { setSubmissionTitle(''); setSubmissionFile(null); setError(''); }} className="px-3 py-2 border rounded">Bekor</button>
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* Bottom Task Details Box */}
          {currentHomework && (
              <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex border-b border-gray-100">
                    <button className="px-6 py-4 border-b-2 border-orange-400 text-orange-500 font-bold text-[15px]">Vazifalar</button>
                </div>
                <div className="p-6 border-b border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Uyga vazifa</h4>
                     <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Uyga vazifa muddati: {formatDate(new Date(new Date(currentHomework.created_at).getTime() + 86400000), true)}
                     </div>
                   </div>
                   <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentHomework.title || currentHomework.description}</p>
                   {currentHomework.file && (
                     <div className="mb-4 flex items-center gap-3">
                        <a
                          href={getMediaUrl(currentHomework.file, 'homework')}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-orange-500 underline"
                        >
                          Yuklab olish / faylni ko'rish
                        </a>
                        <span className="text-xs text-gray-400">{currentHomework.file}</span>
                     </div>
                   )}
                   <p className="text-right text-xs text-gray-400 font-semibold">{formatDate(currentHomework.created_at, true)}</p>
                </div>
                {!myAnswer && (
                  <div className="p-6 bg-gray-50 flex items-center justify-between">
                     <input type="text" placeholder="Fayl biriktiring va izoh qoldiring" className="bg-transparent outline-none text-sm w-full" disabled />
                     <div className="flex items-center gap-4 text-gray-400 ml-4">
                        <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                        <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                     </div>
                  </div>
                )}
              </div>
          )}
        </div>

        {/* RIGHT COMPONENT - Sidebar Topics */}
        <div className={`w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 rounded-xl p-4 shadow-sm border ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
           <h3 className={`font-bold mb-2 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Mavzular</h3>
           <div className="overflow-y-auto max-h-[70vh] flex flex-col gap-3 pr-2 custom-scrollbar">
             {lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <div key={lesson.id} className="flex flex-col gap-2">
                     <button
                        onClick={() => navigate(`/dashboard/groups/${groupId}/lessons/${lesson.id}`)}
                        className={`p-4 rounded-xl text-left transition-colors border shadow-sm flex justify-between items-center ${
                          isActive 
                            ? 'bg-[#e5c19b] border-[#e5c19b]' // Approximate orange tone from user's image
                            : (isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-[#fffcf9] border-orange-50 hover:bg-orange-50')
                        }`}
                     >
                       <div>
                         <h4 className={`font-bold text-[14px] leading-tight mb-1 ${isActive ? 'text-gray-900' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{lesson.topic}</h4>
                         <p className={`text-[11px] ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>Dars sanasi: {formatDate(lesson.lesson_date)}</p>
                       </div>
                       <div>
                         {isActive ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                         ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                         )}
                       </div>
                     </button>
                     
                     {/* Sub-items (Videos/Materials) if Active */}
                     {isActive && lesson.videos?.length > 0 && (
                        <div className="flex flex-col gap-2 pl-4 border-l-2 border-orange-200 ml-2">
                           {lesson.videos.map((vid, vIdx) => (
                              <button 
                                key={vid.id}
                                onClick={() => setActiveVideo(vid)}
                                className={`p-3 rounded-lg text-left text-sm font-medium flex items-center gap-3 border shadow-sm ${
                                   activeVideo?.id === vid.id 
                                     ? 'bg-[#eccd9e] border-[#eccd9e] text-gray-900' 
                                     : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-[#fdf3e7] border-orange-100 text-gray-700')
                                }`}
                              >
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                 {vIdx + 1}-video: {vid.videoName || `Video fayl`}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                );
             })}
           </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLessonDetail;
