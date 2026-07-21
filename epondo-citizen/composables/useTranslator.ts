export function useTranslator() {
  const language = useState<'en' | 'fil'>('app-language', () => 'en');

  function t(key: string): string {
    const parts = key.split('.');
    let result: unknown = translations[language.value];
    for (const part of parts) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }

  function setLanguage(lang: 'en' | 'fil') {
    language.value = lang;
  }

  function toggleLanguage() {
    language.value = language.value === 'en' ? 'fil' : 'en';
  }

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}

const translations: Record<string, Record<string, Record<string, string>>> = {
  en: {
    nav: { projects: 'Projects', report: 'Report', assistant: 'AI Assistant', login: 'Login' },
    hero: { title: 'Transparent Local Governance for Every Filipino', subtitle: 'Track your barangay\'s budget, report issues, and ask questions powered by eGov APIs.', viewProjects: 'View Projects', fileReport: 'File a Report', askAI: 'Ask AI' },
    features: { budget: 'Budget Transparency', budgetDesc: 'Real-time tracking of how barangay funds are allocated and spent.', verified: 'Verified by PhilSys + Liveness', verifiedDesc: 'Identity verification ensures accountability in all transactions.', blockchain: 'Blockchain Anchored', blockchainDesc: 'Budget approvals recorded on eGovchain for tamper-proof audit trails.' },
    report: { title: 'Report a Problem', subtitle: 'File a geotagged complaint about delayed, ghost, or substandard local projects.', newReport: 'File New Report', trackReport: 'Track My Report', step1: 'Location', step2: 'Details', step3: 'Verify', step4: 'Done', next: 'Next', previous: 'Previous', submit: 'Submit Report', requestOtp: 'Request OTP', verifyOtp: 'Verify OTP', caseNumber: 'Case Number', trackPlaceholder: 'Enter case number (e.g., PFM 072226 0001)' },
    assistant: { title: 'AI Budget Assistant', welcome: 'Welcome! I can help you understand your barangay\'s budget.', placeholder: 'Type your question...', send: 'Send', credits: 'Credits', lowCredits: 'Limited AI queries remaining', noCredits: 'Credits exhausted' },
  },
  fil: {
    nav: { projects: 'Mga Proyekto', report: 'Mag-report', assistant: 'AI Katulong', login: 'Mag-login' },
    hero: { title: 'Transparent na Pamamahala para sa Bawat Pilipino', subtitle: 'Subaybayan ang budget ng iyong barangay, mag-report ng problema, at magtanong gamit ang eGov APIs.', viewProjects: 'Tingnan ang Proyekto', fileReport: 'Mag-file ng Report', askAI: 'Tanong sa AI' },
    features: { budget: 'Transparency ng Budget', budgetDesc: 'Real-time na pagsubaybay kung paano ginagastos ang pondo ng barangay.', verified: 'Na-verify ng PhilSys + Liveness', verifiedDesc: 'Ang identity verification ay nagsi-sigurado ng accountability sa lahat ng transaksyon.', blockchain: 'Naka-record sa Blockchain', blockchainDesc: 'Ang mga budget approval ay naka-record sa eGovchain para sa tamper-proof audit trails.' },
    report: { title: 'Mag-report ng Problema', subtitle: 'Mag-file ng geotagged na reklamo tungkol sa mga delayed, ghost, o substandard na proyekto.', newReport: 'Mag-file ng Bagong Report', trackReport: 'I-track ang Report Ko', step1: 'Lokasyon', step2: 'Detalye', step3: 'Beripikasyon', step4: 'Tapos', next: 'Susunod', previous: 'Nakaraan', submit: 'I-submit ang Report', requestOtp: 'Humiling ng OTP', verifyOtp: 'I-verify ang OTP', caseNumber: 'Case Number', trackPlaceholder: 'Ilagay ang case number (hal., PFM 072226 0001)' },
    assistant: { title: 'AI Budget Katulong', welcome: 'Kumusta! Makakatulong ako sa pag-intindi ng budget ng iyong barangay.', placeholder: 'I-type ang iyong tanong...', send: 'Ipadala', credits: 'Credits', lowCredits: 'Limitado na ang natitirang AI queries', noCredits: 'Ubos na ang credits' },
  },
};
