import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, PlusCircle, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl';

  const stats = [
    { label: t('dashboard.totalPatients', 'Total Patients'), value: '142', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: t('dashboard.simulationsToday', 'Simulations Today'), value: '8', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: t('dashboard.pendingReviews', 'Pending Reviews'), value: '3', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' }
  ];

  const recentPatients = [
    { id: 1, name: 'Sara Ahmadi', procedure: 'Rhinoplasty', date: '2023-10-24', status: 'completed' },
    { id: 2, name: 'Reza Karimi', procedure: 'Blepharoplasty', date: '2023-10-24', status: 'pending' },
    { id: 3, name: 'Mina Jalali', procedure: 'Facelift', date: '2023-10-23', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 lg:p-10 rtl:dir-rtl text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('dashboard.title', 'Overview')}</h1>
            <p className="text-slate-400 mt-1">{t('dashboard.subtitle', 'Welcome back, Dr. Smith')}</p>
          </div>
          <button
            onClick={() => navigate('/simulation-studio')}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#0EA5E9]/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('dashboard.newSimulation', 'New Simulation')}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4"
            >
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{t('dashboard.recentPatients', 'Recent Patients')}</h2>
            <button onClick={() => navigate('/patients')} className="text-[#0EA5E9] hover:text-[#38BDF8] text-sm font-medium">
              {t('dashboard.viewAll', 'View All')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-900/50 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('patient.name', 'Patient Name')}</th>
                  <th className="px-6 py-4 font-medium">{t('patient.procedure', 'Procedure')}</th>
                  <th className="px-6 py-4 font-medium">{t('patient.date', 'Date')}</th>
                  <th className="px-6 py-4 font-medium">{t('patient.status', 'Status')}</th>
                  <th className="px-6 py-4 font-medium text-center">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{patient.name}</td>
                    <td className="px-6 py-4 text-slate-300">{patient.procedure}</td>
                    <td className="px-6 py-4 text-slate-400">{patient.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                      }`}>
                        {t(`status.${patient.status}`, patient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors mx-auto min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentPatients.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                {t('common.noData', 'No data available')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
