const fs = require('fs');
let code = fs.readFileSync('src/components/Overview.jsx', 'utf8');

if (!code.includes('useLanguage')) {
  code = code.replace(/import \{ medicines \} from '\.\.\/constants';/, "import { medicines } from '../constants';\nimport { useLanguage } from '../contexts/LanguageContext';");
  code = code.replace(/export default function Overview\(\{ state, updateState, toggleDose, onNavigate \}\) \{/, "export default function Overview({ state, updateState, toggleDose, onNavigate }) {\n  const { t } = useLanguage();");
}

code = code.replace(/TREATMENT ON TRACK/g, "{t('treatmentOnTrack')}");
code = code.replace(/Day <span>/g, "{t('day')} <span>");
code = code.replace(/<\/span> of 180/g, "</span> {t('of')} 180");
code = code.replace(/Intensive phase · Week 7/g, "{t('intensivePhase')}");
code = code.replace(/Started 2 Apr/g, "{t('started')} 2 Apr");
code = code.replace(/26% complete/g, "26% {t('complete')}");
code = code.replace(/Est\. 28 Sep/g, "{t('est')} 28 Sep");
code = code.replace(/>day streak</g, ">{t('dayStreak')}<");
code = code.replace(/Longest streak: 24 days/g, "{t('longestStreak')}: 24 {t('day').toLowerCase()}s");
code = code.replace(/>TODAY</g, ">{t('today')}<");
code = code.replace(/>Your medication</g, ">{t('yourMedication')}<");
code = code.replace(/View schedule/g, "{t('viewSchedule')}");
code = code.replace(/>Morning dose</g, ">{t('morningDose')}<");
code = code.replace(/Take after breakfast · 4 medicines/g, "{t('takeAfterBreakfast')} · 4 {t('medicinesCount')}");
code = code.replace(/\+2 more/g, "+2 {t('more')}");
code = code.replace(/Taken at 8:06 AM/g, "{t('takenAt')} 8:06 AM");
code = code.replace(/Mark as taken/g, "{t('markAsTaken')}");
code = code.replace(/>DAILY CHECK-IN</g, ">{t('dailyCheckIn')}<");
code = code.replace(/>How are you feeling today\?</g, ">{t('howFeeling')}<");
code = code.replace(/>Takes 30 seconds</g, ">{t('takes30Seconds')}<");
code = code.replace(/Continue check-in/g, "{t('continueCheckIn')}");
code = code.replace(/>Your health companion</g, ">{t('healthCompanion')}<");
code = code.replace(/>Online</g, ">{t('online')}<");
code = code.replace(/Hi Amara! How can I support you today\?/g, "{t('chatPreview')}");
code = code.replace(/Start a conversation/g, "{t('startConversation')}");
code = code.replace(/>NEXT APPOINTMENT</g, ">{t('nextAppointment')}<");
code = code.replace(/View details/g, "{t('viewDetails')}");
code = code.replace(/>THIS WEEK</g, ">{t('thisWeek')}<");
code = code.replace(/>Your progress at a glance</g, ">{t('progressAtGlance')}<");
code = code.replace(/>Last 7 days</g, ">{t('last7Days')}<");
code = code.replace(/>Doses taken</g, ">{t('dosesTaken')}<");
code = code.replace(/from last week/g, "{t('fromLastWeek')}");
code = code.replace(/>Health check-ins</g, ">{t('healthCheckIn')}s<");
code = code.replace(/>Keep checking in daily</g, ">{t('keepCheckingIn')}<");
code = code.replace(/>Overall wellbeing</g, ">{t('overallWellbeing')}<");
code = code.replace(/>Stable</g, ">{t('stable')}<");

fs.writeFileSync('src/components/Overview.jsx', code);
console.log('Overview updated');
