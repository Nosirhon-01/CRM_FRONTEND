import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getExamSubmissions } from '../services/exams.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ExamDetailsPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { groupId, examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [notSubmitted, setNotSubmitted] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, rejected: 0, accepted: 0, notDone: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NOT_DONE');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getExamSubmissions(groupId, examId);
        const payload = response?.data || {};
        const nextSummary = payload.summary || { pending: 0, rejected: 0, accepted: 0, notDone: 0 };

        setExam(payload.exam || null);
        setSubmissions(payload.submissions || []);
        setNotSubmitted(payload.notSubmitted || []);
        setSummary(nextSummary);
        setActiveTab(
          nextSummary.pending ? 'PENDING'
            : nextSummary.accepted ? 'ACCEPTED'
              : nextSummary.rejected ? 'REJECTED'
                : nextSummary.notDone ? 'NOT_DONE'
                  : 'ACCEPTED'
        );
      } catch (err) {
        toast.error(err.message || 'Imtihon ma\'lumotlarini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, groupId, navigate]);

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

  const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

  const getStudentName = (student) => `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '-';

  const submittedRows = useMemo(() => submissions.map((submission) => ({
    id: submission.id || submission.student?.id,
    studentId: submission.student?.id || submission.student_id,
    status: submission.status,
    studentName: getStudentName(submission.student),
    submittedAt: submission.submitted_at,
    checkedAt: submission.checked_at,
    score: submission.score
  })), [submissions]);

  const notSubmittedRows = useMemo(() => notSubmitted.map((item) => ({
    id: item.id || item.student?.id,
    studentId: item.student?.id || item.student_id || item.id,
    status: 'NOT_DONE',
    studentName: getStudentName(item.student),
    submittedAt: null,
    checkedAt: null,
    score: null
  })), [notSubmitted]);

  const tabs = [
    { id: 'PENDING', label: 'Kutayotganlar', count: summary.pending || 0 },
    { id: 'REJECTED', label: 'Qaytarilganlar', count: summary.rejected || 0 },
    { id: 'ACCEPTED', label: 'Qabul qilinganlar', count: summary.accepted || 0 },
    { id: 'NOT_DONE', label: 'Bajarilmagan', count: summary.notDone || 0 }
  ];

  const filteredRows = activeTab === 'NOT_DONE'
    ? notSubmittedRows
    : submittedRows.filter(row => row.status === activeTab);
  const examStart = exam ? new Date(exam.exam_date) : null;
  const examEnd = examStart ? addMinutes(examStart, Number(exam?.duration_minutes) || 0) : null;

  const pageText = isDarkMode ? 'text-white' : 'text-[#0f172a]';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardClass = isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100';
  const headerClass = isDarkMode ? 'bg-[#172033]' : 'bg-[#fbfbfc]';
  const rowClass = isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className={`text-[26px] font-black ${pageText}`}>{exam.title || 'Examination'}</h1>
      </div>

      <div className={`overflow-hidden rounded-xl border shadow-sm ${cardClass}`}>
        <div className={`flex flex-col gap-6 px-6 py-7 lg:flex-row lg:items-center lg:justify-between ${headerClass}`}>
          <div className="grid gap-8 sm:grid-cols-[180px_minmax(260px,1fr)]">
            <div>
              <p className={`mb-2 text-[13px] font-bold ${mutedText}`}>Mavzu</p>
              <p className={`text-[20px] font-black ${pageText}`}>{exam.title || '-'}</p>
            </div>
            <div>
              <p className={`mb-2 text-[13px] font-bold ${mutedText}`}>Imtihon vaqti</p>
              <p className={`text-[20px] font-black ${pageText}`}>
                {formatDateTime(examStart)} - {formatDateTime(examEnd)}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className={`rounded-xl border px-6 py-3 text-[15px] font-bold ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}
          >
            E'lon qilish
          </button>
        </div>

        <div className="px-6 pt-8">
          <div className={`flex gap-10 overflow-x-auto border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap pb-4 text-[15px] font-black transition-colors ${
                  activeTab === tab.id
                    ? isDarkMode ? 'text-white' : 'text-[#0f172a]'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-[#0f172a]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[13px] font-black text-[#0f172a]">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#10b981]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto px-6 pb-8">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className={`border-b text-[15px] font-black ${isDarkMode ? 'border-gray-800 text-gray-300' : 'border-gray-100 text-gray-500'}`}>
                <th className="px-4 py-6">O'quvchi ismi</th>
                <th className="px-4 py-6">Topshirilgan vaqti</th>
                <th className="px-4 py-6">Tekshirilgan vaqti</th>
                <th className="px-4 py-6">Ball</th>
                <th className="px-4 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className={`text-[15px] ${pageText}`}>
              {filteredRows.length ? (
                filteredRows.map(row => (
                  <tr key={row.id} className={`border-b last:border-b-0 transition-colors ${rowClass}`}>
                    <td className="px-4 py-5 font-medium">{row.studentName}</td>
                    <td className="px-4 py-5">{formatDateTime(row.submittedAt)}</td>
                    <td className="px-4 py-5">{formatDateTime(row.checkedAt)}</td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center gap-1 font-bold">
                        {row.score !== null && row.score !== undefined ? (
                          <>
                            <Zap className="h-4 w-4 fill-orange-500 text-orange-500" />
                            {row.score}
                          </>
                        ) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      {row.status !== 'NOT_DONE' ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/groups/${groupId}/exams/${examId}/check/${row.studentId}`)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-[#0f172a]'}`}
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`py-14 text-center text-[14px] font-bold ${mutedText}`}>
                    Bu bo'limda ma'lumot yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsPage;
