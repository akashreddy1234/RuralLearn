import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const { user } = useAuth();
  
  // Mock Data for visualization
  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Average Class CI Score',
        data: [45, 52, 61, 74, 82],
        borderColor: 'rgb(79, 70, 229)', // Indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: ['Math', 'Science', 'English', 'History'],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: [85, 60, 92, 75],
        backgroundColor: 'rgba(20, 184, 166, 0.8)', // Teal-500
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Classroom Analytics</h1>
            <p className="text-slate-500">Track aggregate performance and engagement</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <Activity size={24} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Competency Trajectory</h3>
            <div className="h-72">
              <Line options={chartOptions} data={lineChartData} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Subject Completion Rate</h3>
            <div className="h-72">
              <Bar options={chartOptions} data={barChartData} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overfow-hidden">
          <h3 className="text-lg font-bold text-slate-700 mb-4">At-Risk Students Identified</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Last Login</th>
                  <th className="pb-3 font-medium">CI Score</th>
                  <th className="pb-3 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-50">
                  <td className="py-4 font-semibold">Rohan Sharma</td>
                  <td className="py-4">7 days ago</td>
                  <td className="py-4 text-orange-500 font-bold">42</td>
                  <td className="py-4"><span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-xs font-bold">Needs Attention</span></td>
                </tr>
                <tr>
                  <td className="py-4 font-semibold">Aarti Patel</td>
                  <td className="py-4">5 days ago</td>
                  <td className="py-4 text-orange-500 font-bold">48</td>
                  <td className="py-4"><span className="bg-amber-100 text-amber-600 px-2 py-1 rounded text-xs font-bold">Review Required</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
