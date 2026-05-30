import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Calendar, Activity, Image as ImageIcon, FileText, Plus } from 'lucide-react';

const PatientProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl';

  // Mock data
  const patient = {
    id,
    name: 'Sara Ahmadi',
    age: 28,
    gender: 'Female',
    contact: '09123456789',
    registrationDate: '2023-01-15'
  };

  const simulations = [
    { id: 101, title: 'Rhinoplasty Preview', date: '2023-10-24', status: 'completed' },
    { id: 102, title: 'Chin Augmentation', date: '2023-08-12', status: 'archived' }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 lg:p-10 rtl:dir-rtl text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <button 
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          {isRtl ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
          <span>{t('common.backToPatients', 'Back to Patients')}</span>
        </button>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-slate-300 shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{patient.name}</h1>
                <p className="text-slate-400 mt-1">ID: P-{patient.id.padStart(5, '0')}</p>
              </div>
              <button
                onClick={() => navigate('/simulation-studio')}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#0EA5E9]/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('patients.newSimulation', 'New Simulation')}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-slate-500 text-sm">{t('patient.age', 'Age')}</p>
                <p className="text-white font-medium">{patient.age}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">{t('patient.gender', 'Gender')}</p>
                <p className="text-white font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">{t('patient.contact', 'Contact')}</p>
                <p className="text-white font-medium">{patient.contact}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">{t('patient.regDate', 'Registered')}</p>
                <p className="text-white font-medium">{patient.registrationDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0EA5E9]" />
            {t('patients.simulationsHistory', 'Simulation History')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim, idx) => (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
                onClick={() => navigate(`/3d-viewer/${sim.id}`)}
              >
                <div className="w-full h-40 bg-slate-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                   <ImageIcon className="w-10 h-10 text-slate-700" />
                   {/* Placeholder for simulation thumbnail */}
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#0EA5E9] transition-colors">{sim.title}</h3>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {sim.date}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    sim.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {t(`status.${sim.status}`, sim.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientProfilePage;
