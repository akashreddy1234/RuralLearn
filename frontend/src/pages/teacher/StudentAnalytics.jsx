import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentAnalytics = () => {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [students, setStudents] = useState([]);
  const [summary, setSummary]   = useState({ avgCI: 0, totalLessonsCompleted: 0, totalQuizzesTaken: 0 });
  const [requiresAttention, setRequiresAttention] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard/teacher/analytics');
        setStudents(data.students || []);
        setSummary(data.summary || { avgCI: 0, totalLessonsCompleted: 0, totalQuizzesTaken: 0 });
        setRequiresAttention(data.requiresAttention || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Build chart data from real students
  const chartData = {
    labels: students.map(s => {
      const parts = s.name.trim().split(' ');
      return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    }),
    datasets: [
      {
        label: 'Competency Index (CI)',
        data: students.map(s => s.ci),
        backgroundColor: students.map(s =>
          s.ci < 70 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(20, 184, 166, 0.6)'
        ),
        borderColor: students.map(s =>
          s.ci < 70 ? 'rgba(239, 68, 68, 1)' : 'rgba(20, 184, 166, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Student Performance Metrics' },
      tooltip: {
        callbacks: {
          afterBody: (items) => {
            const idx = items[0]?.dataIndex;
            const student = students[idx];
            if (!student) return [];
            return [
              `Lessons Completed: ${student.lessonsCompleted}`,
              `Quizzes Taken: ${student.quizzesTaken}`,
            ];
          },
        },
      },
    },
    scales: {
      y: { min: 0, max: 100, title: { display: true, text: 'CI Score' } },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Student Analytics</h1>
            <p className="text-slate-500">Track class performance and identify areas for improvement</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            <span className="ml-4 text-slate-500 text-lg">Loading analytics…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center">
            <p className="font-semibold text-lg">Unable to load data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && students.length === 0 && (
          <div className="bg-white border border-slate-100 text-slate-500 p-10 rounded-2xl text-center">
            <p className="text-lg font-medium">No student activity yet.</p>
            <p className="text-sm mt-1">Students will appear here once they start completing lessons and quizzes.</p>
          </div>
        )}

        {/* Main content */}
        {!loading && !error && students.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Bar chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Bar data={chartData} options={chartOptions} />
              <p className="text-xs text-slate-400 mt-3 text-center">
                Red bars indicate students with CI below 70 who may need additional support.
              </p>
            </div>

            {/* Right panel */}
            <div className="space-y-6">

              {/* Class Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Class Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Average CI</span>
                    <span className="font-bold text-teal-600 text-xl">{summary.avgCI}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Lessons Completed</span>
                    <span className="font-bold text-slate-800">{summary.totalLessonsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Quizzes Taken</span>
                    <span className="font-bold text-slate-800">{summary.totalQuizzesTaken}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3 mt-1">
                    <span className="text-slate-600">Total Students</span>
                    <span className="font-bold text-slate-800">{students.length}</span>
                  </div>
                </div>
              </div>

              {/* Requires Attention */}
              <div className={`p-6 rounded-2xl border ${requiresAttention.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <h3 className={`text-lg font-bold mb-2 ${requiresAttention.length > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                  {requiresAttention.length > 0 ? 'Requires Attention' : '✓ All On Track'}
                </h3>
                {requiresAttention.length > 0 ? (
                  <>
                    <p className="text-rose-600 mb-4 text-sm">
                      {requiresAttention.length} student{requiresAttention.length > 1 ? 's' : ''} with CI below 70.
                    </p>
                    <ul className="space-y-2 text-sm text-rose-700">
                      {requiresAttention.map(s => (
                        <li key={s.id} className="flex items-start gap-2">
                          <span>⚠️</span>
                          <span>
                            <strong>{s.name}</strong>
                            {s.weakLesson && <span className="text-rose-500"> — {s.weakLesson}</span>}
                            <span className="ml-1 text-xs text-rose-400">(CI: {s.ci})</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-emerald-600 text-sm">
                    All students are performing at or above the CI 70 threshold. Great work! 🎉
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Per-student detail table (when data is present) */}
        {!loading && !error && students.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Per-Student Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4 text-center">CI Score</th>
                    <th className="pb-3 pr-4 text-center">Lessons Done</th>
                    <th className="pb-3 pr-4 text-center">Quizzes Taken</th>
                    <th className="pb-3">Weak Area</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-slate-700">{s.name}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`font-bold text-base ${s.ci < 70 ? 'text-rose-600' : 'text-teal-600'}`}>
                          {s.ci}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center text-slate-600">{s.lessonsCompleted}</td>
                      <td className="py-3 pr-4 text-center text-slate-600">{s.quizzesTaken}</td>
                      <td className="py-3 text-slate-500 text-xs">{s.weakLesson || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentAnalytics;
