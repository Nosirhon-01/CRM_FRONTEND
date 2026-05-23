import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Info, Mic, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getGroupById } from '../services/groups.service';
import { getGroupExams } from '../services/exams.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Noy', 'Dek'];

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

const clampScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
};

const ExamReviewPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { groupId, examId, studentId } = useParams();
  const [exam, setExam] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [examsRes, groupRes] = await Promise.all([
          getGroupExams(groupId),
          getGroupById(groupId)
        ]);

        const selectedExam = (examsRes.success ? examsRes.data || [] : [])
          .find(item => String(item.id) === String(examId));
        const selectedStudent = (groupRes?.data?.students || [])
          .find(item => String(item.id) === String(studentId));

        if (!selectedExam || !selectedStudent) {
          toast.error('Imtihon yoki talaba topilmadi');
          navigate(-1);
          return;
        }

        setExam(selectedExam);
        setStudent(selectedStudent);
      } catch (err) {
        toast.error('Tekshirish ma\'lumotlarini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, groupId, navigate, studentId]);

  const studentName = `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
  const submittedAt = useMemo(() => {
    if (!exam) return null;
    const start = new Date(exam.exam_date || exam.created_at);
    return new Date(start.getTime() + 32 * 60 * 1000);
  }, [exam]);
  const status = score >= 60 ? 'Qabul qilingan' : 'Qaytarilgan';

  const answerText = useMemo(() => {
    const slug = studentName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'student';

    return `1. https://github.com/${slug}/CRM-Backend\n2. https://github.com/${slug}/CRM-Frontend\n3. https://exam-demo.vercel.app/login`;
  }, [studentName]);

  const handleSubmit = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast.success(`Imtihon ${status.toLowerCase()} sifatida saqlandi`);
      navigate(-1);
    }, 400);
  };

  const pageText = isDarkMode ? 'text-white' : 'text-[#101828]';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const card = isDarkMode ? 'bg-[#1e293b] border-gray-800' : 'bg-white border-gray-100';
  const softCard = isDarkMode ? 'bg-[#172033] border-gray-800' : 'bg-[#f7f8fc] border-gray-100';
  const inner = isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!exam || !student) return null;

  return (
    <div className="pb-12">
      <div className="mb-8 flex items-center gap-3 text-[18px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`font-black transition-colors ${pageText}`}
        >
          Kutayotganlar
        </button>
        <ChevronRight className={`h-5 w-5 ${mutedText}`} />
        <span className={mutedText}>Imtihon</span>
      </div>

      <div className="w-full max-w-[760px] space-y-9">
        <section className={`rounded-lg border p-5 shadow-sm ${card}`}>
          <h2 className={`mb-4 text-[20px] font-black ${pageText}`}>Imtihon vazifasi</h2>
          <div className={`min-h-[210px] rounded-sm p-5 ${inner}`}>
            <p className={`mb-2 text-[16px] ${mutedText}`}>Imtihon izohi:</p>
            <div className={`whitespace-pre-line text-[17px] leading-8 ${pageText}`}>
              {exam.lesson?.topic || exam.title || 'Imtihon topshirig\'i'}
              {'\n\n'}1. backend github link
              {'\n'}2. frontend github link
            </div>
          </div>
        </section>

        <section className={`rounded-lg border p-5 shadow-sm ${softCard}`}>
          <h2 className={`mb-7 text-[19px] font-black ${pageText}`}>{studentName || '-'}</h2>

          <div className={`mb-4 rounded-lg border p-6 ${inner}`}>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className={`mb-2 text-[16px] ${mutedText}`}>Vaqti:</p>
                <p className={`text-[16px] font-black ${pageText}`}>{formatDateTime(submittedAt)}</p>
              </div>
              <div>
                <p className={`mb-2 text-[16px] ${mutedText}`}>Fayllar soni:</p>
                <p className={`text-[16px] font-black ${pageText}`}>0</p>
              </div>
              <div>
                <p className={`mb-2 text-[16px] ${mutedText}`}>Status:</p>
                <span className="inline-flex rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1 text-[15px] font-semibold text-yellow-600">
                  Kutayapti
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-lg border p-7 ${inner}`}>
            <div className={`rounded-md border-l-4 border-blue-600 p-5 ${isDarkMode ? 'bg-[#111827]' : 'bg-[#f7f9fd]'}`}>
              <p className={`mb-2 text-[16px] ${mutedText}`}>Uyga vazifa izohi:</p>
              <p className={`whitespace-pre-line text-[17px] font-black leading-8 ${pageText}`}>{answerText}</p>
            </div>
          </div>
        </section>

        <section className={`rounded-lg border p-5 shadow-sm ${softCard}`}>
          <div className={`mb-8 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-700`}>
            <Info className="mt-0.5 h-5 w-5 shrink-0 fill-sky-600 text-sky-600" />
            <p className="text-[16px] font-semibold leading-7">
              60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
            </p>
          </div>

          <h2 className={`mb-5 text-[19px] font-black ${pageText}`}>Ball</h2>
          <div className="mb-8 flex items-start gap-8">
            <div className="flex-1 pt-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={score}
                onChange={(e) => setScore(clampScore(e.target.value))}
                className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#10b981]"
              />
              <div className={`mt-3 text-center text-[16px] font-black ${mutedText}`}>O'tish bali</div>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(clampScore(e.target.value))}
              className={`h-11 w-16 rounded-lg border text-center text-[18px] font-bold outline-none focus:border-[#10b981] ${inner} ${pageText}`}
            />
          </div>

          <div className={`relative rounded-lg border ${inner}`}>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Izohingiz"
              className={`block w-full resize-none rounded-lg bg-transparent px-5 py-5 pr-16 text-[16px] outline-none ${pageText} placeholder-gray-400`}
            />
            <button
              type="button"
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#10b981] text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-[#059669]"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="flex justify-end gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`rounded-lg border px-8 py-3 text-[16px] font-semibold transition-colors ${isDarkMode ? 'border-gray-700 bg-[#1e293b] text-gray-300 hover:bg-gray-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-8 py-3 text-[16px] font-bold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-[#059669] disabled:opacity-60"
          >
            <Zap className="h-4 w-4 fill-current" />
            {saving ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamReviewPage;
