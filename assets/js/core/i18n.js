/* ============================================================
   i18n.js — Bilinguisme Français (LTR) / العربية (RTL)
   - t(clé) : chaînes d'interface
   - bi(objet{fr,ar}) : contenu pédagogique bilingue
   - Le changement de langue bascule dir="rtl"/"ltr" et la police.
   ============================================================ */
export const LANGS = ['fr', 'ar'];

const DICT = {
  fr: {
    appName: 'Najma', slogan: 'La boussole de la réussite',
    bienvenue: 'Bienvenue', choisirLangue: 'Choisis ta langue',
    creerProfil: 'Créer un profil', reprendre: 'Reprendre les révisions',
    tonPrenom: 'Ton prénom ou ton pseudo', tonNiveau: 'Ton niveau',
    taSerie: 'Ta série (Bac)', serieObligatoire: 'Choisis ta série pour continuer',
    commencer: 'Commencer', continuer: 'Continuer', nomRequis: 'Écris un prénom pour continuer',
    aujourdhui: "Aujourd'hui", aReviser: 'À réviser aujourd\u2019hui',
    cartes: 'cartes', questions: 'questions', rienAfaire: 'Rien à réviser : reviens demain !',
    serieJours: 'Série de jours', jours: 'jours', etoiles: 'Étoiles', badges: 'Badges',
    matieres: 'Matières', chapitres: 'Chapitres', progression: 'Progression',
    fiche: 'Fiche', exercices: 'Exercices', quiz: 'Quiz', flashcards: 'Flashcards',
    objectifs: 'Objectifs', definitions: 'Définitions & formules clés', exemples: 'Exemples résolus',
    voirCorrection: 'Voir la correction', etapeSuivante: 'Étape suivante', resultat: 'Résultat',
    taReponse: 'Écris ta réponse ici…', verifier: 'Vérifier ma réponse', autoEvaluez: 'Compare ta réponse à la correction puis juge-la', repJuste: 'Ma réponse est correcte', repARevoir: 'À revoir',
    exerciceResolu: 'Je l\u2019ai résolu', bonneReponse: 'Bonne réponse !', mauvaiseReponse: 'Pas encore…',
    explication: 'Explication', score: 'Score', recommencer: 'Recommencer', terminer: 'Terminer',
    suivant: 'Suivant', precedent: 'Précédent', jeSavais: 'Je savais', aRevoir: 'À revoir',
    flip: 'Touche la carte pour la retourner',
    quizParfait: 'Quiz parfait, bravo !', quizFini: 'Quiz terminé', carteMaitrisee: 'cartes maîtrisées',
    examens: 'Examens blancs', commencerExamen: "Commencer l'examen", tempsRestant: 'Temps restant',
    rendre: 'Rendre la copie', confirmerRendre: 'Rendre la copie maintenant ?',
    noteFinale: 'Note finale', correctionDetaillee: 'Correction détaillée',
    autoEvaluation: 'Correction guidée : compte tes points', points: 'pts',
    tempsEcoule: 'Temps écoulé — copie rendue automatiquement.',
    consignes: 'Consignes', duree: 'Durée', bareme: 'Barème', minutes: 'min',
    planning: 'Planificateur de révision', dateExamen: 'Date de ton examen',
    minutesParJour: 'Temps de révision par jour', generer: 'Générer mon planning',
    joursRestants: '{n} jours avant l\u2019examen', planModifie: 'Coche tes tâches au fil des jours',
    dateRequise: 'Choisis une date future', planCree: 'Planning créé ! Bonne route vers la réussite.',
    parent: 'Espace Parent / Enseignant', definirPin: 'Définis un code PIN (4 chiffres)',
    confirmerPin: 'Confirme le code PIN', saisiPin: 'Saisir le code PIN', pinIncorrect: 'Code incorrect',
    pinMismatch: 'Les deux codes sont différents', activiteRecente: 'Dernière activité',
    exporter: 'Exporter ma sauvegarde', importer: 'Importer une sauvegarde',
    exportOk: 'Sauvegarde téléchargée', importOk: 'Sauvegarde importée', importKo: 'Fichier de sauvegarde invalide',
    reglages: 'Réglages', langue: 'Langue', theme: 'Thème', clair: 'Clair', sombre: 'Sombre', auto: 'Automatique',
    taillePolice: 'Taille du texte', petite: 'Petite', moyenne: 'Moyenne', grande: 'Grande',
    profils: 'Profils', changerProfil: 'Changer de profil', ajouterProfil: 'Ajouter un profil',
    supprimerProfil: 'Supprimer ce profil', confirmerSuppression: 'Supprimer ce profil et toute sa progression ?',
    carnet: "Carnet d'erreurs", carnetIntro: 'Rejoue tes erreurs : 2 bonnes réponses de suite et la question sort du carnet.',
    carnetVide: 'Carnet vide — aucune erreur à refaire. Bravo !',
    bientot: 'Bientôt disponible', enRelire: 'En relecture', publie: 'Publié',
    niveau: 'Niveau', matiere: 'Matière', retour: 'Retour', accueil: 'Accueil', menu: 'Menu',
    deMatiere: 'de', stats: 'Mes statistiques', outils: 'Outils',
    leconVue: 'Fiche lue', quizReussi: 'Quiz réussi', examenTermine: 'Examen terminé',
    bacCountdown: 'Compte à rebours', definirDate: 'Définis ta date d\u2019examen dans le planificateur.',
    cycleFondamental: 'Fondamental', cycleCollege: 'Collège (1AS–4AS)', cycleLycee: 'Lycée (5AS–7AS)',
    notesEditeur: 'Point à vérifier (côté éditorial)', phase: 'Phase', reponse: 'Réponse',
    installation: 'Application prête hors ligne', majContenu: 'Contenu mis à jour',
    badge_p1: 'Premier pas', badge_s3: '3 jours d\u2019affilée', badge_s7: '7 jours d\u2019affilée',
    badge_qp: 'Quiz parfait', badge_c20: '20 cartes maîtrisées', badge_ex1: 'Premier examen', badge_cz: 'Carnet nettoyé',
    newBadge: 'Nouveau badge : {b}', courage: 'Chaque jour, une étoile de plus !',
    progreso: 'avancé', secA: 'Partie', votreRep: 'Ta réponse', bonneRep: 'Réponse attendue',
    aucunExamen: 'Aucun examen blanc pour ce niveau pour le moment.',
    confirmerImport: 'Remplacer toutes les données locales par cette sauvegarde ?',
    donneesLocales: 'Toutes tes données restent sur ce téléphone (aucun compte, aucun traceur).',
    storageIdb: 'Stockage : IndexedDB', storageLs: 'Stockage : localStorage (repli)', storageMem: 'Stockage : mémoire (session)',
  },
  ar: {
    appName: 'نجمة', slogan: 'بوصلة النجاح',
    bienvenue: 'مرحباً', choisirLangue: 'اختر لغتك',
    creerProfil: 'إنشاء ملف', reprendre: 'استئناف المراجعة',
    tonPrenom: 'اسمك أو لقبك', tonNiveau: 'مستواك الدراسي',
    taSerie: 'شعبتك (البكالوريا)', serieObligatoire: 'اختر شعبتك للمتابعة',
    commencer: 'ابدأ', continuer: 'متابعة', nomRequis: 'اكتب اسمك للمتابعة',
    aujourdhui: 'اليوم', aReviser: 'للمراجعة اليوم',
    cartes: 'بطاقة', questions: 'أسئلة', rienAfaire: 'لا شيء للمراجعة: عِد غداً!',
    serieJours: 'متتابعة الأيام', jours: 'أيام', etoiles: 'نجوم', badges: 'الشارات',
    matieres: 'المواد', chapitres: 'الدروس', progression: 'التقدم',
    fiche: 'بطاقة تلخيصية', exercices: 'تمارين', quiz: 'اختبار قصير', flashcards: 'بطاقات التعلم',
    objectifs: 'الأهداف', definitions: 'التعاريف والصيغ الأساسية', exemples: 'أمثلة محلولة',
    voirCorrection: 'إظهار التصحيح', etapeSuivante: 'الخطوة الموالية', resultat: 'النتيجة',
    taReponse: 'اكتب إجابتك هنا…', verifier: 'تحقق من إجابتي', autoEvaluez: 'قارن إجابتك بالتصحيح ثم احكم عليها', repJuste: 'إجابتي صحيحة', repARevoir: 'يحتاج مراجعة',
    exerciceResolu: 'أنجزته بنفسي', bonneReponse: 'إجابة صحيحة!', mauvaiseReponse: 'ليس بعد…',
    explication: 'التوضيح', score: 'النتيجة', recommencer: 'إعادة', terminer: 'إنهاء',
    suivant: 'التالي', precedent: 'السابق', jeSavais: 'كنت أعرف', aRevoir: 'للمراجعة',
    flip: 'انقر على البطاقة لتقلبها',
    quizParfait: 'اختبار كامل، أحسنت!', quizFini: 'انتهى الاختبار', carteMaitrisee: 'بطاقة تمكنت منها',
    examens: 'الامتحانات التجريبية', commencerExamen: 'بدء الامتحان', tempsRestant: 'الوقت المتبقي',
    rendre: 'تسليم الورقة', confirmerRendre: 'تسليم الورقة الآن؟',
    noteFinale: 'العلامة النهائية', correctionDetaillee: 'التصحيح المفصل',
    autoEvaluation: 'تصحيح موجَّه: احسب نقاطك', points: 'ن',
    tempsEcoule: 'انتهى الوقت — تم تسليم الورقة تلقائياً.',
    consignes: 'التعليمات', duree: 'المدة', bareme: 'سلّم التنقيط', minutes: 'د',
    planning: 'مخطط المراجعة', dateExamen: 'تاريخ امتحانك',
    minutesParJour: 'وقت المراجعة اليومي', generer: 'توليد خطتي',
    joursRestants: '{n} يوماً قبل الامتحان', planModifie: 'علّم مهامك يوماً بيوم',
    dateRequise: 'اختر تاريخاً مستقبلياً', planCree: 'تم إنشاء الخطة! طريقك نحو النجاح.',
    parent: 'فضاء الوالدين / المدرس', definirPin: 'حدد رمزاً سرياً (4 أرقام)',
    confirmerPin: 'أكد الرمز السري', saisiPin: 'أدخل الرمز السري', pinIncorrect: 'رمز خاطئ',
    pinMismatch: 'الرمزان مختلفان', activiteRecente: 'آخر نشاط',
    exporter: 'تصدير نسخة احتياطية', importer: 'استيراد نسخة احتياطية',
    exportOk: 'تم تحميل النسخة الاحتياطية', importOk: 'تم استيراد النسخة', importKo: 'ملف النسخة غير صالح',
    reglages: 'الإعدادات', langue: 'اللغة', theme: 'المظهر', clair: 'فاتح', sombre: 'داكن', auto: 'تلقائي',
    taillePolice: 'حجم النص', petite: 'صغير', moyenne: 'متوسط', grande: 'كبير',
    profils: 'الملفات', changerProfil: 'تغيير الملف', ajouterProfil: 'إضافة ملف',
    supprimerProfil: 'حذف هذا الملف', confirmerSuppression: 'حذف هذا الملف وتقدمه كاملاً؟',
    carnet: 'دفتر الأخطاء', carnetIntro: 'أعد اللعب على أخطائك: إجابتان صحيحتان متتاليتان لإخراج السؤال من الدفتر.',
    carnetVide: 'الدفتر فارغ — لا أخطاء لإعادتها. أحسنت!',
    bientot: 'قريباً', enRelire: 'قيد التدقيق', publie: 'منشور',
    niveau: 'المستوى', matiere: 'المادة', retour: 'رجوع', accueil: 'الرئيسية', menu: 'القائمة',
    deMatiere: 'من', stats: 'إحصاءاتي', outils: 'الأدوات',
    leconVue: 'البطاقة مقروءة', quizReussi: 'الاختبار ناجح', examenTermine: 'الامتحان منجز',
    bacCountdown: 'العد التنازلي', definirDate: 'حدد تاريخ امتحانك في المخطط.',
    cycleFondamental: 'أساسي', cycleCollege: 'إعدادي (1AS–4AS)', cycleLycee: 'ثانوي (5AS–7AS)',
    notesEditeur: 'نقطة للتحقق (تحريرياً)', phase: 'مرحلة', reponse: 'الإجابة',
    installation: 'التطبيق جاهز للعمل دون اتصال', majContenu: 'تم تحديث المحتوى',
    badge_p1: 'الخطوة الأولى', badge_s3: '3 أيام متتابعة', badge_s7: '7 أيام متتابعة',
    badge_qp: 'اختبار كامل', badge_c20: '20 بطاقة متمكن', badge_ex1: 'أول امتحان', badge_cz: 'دفتر منظف',
    newBadge: 'شارة جديدة: {b}', courage: 'كل يوم نجمة جديدة!',
    progreso: 'تقدَّم', secA: 'الجزء', votreRep: 'إجابتك', bonneRep: 'الإجابة الصحيحة',
    aucunExamen: 'لا يوجد امتحان تجريبي لهذا المستوى حالياً.',
    confirmerImport: 'استبدال جميع البيانات المحلية بهذه النسخة الاحتياطية؟',
    donneesLocales: 'جميع بياناتك تبقى في هذا الهاتف (بدون حساب وبدون متتبعات).',
    storageIdb: 'التخزين: IndexedDB', storageLs: 'التخزين: localStorage (بديل)', storageMem: 'التخزين: الذاكرة (جلسة)',
  },
};

