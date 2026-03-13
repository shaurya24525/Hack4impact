import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { welcome: 'BetterWeb', startVoice: 'Start Listening', processCommand: 'Process', formPlaceholder: 'Dictated Form' } },
    hi: { translation: { welcome: 'बेटरवेब', startVoice: 'सुनना शुरू करें', processCommand: 'प्रोसेस', formPlaceholder: 'डिक्टेटेड फॉर्म' } },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;