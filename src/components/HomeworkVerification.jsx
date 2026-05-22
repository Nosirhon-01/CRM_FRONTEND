import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, Download, FileText } from 'lucide-react';
import {
  getFullVerificationData,
  gradeSubmission,
} from '../services/homework-answer.service';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day} ${month}, ${year} ${hours}:${minutes}`;
};

// Avtomatik status aniqlash
const getAutoStatus = (scoreValue) => {
  if (scoreValue === '' || scoreValue === null) return null;
  const numScore = Number(scoreValue);
  return numScore >= 60 ? 'ACCEPTED' : 'REJECTED';
};

const getStatusColor = (status) => {
  const colors = {
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
  const labels = {
    ACCEPTED: 'Qabul qilingan',
    REJECTED: 'Qaytarilgan',
  };
  return labels[status] || status;
};

export default function HomeworkVerification({ isDarkMode }) {
  const { answerId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');

  const pageText = isDarkMode ? 'text-white' : 'text-[#111827]';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const card = isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-200';
  const input = isDarkMode
    ? 'bg-[#0f172a] border-gray-700 text-white placeholder-gray-500'
    : 'bg-white border-gray-200 text-[#111827] placeholder-gray-400';

  // Avtomatik status hisoblash
  const autoStatus = getAutoStatus(score);
  const statusLabel = autoStatus ? getStatusLabel(autoStatus) : '-';
  const statusColor = autoStatus ? getStatusColor(autoStatus) : 'bg-gray-100 text-gray-600';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getFullVerificationData(Number(answerId));
        const data = response.data;
        setSubmission(data);
        
        // Pre-fill form with existing result if available
        if (data.verification_result) {
          setScore(data.verification_result.score || '');
          setComment(data.verification_result.comment || '');
        }
      } catch (err) {
        toast.error(err.message || 'Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    if (answerId) fetchData();
  }, [answerId]);

  const handleSave = async () => {
    if (score === '' || score === null) {
      toast.error('Iltimos, ballni kiriting');
      return;
    }

    setSaving(true);
    try {
      const finalStatus = getAutoStatus(score);
      await gradeSubmission(Number(answerId), {
        score: Number(score),
        comment: comment || undefined,
        status: finalStatus,
      });
      toast.success('Baho saqlandi!');
      setTimeout(() => navigate(-1), 500);
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#10b981] border-t-transparent" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className={`flex h-screen flex-col items-center justify-center gap-4 ${pageText}`}>
        <p className="text-lg font-semibold">Uyga vazifa topilmadi</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg bg-[#10b981] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#0f9f71]"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const student = submission.student || {};

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 ${mutedText}`}
          aria-label="Orqaga"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className={`text-2xl font-black leading-tight ${pageText}`}>
          Uy vazifasi tekshirish
        </h2>
      </div>

      {/* Main Card - Screenshot Design */}
      <div className={`overflow-hidden rounded-2xl border ${card}`}>
        {/* Uy vazifasi sarlavhasi */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-6`}>
          <p className={`mb-2 text-sm font-bold uppercase tracking-wider ${mutedText}`}>Uy vazifasi</p>
          <h3 className={`text-2xl font-black ${pageText}`}>{submission.homework?.title || '-'}</h3>
        </div>

        {/* O'quvchi ma'lumotlari */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-6`}>
          <p className={`mb-4 text-sm font-bold uppercase tracking-wider ${mutedText}`}>Nosirxon Ziyovutdinov</p>
          <div className="flex items-center gap-4">
            {student.photo && (
              <img
                src={student.photo}
                alt={student.full_name}
                className="h-20 w-20 rounded-lg object-cover border-2 border-[#10b981]/20"
              />
            )}
            <div>
              <h4 className={`text-lg font-black ${pageText}`}>{student.full_name || '-'}</h4>
              <p className={`mt-2 text-sm ${mutedText}`}>📧 {student.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Topshirilish vaqti va fayllar */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-6`}>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Vaqti</p>
              <p className={`text-base font-bold ${pageText}`}>
                {formatDateTime(submission.submitted_at)}
              </p>
            </div>
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Fayllar soni</p>
              <p className={`text-base font-bold ${pageText}`}>{submission.files_count || 0}</p>
            </div>
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Holat</p>
              <span className={`inline-block rounded-lg px-4 py-2 text-sm font-bold ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Ball (Score) Slider Section - Match Screenshot */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-8`}>
          <p className={`mb-6 text-lg font-black ${pageText}`}>Ball</p>
          <div className="space-y-6">
            {/* Score Slider */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                  />
                </div>
                <div className={`ml-6 flex items-center justify-center w-16 h-16 rounded-lg border-2 ${
                  autoStatus
                    ? autoStatus === 'ACCEPTED'
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <span className={`text-2xl font-black ${
                    autoStatus
                      ? autoStatus === 'ACCEPTED'
                        ? 'text-green-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {score || '-'}
                  </span>
                </div>
              </div>
              <p className={`text-center text-sm font-semibold ${mutedText}`}>O'tish bali</p>
            </div>

            {/* Auto Status Info */}
            {autoStatus && (
              <div className={`rounded-lg p-4 border-2 border-dashed ${
                autoStatus === 'ACCEPTED'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <p className={`text-sm font-bold ${
                  autoStatus === 'ACCEPTED'
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  ℹ️ Ball {score >= 60 ? '60 dan yuqori' : '60 dan past'} - {statusLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fayllar */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-8`}>
          <p className={`mb-6 text-lg font-black ${pageText}`}>Fayllar</p>
          {submission.file ? (
            <div className="flex items-center gap-4 rounded-lg bg-[#10b981]/10 px-4 py-4 border border-[#10b981]/30">
              <FileText className="h-6 w-6 text-[#10b981] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${pageText}`}>{submission.file}</p>
              </div>
              <a
                href={`/api/v1/homework-answer/${submission.file}`}
                download
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#10b981] text-white transition-colors hover:bg-[#0f9f71]"
                aria-label="Yuklab olish"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          ) : (
            <div className={`rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} px-6 py-12 text-center`}>
              <p className={`text-sm font-medium ${mutedText}`}>Fayl topshirilmagan</p>
            </div>
          )}
        </div>

        {/* Izoh (Comment) */}
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-8 py-8`}>
          <p className={`mb-4 text-lg font-black ${pageText}`}>Izoh</p>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O'quvchiga berish uchun izoh yozing..."
            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all ${input}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex-1 rounded-lg border px-4 py-3 text-base font-bold transition-colors ${
              isDarkMode
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !autoStatus}
            className={`flex-1 rounded-lg px-4 py-3 text-base font-bold text-white transition-colors ${
              autoStatus === 'ACCEPTED'
                ? 'bg-green-500 hover:bg-green-600 disabled:opacity-60'
                : autoStatus === 'REJECTED'
                ? 'bg-red-500 hover:bg-red-600 disabled:opacity-60'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {saving ? 'Saqlanmoqda...' : statusLabel === '-' ? 'Ballni kiriting' : 'Yuborish'}
          </button>
        </div>
      </div>
    </div>
  );
}
