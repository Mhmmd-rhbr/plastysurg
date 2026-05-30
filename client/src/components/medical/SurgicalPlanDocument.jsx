import React from 'react';
import { useTranslation } from 'react-i18next';

const SurgicalPlanDocument = ({ patient, planDetails }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className={`bg-white text-slate-900 p-8 max-w-4xl mx-auto shadow-2xl ${isRtl ? 'rtl:dir-rtl' : ''}`}>
      {/* Document Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">FaceVision Medical</h1>
          <p className="text-slate-500 text-sm mt-1">{t('doc.title', 'Pre-operative Surgical Plan')}</p>
        </div>
        <div className="text-right rtl:text-left text-sm text-slate-600 space-y-1">
          <p><span className="font-semibold">{t('doc.date', 'Date')}:</span> {new Date().toLocaleDateString()}</p>
          <p><span className="font-semibold">{t('doc.surgeon', 'Surgeon')}:</span> Dr. Smith</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 flex flex-wrap gap-x-12 gap-y-4 text-sm">
        <div><span className="text-slate-500">{t('patient.name', 'Name')}:</span> <span className="font-semibold">{patient?.name || 'Sara Ahmadi'}</span></div>
        <div><span className="text-slate-500">ID:</span> <span className="font-semibold">{patient?.id || 'P-00101'}</span></div>
        <div><span className="text-slate-500">{t('patient.age', 'Age')}:</span> <span className="font-semibold">{patient?.age || '28'}</span></div>
        <div><span className="text-slate-500">{t('patient.procedure', 'Procedure')}:</span> <span className="font-semibold">Rhinoplasty</span></div>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-700 text-center">{t('viewer.before', 'Before')}</h3>
          <div className="aspect-[3/4] bg-slate-200 rounded flex items-center justify-center border border-slate-300">
             <span className="text-slate-400">Original Image</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-[#0EA5E9] text-center">{t('viewer.after', 'Simulated Plan')}</h3>
          <div className="aspect-[3/4] bg-slate-200 rounded flex items-center justify-center border border-slate-300">
             <span className="text-slate-400">Simulated Result</span>
          </div>
        </div>
      </div>

      {/* Measurements Table */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">{t('doc.measurements', 'Key Measurements')}</h3>
        <table className="w-full text-left rtl:text-right text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 font-semibold rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg">{t('doc.parameter', 'Parameter')}</th>
              <th className="p-3 font-semibold">{t('doc.current', 'Current')}</th>
              <th className="p-3 font-semibold">{t('doc.planned', 'Planned')}</th>
              <th className="p-3 font-semibold rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg">{t('doc.difference', 'Difference')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-3">Nasofrontal Angle</td>
              <td className="p-3 font-mono">115°</td>
              <td className="p-3 font-mono text-[#0EA5E9] font-medium">120°</td>
              <td className="p-3 font-mono text-emerald-600">+5°</td>
            </tr>
            <tr>
              <td className="p-3">Nasolabial Angle</td>
              <td className="p-3 font-mono">95°</td>
              <td className="p-3 font-mono text-[#0EA5E9] font-medium">105°</td>
              <td className="p-3 font-mono text-emerald-600">+10°</td>
            </tr>
            <tr>
              <td className="p-3">Dorsum Projection</td>
              <td className="p-3 font-mono">14 mm</td>
              <td className="p-3 font-mono text-[#0EA5E9] font-medium">11 mm</td>
              <td className="p-3 font-mono text-blue-600">-3 mm</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{t('doc.surgicalNotes', 'Surgical Notes')}</h3>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-900 min-h-[100px]">
          {planDetails?.notes || "Dorsal hump reduction of 3mm. Tip rotation increased by 10 degrees. Osteotomies planned to narrow bony vault."}
        </div>
      </div>

      {/* Footer signatures */}
      <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between">
        <div className="text-center w-48">
          <div className="border-b border-slate-400 mb-2 h-8"></div>
          <p className="text-xs text-slate-500">{t('doc.surgeonSignature', 'Surgeon Signature')}</p>
        </div>
        <div className="text-center w-48">
          <div className="border-b border-slate-400 mb-2 h-8"></div>
          <p className="text-xs text-slate-500">{t('doc.patientSignature', 'Patient Signature')}</p>
        </div>
      </div>
    </div>
  );
};

export default SurgicalPlanDocument;
