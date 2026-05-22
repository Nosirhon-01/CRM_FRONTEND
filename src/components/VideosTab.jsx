import { useState, useEffect } from 'react';
import { Download, Trash2, Eye, MoreVertical, Play, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGroupVideos, deleteVideo, createVideo, updateVideo } from '../services/videos.service';
import { getGroupLessons } from '../services/lessons.service';

const VideosTab = ({ groupId, isDarkMode }) => {
  const [videos, setVideos] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);
  const [formData, setFormData] = useState({
    lesson_id: '',
    videoName: '',
    videoUrl: ''
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);

  useEffect(() => {
    fetchVideos();
    fetchLessons();
  }, [groupId]);

  const fetchLessons = async () => {
    try {
      const res = await getGroupLessons(groupId);
      if (res.success) {
        setLessons(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await getGroupVideos(groupId);
      if (res.success) {
        setVideos(res.data || []);
      } else {
        toast.error('Videolarni yuklashda xatolik');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      toast.error('Videolarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteVideo(groupId, videoToDelete.id);
      if (res.success) {
        toast.success("Video o'chirildi");
        setDeleteModalOpen(false);
        setVideoToDelete(null);
        fetchVideos();
      } else {
        toast.error("Videoni o'chirishda xatolik");
      }
    } catch (err) {
      toast.error("Videoni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDownload = (videoUrl, videoName) => {
    if (!videoUrl) {
      toast.error('Video URL topilmadi');
      return;
    }
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = videoName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWatch = (video) => {
    setSelectedVideo(video);
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = 
      video.videoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.lessonName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || video.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tayyor':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
      case 'Yuklanmoqda':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
      case 'Xato':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return bytes + ' B';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['.mp4', '.webm', '.mpeg', '.avi', '.mkv', '.m4v', '.ogm', '.mov', '.mpg'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Fayl formati noto'g'ri! Ruxsat etilgan formatlar: " + allowedExtensions.join(', '));
      e.target.value = '';
      return;
    }

    setFormData({
      ...formData,
      videoName: file.name,
      file: file
    });
  };

  const handleEditClick = (video) => {
    setEditingVideoId(video.id);
    setFormData({
      lesson_id: video.lesson_id ? video.lesson_id.toString() : '',
      videoName: video.videoName || '',
      videoUrl: video.videoUrl || ''
    });
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!formData.lesson_id || !formData.videoName) {
      toast.error("Iltimos, darsni tanlang va video nomini kiriting");
      return;
    }
    setAddingVideo(true);
    const toastId = toast.loading(editingVideoId ? "Video yangilanmoqda..." : "Video saqlanmoqda...");
    try {
      const selectedLesson = lessons.find(l => l.id === parseInt(formData.lesson_id));
      
      if (editingVideoId) {
        await updateVideo(groupId, editingVideoId, {
          lesson_id: parseInt(formData.lesson_id),
          videoName: formData.videoName,
          lessonName: selectedLesson ? selectedLesson.topic : '',
          status: 'Tayyor',
          videoUrl: formData.videoUrl || null
        });
        toast.success("Video muvaffaqiyatli yangilandi!", { id: toastId });
      } else {
        await createVideo(groupId, {
          lesson_id: parseInt(formData.lesson_id),
          videoName: formData.videoName,
          lessonName: selectedLesson ? selectedLesson.topic : '',
          status: 'Tayyor',
          size: Math.floor(Math.random() * (1024 * 1024 * 1024 * 2)),
          videoUrl: formData.videoUrl || null
        });
        toast.success("Video muvaffaqiyatli saqlandi!", { id: toastId });
      }
      setModalOpen(false);
      setFormData({ lesson_id: '', videoName: '', videoUrl: '' });
      setEditingVideoId(null);
      fetchVideos();
    } catch (err) {
      toast.error(editingVideoId ? "Videoni yangilashda xatolik" : "Videoni qo'shishda xatolik", { id: toastId });
    } finally {
      setAddingVideo(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Search and Filter */}
      <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-4">
        {/* We can hide Search temporarily or keep it, since screenshot doesn't emphasize it, but we'll add the button */}
        <div className="flex flex-1 gap-4 items-center max-w-2xl hidden flex-row lg:flex">
            <input
              type="text"
              placeholder="Video yoki dars nomi bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${
                isDarkMode 
                  ? 'bg-[#0f172a] border-gray-700 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border outline-none ${
              isDarkMode 
                ? 'bg-[#0f172a] border-gray-700 text-white' 
                : 'bg-white border-gray-200'
            }`}
          >
            <option value="">Barcha statuslar</option>
            <option value="Tayyor">Tayyor</option>
            <option value="Yuklanmoqda">Yuklanmoqda</option>
            <option value="Xato">Xato</option>
          </select>
        </div>

        <div className="flex items-center self-end xl:absolute xl:top-[-60px] xl:right-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-5 py-2 text-[13px] font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#059669]"
          >
            Qo'shish
          </button>
        </div>
      </div>

      {/* Videos Table */}
      {filteredVideos.length > 0 ? (
        <div className={`rounded-2xl border overflow-x-auto ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <table className="w-full min-w-max">
            <thead>
              <tr className={`border-b text-[13px] font-black ${isDarkMode ? 'bg-[#0f172a] border-gray-800 text-gray-300' : 'bg-[#f8fafc] border-gray-100 text-gray-600'}`}>
                <th className="px-4 py-4 text-left whitespace-nowrap">Video nomi</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Dars nomi</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Status</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Dars sanasi</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Hajmi</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Qo'shilgan vaqti</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">Harakatar</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((video, idx) => (
                <tr 
                  key={video.id} 
                  className={`border-b text-[14px] font-medium last:border-b-0 transition-colors ${
                    isDarkMode 
                      ? 'border-gray-800 hover:bg-gray-800/50' 
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      <button 
                         onClick={() => handleWatch(video)}
                         className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                         title="Ko'rish"
                      >
                        <Play className="w-5 h-5 text-emerald-500" fill="currentColor" />
                      </button>
                      <div>
                        <p className="font-bold truncate" title={video.videoName}>{video.videoName || '-'}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{video.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {video.lessonName || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(video.status)}`}>
                      {video.status || 'Noma\'lum'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {formatDate(video.lessonDate)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {formatSize(video.size)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {formatDate(video.uploadedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center relative">
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         setOpenMenuId(openMenuId === video.id ? null : video.id);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors mx-auto ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === video.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className={`absolute right-14 top-1/2 -translate-y-1/2 w-44 rounded-xl shadow-xl z-50 overflow-hidden border py-1 ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
                           {/* Decorative triangle pointer */}
                           <div className={`absolute right-[-4.5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}></div>
                           
                           {video.videoUrl && (
                             <>
                               <button 
                                 onClick={() => handleWatch(video)}
                                 className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors border-b ${isDarkMode ? 'border-gray-700/50 text-gray-300 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-gray-50'}`}
                               >
                                  <Eye className="w-4 h-4 text-blue-400" />
                                  Ko'rish
                               </button>
                               <button 
                                 onClick={() => handleDownload(video.videoUrl, video.videoName)}
                                 className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors border-b ${isDarkMode ? 'border-gray-700/50 text-gray-300 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-gray-50'}`}
                               >
                                  <Download className="w-4 h-4 text-green-400" />
                                  Yuklab olish
                               </button>
                             </>
                           )}

                           <button 
                             onClick={() => handleEditClick(video)}
                             className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors border-b ${isDarkMode ? 'border-gray-700/50 text-gray-300 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-gray-50'}`}
                           >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Tahrirlash
                           </button>
                           <button 
                             onClick={() => handleDeleteClick(video)}
                             className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                           >
                              <Trash2 className="w-4 h-4" />
                              O'chirish
                           </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`rounded-2xl p-12 border text-center ${isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || filterStatus ? 'Videolar topilmadi' : 'Hozircha videolar yo\'q'}
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-bold">{selectedVideo.videoName}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              {selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <p className="text-white">Video URL topilmadi</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className={`w-full max-w-5xl rounded-2xl flex flex-col overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
            <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qo'shish</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddVideo} className="p-6 space-y-6">
              {/* Dropzone */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer group relative ${isDarkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => document.getElementById('videoFileInput').click()}
              >
                <input
                  type="file"
                  id="videoFileInput"
                  className="hidden"
                  accept=".mp4,.webm,.mpeg,.avi,.mkv,.m4v,.ogm,.mov,.mpg"
                  onChange={handleFileSelect}
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
                  <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <p className={`text-[15px] font-bold text-center mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
                </p>
                <p className={`text-[13px] text-center max-w-xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Videofayl .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov, .mpg formatlaridan birida bo'lishi kerak
                </p>
              </div>

              {/* Form table area */}
              <div className={`border rounded-xl overflow-hidden shadow-sm ${isDarkMode ? 'border-gray-700 bg-[#0f172a]' : 'border-gray-100'}`}>
                <table className="w-full text-left text-[13px]">
                  <thead className={`border-b ${isDarkMode ? 'bg-[#1e293b] border-gray-700 text-gray-300' : 'bg-[#f8fafc] border-gray-100 text-gray-700'}`}>
                    <tr>
                      <th className="px-4 py-3 font-black w-[30%]">File name</th>
                      <th className="px-4 py-3 font-black w-[30%]"><span className="text-red-500">*</span> Dars</th>
                      <th className="px-4 py-3 font-black w-[30%]"><span className="text-red-500">*</span> Video nomi</th>
                      <th className="px-4 py-3 font-black text-center w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
                    <tr className={`border-b last:border-0 ${isDarkMode ? 'border-gray-700 hover:bg-[#1e293b]' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="px-4 py-5 font-bold">
                        {formData.videoName || "Hech qanday fayl tanlanmagan"}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={formData.lesson_id}
                          onChange={(e) => setFormData({...formData, lesson_id: e.target.value})}
                          className={`w-full px-3 py-2.5 rounded-lg border outline-none font-medium transition-all ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white focus:border-[#10b981]' : 'bg-white border-gray-200 text-gray-900 focus:border-[#10b981]'}`}
                          required
                        >
                          <option value="">Darsni tanlang...</option>
                          {lessons.map(l => (
                            <option key={l.id} value={l.id}>{l.topic || `Dars ${l.id}`}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={formData.videoName}
                          onChange={(e) => setFormData({...formData, videoName: e.target.value})}
                          className={`w-full px-3 py-2.5 rounded-lg border outline-none font-medium transition-all ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white focus:border-[#10b981]' : 'bg-white border-gray-200 text-gray-900 focus:border-[#10b981]'}`}
                          placeholder="Fayl nomi..."
                          required
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, videoName: ''})}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors mx-auto ${isDarkMode ? 'border-gray-700 text-red-400 hover:bg-red-900/20 hover:border-red-500/50' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`px-6 py-2.5 rounded-xl font-bold border transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#1e293b]' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={addingVideo}
                  className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {addingVideo ? 'Yuklanmoqda...' : 'Fayllarni yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && videoToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
            <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500 mx-auto">
                   <Trash2 className="w-6 h-6" />
                </div>
                <h3 className={`text-xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Videoni o'chirish
                </h3>
                <p className={`text-[14px] text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Siz haqiqatan ham <strong className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{videoToDelete.videoName}</strong> videoni o'chirmoqchimisiz? Ushbu amalni bekor qilib bo'lmaydi.
                </p>
            </div>
            <div className={`p-4 flex justify-end gap-3 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/20' : 'border-gray-100 bg-gray-50'}`}>
               <button
                  type="button"
                  onClick={() => { setDeleteModalOpen(false); setVideoToDelete(null); }}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-colors border ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-white bg-white'}`}
               >
                 Bekor qilish
               </button>
               <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#f43f5e] hover:bg-[#e11d48] text-white transition-colors disabled:opacity-50 shadow-lg shadow-rose-500/20 flex items-center gap-2"
               >
                 {deleting ? 'O\'chirilmoqda...' : 'Ha, o\'chirish'}
               </button>
            </div>
          </div>
        </div>
      )}
      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md transition-all animate-in fade-in duration-300">
           {/* Close area */}
           <div className="absolute inset-0 z-0" onClick={() => setSelectedVideo(null)}></div>
           
           <div className={`relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b dark:border-gray-800">
                 <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedVideo.videoName}
                 </h2>
                 <button 
                   onClick={() => setSelectedVideo(null)}
                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Video Body */}
              <div className={`relative aspect-video max-h-[70vh] flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
                 {selectedVideo.videoUrl ? (
                    <video 
                      src={selectedVideo.videoUrl} 
                      controls 
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                 ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                       <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center">
                          <Play className="w-10 h-10" />
                       </div>
                       <p className="font-bold">Video fayl topilmadi</p>
                    </div>
                 )}
                 
                 {!selectedVideo.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                       <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-lg">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
                             <Play className="w-8 h-8 text-emerald-500 ml-1" fill="currentColor" />
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideosTab;
