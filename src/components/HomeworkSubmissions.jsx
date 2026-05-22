import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, X } from 'lucide-react';
import {
  getSubmissionsByHomework,
  gradeSubmission,
} from '../services/homework-answer.service';

const TABS = [
  { id: 'PENDING', label: 'Kutyotganlar' },
  { id: 'REJECTED', label: 'Qaytarilganlar' },
  { id: 'ACCEPTED', label: 'Qabul qilinganlar' },
  { id: 'NOT_SUBMITTED', label: 'Bajarilmagan' },
];

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

const readStoredHomework = (homeworkId) => {
  try {
    const stored = sessionStorage.getItem(`hw_${homeworkId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

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

const getStudentName = (student) => {
  if (!student) return '-';
  return [student.first_name, student.last_name].filter(Boolean).join(' ') || '-';
};

function GradeModal({ submission, isDarkMode, onClose, onSaved }) {
  const [score, setScore] = useState(submission?.result?.score ?? '');
  const [comment, setComment] = useState(submission?.result?.comment ?? '');
  const [status, setStatus] = useState(submission?.status ?? 'PENDING');
  const [saving, setSaving] = useState(false);

  const card = isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200';
  const label = isDarkMode ? 'text-gray-300' : 'text-[#111827]';
  const input = isDarkMode
    ? 'bg-[#0f172a] border-gray-700 text-white placeholder-gray-500'
    : 'bg-white border-gray-200 text-[#111827] placeholder-gray-400';

  const handleSave = async () => {
    setSaving(true);
    try {
      await gradeSubmission(submission.id, {
        score: score !== '' ? Number(score) : undefined,
        comment: comment || undefined,
        status,
      });
      toast.success('Baho saqlandi!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Yopish"
      />
      <div className={`relative mx-4 w-full max-w-md rounded-lg border p-6 shadow-2xl ${card}`}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>
              Baho berish
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {getStudentName(submission.student)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-100'}`}
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`mb-1.5 block text-sm font-semibold ${label}`}>Baho</label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#10b981] ${input}`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-semibold ${label}`}>Izoh</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#10b981] ${input}`}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-semibold ${label}`}>Holat</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#10b981] ${input}`}
            >
              <option value="PENDING">Kutyotganlar</option>
              <option value="ACCEPTED">Qabul qilinganlar</option>
              <option value="REJECTED">Qaytarilganlar</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-100'}`}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#10b981] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0f9f71] disabled:opacity-60"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeworkSubmissions({ isDarkMode }) {
  const { homeworkId } = useParams();
  const navigate = useNavigate();
  const [homework, setHomework] = useState(() => readStoredHomework(homeworkId));
  const [submissions, setSubmissions] = useState([]);
  const [notSubmitted, setNotSubmitted] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);

  const pageText = isDarkMode ? 'text-white' : 'text-[#111827]';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const panel = isDarkMode
    ? 'border-gray-800 bg-[#1e293b]'
    : 'border-gray-200 bg-white';
  const headerBand = isDarkMode ? 'bg-[#172033]' : 'bg-[#fafafa]';
  const rowBorder = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSubmissionsByHomework(Number(homeworkId));
      const payload = response.data;

      if (Array.isArray(payload)) {
        setSubmissions(payload);
        setNotSubmitted([]);
        setHomework(readStoredHomework(homeworkId));
        return;
      }

      setHomework(payload?.homework || readStoredHomework(homeworkId));
      setSubmissions(payload?.submissions || []);
      setNotSubmitted(payload?.not_submitted || []);
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [homeworkId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const rows = useMemo(() => {
    if (activeTab === 'NOT_SUBMITTED') return notSubmitted;
    return submissions.filter((submission) => submission.status === activeTab);
  }, [activeTab, notSubmitted, submissions]);

  const counts = useMemo(() => ({
    PENDING: submissions.filter((submission) => submission.status === 'PENDING').length,
    REJECTED: submissions.filter((submission) => submission.status === 'REJECTED').length,
    ACCEPTED: submissions.filter((submission) => submission.status === 'ACCEPTED').length,
    NOT_SUBMITTED: notSubmitted.length,
  }), [notSubmitted.length, submissions]);

  const homeworkTitle = homework?.title || `Homework #${homeworkId}`;
  const deadline = homework?.deadline_at || homework?.deadlineAt;

  return (
    <div className="pb-10">
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-100'} ${mutedText}`}
          aria-label="Orqaga"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className={`text-2xl font-black leading-tight ${pageText}`}>
          {homeworkTitle}
        </h2>
      </div>

      <div className={`overflow-hidden rounded-lg border ${panel}`}>
        <div className={`grid gap-8 px-6 py-6 sm:grid-cols-[220px_1fr] lg:grid-cols-[340px_1fr] ${headerBand}`}>
          <div>
            <p className={`mb-3 text-sm font-bold ${mutedText}`}>Mavzu</p>
            <p className={`text-lg font-black ${pageText}`}>{homeworkTitle}</p>
          </div>
          <div>
            <p className={`mb-3 text-sm font-bold ${mutedText}`}>Tugash vaqti</p>
            <p className={`text-lg font-black ${pageText}`}>{formatDateTime(deadline)}</p>
          </div>
        </div>

        <div className="px-6 pt-8">
          <div className={`flex gap-9 overflow-x-auto border-b ${rowBorder}`}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-2 pb-4 text-base font-bold transition-colors ${
                    isActive ? pageText : mutedText
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ffb800] px-1.5 text-sm font-black text-[#111827]">
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-full bg-[#10b981]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6 pt-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#10b981] border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className={`border-b ${rowBorder}`}>
                    <th className={`px-4 py-4 text-base font-black ${mutedText}`}>
                      O'quvchi ismi
                    </th>
                    <th className={`px-4 py-4 text-base font-black ${mutedText}`}>
                      Uyga vazifa jo'natilgan vaqt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => {
                      const canGrade = activeTab !== 'NOT_SUBMITTED';

                      return (
                        <tr
                          key={row.id}
                          onClick={() => canGrade && navigate(`/dashboard/homework/${homeworkId}/verify/${row.id}`)}
                          className={`border-b text-base font-semibold last:border-b-0 ${
                            canGrade ? 'cursor-pointer' : ''
                          } ${
                            isDarkMode
                              ? 'border-gray-800 hover:bg-[#0f172a]'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-5 ${pageText}`}>
                            {getStudentName(row.student)}
                          </td>
                          <td className={`px-4 py-5 ${pageText}`}>
                            {activeTab === 'NOT_SUBMITTED'
                              ? '-'
                              : formatDateTime(row.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={2} className={`px-4 py-14 text-center text-sm font-bold ${mutedText}`}>
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {grading && (
        <GradeModal
          submission={grading}
          isDarkMode={isDarkMode}
          onClose={() => setGrading(null)}
          onSaved={fetchSubmissions}
        />
      )}
    </div>
  );
}