let lang = 'fr';

/** Change la langue et bascule la direction du document. */
export function setLang(l) {
  lang = (l === 'ar') ? 'ar' : 'fr';
  if (typeof document === 'undefined') return; // environnement hors navigateur (tests)
  const de = document.documentElement;
  de.lang = lang;
  de.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  document.body?.setAttribute('dir', de.dir);
  document.body?.setAttribute('lang', lang);
}

export function getLang() { return lang; }

/** Chaîne d'interface traduite ; remplace {var}. */
export function t(key, vars) {
  const s = (DICT[lang] && DICT[lang][key]) ?? DICT.fr[key] ?? key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? '')) : s;
}

/** Contenu bilingue {fr, ar} → chaîne dans la langue active. */
export function bi(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.fr || obj.ar || '';
}

/** Formatage numérique local (chiffres latins en arabe mauritanien aussi). */
export function nf(n) {
  try { return new Intl.NumberFormat(lang === 'ar' ? 'ar-MR-u-nu-latn' : 'fr-FR').format(n); }
  catch { return String(n); }
}

/** Date locale au format court (ex: 24/11/2026). */
export function dfDate(iso) {
  try { return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MR-u-nu-latn' : 'fr-FR').format(new Date(iso + 'T12:00:00')); }
  catch { return iso; }
}
