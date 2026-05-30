import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, User, Calendar, FileText } from 'lucide-react';

const PatientListPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl';
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const patients = [
    { id: '1', name: 'Sara Ahmadi', age: 28, lastVisit: '2023-10-24', procedures: 2 },
    { id: '2', name: 'Reza Karimi', age: 34, lastVisit: '2023-10-15', procedures: 1 },
    { id: '3', name: 'Mina Jalali', age: 42, lastVisit: '2023-09-30', procedures: 3 },
    { id: '4', name: 'Ali Rezaei', age: 25, lastVisit: '2023-09-12', procedures: 1 },
  ];

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 lg:p-10 rtl:dir-rtl text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('patients.title', 'Patient Directory')}</h1>
            <p className="text-slate-400 mt-1">{t('patients.subtitle', 'Manage patient records and simulations')}</p>
          </div>
          <button
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#0EA5E9]/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span>{t('patients.addPatient', 'Add New Patient')}</span>
          </button>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent ${isRtl ? 'pr-12 text-right' : 'pl-12 text-left'} py-3 outline-none transition-all`}
              placeholder={t('patients.search', 'Search patients...')}
            />
          </div>
          <button className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-4 py-3 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 min-h-[44px]">
            <Filter className="w-5 h-5" />
            <span>{t('common.filter', 'Filter')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-slate-300">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#0EA5E9] transition-colors">{patient.name}</h3>
                    <p className="text-slate-400 text-sm">{t('patient.age', 'Age')}: {patient.age}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{t('patient.lastVisit', 'Last Visit')}: {patient.lastVisit}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>{patient.procedures} {t('patient.simulationsCount', 'Simulations')}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('patients.noResults', 'No patients found matching your search.')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientListPage;
