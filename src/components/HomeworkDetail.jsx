import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  submitHomeworkAnswer,
  checkSubmission,
} from '../services/homework-answer.service';

const FILE_ACCEPT = '.pdf,.docx,.zip,.png,.jpg,.jpeg';

export default function HomeworkDetail({ isDarkMode }) {
  const { homeworkId } = useParams();
  const navigate = useNavigate();

  // In a real app you'd get studentId from auth context / localStorage
  const studentData = (() => {
    try { return JSON.parse(localStorage.getItem('student') || '{}'); } catch { return {}; }
  })();
  const studentId = studentData?.id;

  const [homework, setHomework]         = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submission, setSubmission]     = useState(null);
  const [title, setTitle]               = useState('');
  const [file, setFile]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [dragOver, setDragOver]         = useState(false);

  // Fetch homework info from localStorage (passed via navigation state) or from API
  const hwState = (() => {
    try {
      const s = sessionStorage.getItem(`hw_${homeworkId}`);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    if (hwState) setHomework(hwState);
  }, [homeworkId]);

  const checkAlreadySubmitted = useCallback(async () => {
    if (!homeworkId || !studentId) { setCheckLoading(false); return; }
    try {
      const res = await checkSubmission(Number(homeworkId), studentId);
      setAlreadySubmitted(res.submitted);
      setSubmission(res.data);
    } catch {
      // ignore
    } finally {
      setCheckLoading(false);
    }
  }, [homeworkId, studentId]);

  useEffect(() => { checkAlreadySubmitted(); }, [checkAlreadySubmitted]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Sarlavha kiritilishi shart!'); return; }
    if (!studentId)    { toast.error('Student tizimga kirmagaqn!'); return; }

    setLoading(true);
    try {
      await submitHomeworkAnswer({
        homework_id: Number(homeworkId),
        student_id:  studentId,
        title:       title.trim(),
        file,
      });
      toast.success('✅ Vazifa muvaffaqiyatli topshirildi!');
      setAlreadySubmitted(true);
      await checkAlreadySubmitted();
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const card  = isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100';
  const text  = isDarkMode ? 'text-white' : 'text-[#1e2a4a]';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const inp   = isDarkMode
    ? 'bg-[#0f172a] border-gray-600 text-white placeholder-gray-500'
    : 'bg-gray-50  border-gray-200 text-[#1e2a4a] placeholder-gray-400';

  const statusColors = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100  text-green-700',
    REJECTED: 'bg-red-100    text-red-700',
  };

  if (checkLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-xl hover:bg-indigo-50 transition-colors ${muted}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>
            {homework?.title ?? `Vazifa #${homeworkId}`}
          </h2>
          <p className={`text-sm ${muted}`}>Uy vazifasini topshirish</p>
        </div>
      </div>

      {/* Already submitted banner */}
      {alreadySubmitted && submission && (
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={`font-bold ${text}`}>Vazifa topshirilgan</p>
              <p className={`text-xs ${muted}`}>
                {new Date(submission.created_at).toLocaleString('uz-UZ')}
              </p>
            </div>
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${statusColors[submission.HomeworkStatus] || statusColors.PENDING}`}>
              {submission.HomeworkStatus}
            </span>
          </div>

          <div className={`rounded-xl border p-4 space-y-2 ${isDarkMode ? 'bg-[#0f172a] border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <p className={`text-sm font-semibold ${text}`}>{submission.title}</p>
            {submission.file && (
              <a
                href={`http://localhost:3000/files/homework-answers/${submission.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 text-sm hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Fayl ko'rish
              </a>
            )}
          </div>

          {submission.HomeworkResult?.[0] && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex gap-6">
              <div>
                <p className={`text-xs ${muted}`}>Baho</p>
                <p className={`text-2xl font-black text-indigo-600`}>
                  {submission.HomeworkResult[0].score ?? '—'}<span className="text-sm text-gray-400">/100</span>
                </p>
              </div>
              {submission.HomeworkResult[0].comment && (
                <div>
                  <p className={`text-xs ${muted}`}>Izoh</p>
                  <p className={`text-sm font-medium ${text}`}>{submission.HomeworkResult[0].comment}</p>
                </div>
              )}
            </div>
          )}

          <p className={`mt-4 text-center text-xs font-semibold ${muted}`}>
            ✋ Siz bu vazifani allaqachon topshirgansiz
          </p>
        </div>
      )}

      {/* Submit form */}
      {!alreadySubmitted && (
        <form onSubmit={handleSubmit} className={`rounded-2xl border p-6 space-y-5 ${card}`}>
          <h3 className={`text-lg font-bold ${text}`}>Vazifa javobini yuborish</h3>

          {/* Title */}
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${text}`}>
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Javob sarlavhasini kiriting..."
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${inp}`}
              required
            />
          </div>

          {/* File upload */}
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${text}`}>
              Fayl yuklash (ixtiyoriy)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? 'border-indigo-500 bg-indigo-50' : isDarkMode ? 'border-gray-600 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-400'}`}
            >
              <input
                type="file"
                accept={FILE_ACCEPT}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${text}`}>{file.name}</p>
                    <p className={`text-xs ${muted}`}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-100'}`}>
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className={`text-sm font-semibold ${text}`}>Fayl tanlash yoki bu yerga tashlang</p>
                  <p className={`text-xs mt-1 ${muted}`}>PDF, DOCX, ZIP, PNG, JPG — max 20 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl
              shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Topshirish
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
