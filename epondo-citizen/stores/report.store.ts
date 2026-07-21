import { defineStore } from 'pinia';

interface LocationData {
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  municipalityCode: string;
  municipalityName: string;
  barangayCode: string;
  barangayName: string;
  latitude: number | null;
  longitude: number | null;
}

interface ReportDetails {
  reportType: string;
  excerpt: string;
  message: string;
  evidences: string[];
}

interface ComplainantInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  mobile: string;
  email: string;
}

interface ReportState {
  currentStep: number;
  location: LocationData;
  details: ReportDetails;
  complainant: ComplainantInfo;
  otpVerified: boolean;
  submittedCaseNumber: string | null;
}

export const useReportStore = defineStore('report', {
  state: (): ReportState => ({
    currentStep: 1,
    location: {
      regionCode: '',
      regionName: '',
      provinceCode: '',
      provinceName: '',
      municipalityCode: '',
      municipalityName: '',
      barangayCode: '',
      barangayName: '',
      latitude: null,
      longitude: null,
    },
    details: {
      reportType: '',
      excerpt: '',
      message: '',
      evidences: [],
    },
    complainant: {
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      mobile: '',
      email: '',
    },
    otpVerified: false,
    submittedCaseNumber: null,
  }),

  actions: {
    setStep(step: number) {
      this.currentStep = step;
    },

    setLocation(location: Partial<LocationData>) {
      Object.assign(this.location, location);
    },

    setDetails(details: Partial<ReportDetails>) {
      Object.assign(this.details, details);
    },

    setComplainant(info: Partial<ComplainantInfo>) {
      Object.assign(this.complainant, info);
    },

    setOtpVerified(verified: boolean) {
      this.otpVerified = verified;
    },

    setCaseNumber(caseNumber: string) {
      this.submittedCaseNumber = caseNumber;
    },

    reset() {
      this.currentStep = 1;
      this.location = {
        regionCode: '', regionName: '',
        provinceCode: '', provinceName: '',
        municipalityCode: '', municipalityName: '',
        barangayCode: '', barangayName: '',
        latitude: null, longitude: null,
      };
      this.details = { reportType: '', excerpt: '', message: '', evidences: [] };
      this.complainant = { firstName: '', middleName: '', lastName: '', gender: '', mobile: '', email: '' };
      this.otpVerified = false;
      this.submittedCaseNumber = null;
    },
  },
});
