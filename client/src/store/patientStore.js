import { create } from 'zustand';

export const usePatientStore = create((set) => ({
  selectedPatient: null,
  patientsList: [],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setPatientsList: (patients) => set({ patientsList: patients }),
}));
