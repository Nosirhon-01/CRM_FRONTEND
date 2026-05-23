import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createExam } from '../services/exams.service';
import { getGroupLessons } from '../services/lessons.service';

const CreateExamPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileData, setFileData] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    lesson_id: '',
    exam_date: new Date().toISOString().slice(0, 10),
    exam_time: '09:00',
    created_date: new Date().toISOString().slice(0, 10),
    created_time: '08:00'
  });

  useEffect(() => {
    fetchLessons();
  }, [groupId]);

  const fetchLessons = async () => {
    try {
      const res = await getGroupLessons(groupId);
      if (res.success) {
        setLessons(res.data);
      }
    } catch (err) {
      toast.error('Darslarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData(file);
      toast.success('Fayl qo\'shildi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Imtihon nomi kiritilishi kerak');
      return;
    }

    if (!formData.exam_date) {
      toast.error('Tugash sanasi kiritilishi kerak');
      return;
    }

    if (!formData.created_date) {
      toast.error('Yaratilgan sanasi kiritilishi kerak');
      return;
    }

    // Calculate duration in minutes from created date/time to exam date/time
    const createdDateTime = new Date(`${formData.created_date}T${formData.created_time}:00`);
    const examDateTime = new Date(`${formData.exam_date}T${formData.exam_time}:00`);
    const durationMs = examDateTime - createdDateTime;
    
    if (durationMs <= 0) {
      toast.error('Tugash sanasi yaratilgan sanasidan keyin bo\'lishi kerak');
      return;
    }

    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : null,
        exam_date: `${formData.exam_date}T${formData.exam_time}:00`,
        duration_minutes: durationMinutes,
        max_score: 100
      };

      await createExam(groupId, payload);
      toast.success('Imtihon muvaffaqiyatli yaratildi');
      navigate(-1);
    } catch (err) {
      toast.error('Imtihon yaratishda xatolik: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBgColor = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const labelColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';

  if (loading) {
    return (
      <div className={`${bgColor} min-h-screen flex items-center justify-center`}>
        <div className="text-lg">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} min-h-screen`}>
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-3xl font-bold ${textColor}`}>Imtihon yaratish</h1>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            ℹ️ Oxirgi 7 kundagi uyga vazifa berilmagan mavzularni tanlay olasiz!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mavzu (Lesson) */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              <span className="text-red-500">*</span> Mavzu
            </label>
            <select
              name="lesson_id"
              value={formData.lesson_id}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Mavzulardan birini tanlang</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.topic}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              <span className="text-red-500">*</span> Imtihon nomi
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Imtihon nomini kiriting"
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          {/* Description Editor */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Izoh
            </label>
            <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
              {/* Toolbar */}
              <div className={`border-b ${borderColor} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 flex flex-wrap gap-2`}>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded" title="Heading 1">H1</button>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded" title="Heading 2">H2</button>
                <select className="px-2 py-1 rounded" defaultValue="Sans Serif">
                  <option>Sans Serif</option>
                  <option>Serif</option>
                  <option>Monospace</option>
                </select>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded" title="Normal">Normal</button>
                <div className="w-px bg-gray-400"></div>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded font-bold">B</button>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded italic">I</button>
                <button type="button" className="px-2 py-1 hover:bg-gray-300 rounded underline">U</button>
              </div>
              {/* Text Area */}
              <textarea
                className={`w-full px-4 py-3 ${inputBgColor} ${textColor} focus:outline-none resize-none`}
                rows="6"
                placeholder="Imtihon haqida qo'shimcha ma'lumot kiriting"
              ></textarea>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Fayl yuklash
            </label>
            <div className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center cursor-pointer hover:bg-opacity-50 transition`}>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`text-sm ${labelColor}`}>
                  {fileData ? fileData.name : 'Fayl yuklash uchun bosing yoki suring'}
                </span>
              </label>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                <span className="text-red-500">*</span> Tugash sanasi
              </label>
              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                <span className="text-red-500">*</span> Tugash vaqti
              </label>
              <input
                type="time"
                name="exam_time"
                value={formData.exam_time}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>

          {/* Created Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                <span className="text-red-500">*</span> Yaratilgan sanasi
              </label>
              <input
                type="date"
                name="created_date"
                value={formData.created_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${labelColor} mb-2`}>
                <span className="text-red-500">*</span> Yaratilgan vaqti
              </label>
              <input
                type="time"
                name="created_time"
                value={formData.created_time}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-6 py-2 rounded-lg border ${borderColor} ${textColor} font-medium hover:bg-opacity-10`}
              disabled={saving}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Saqlanmoqda...' : "E'lon qilish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamPage;
