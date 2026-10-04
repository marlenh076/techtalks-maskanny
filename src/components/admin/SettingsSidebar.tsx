'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Sliders, 
  User, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Save, 
  Lock, 
  LogOut, 
  Mail, 
  Phone, 
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';

type SettingsTab = 'GENERAL' | 'ACCOUNT' | 'NOTIFICATIONS' | 'SECURITY' | 'PLATFORM';
type SupportedLanguage = 'EN' | 'AR' | 'FR';

const translations = {
  EN: {
    languageLabel: 'Language',
    general: 'General',
    account: 'Account & Profile',
    notifications: 'Notifications',
    security: 'Security',
    platform: 'Platform Settings',
    saveChanges: 'Save Changes',
    toastSuccess: 'Settings updated successfully!',
    toastFooter: 'Be sure to save your modifications before leaving this section.',
    
    genTitle: 'General Configuration',
    genDesc: 'Manage your core platform identity, logos, and public contact information.',
    platformName: 'Platform Name',
    supportPhone: 'Support Phone Number',
    platformDesc: 'Platform Description',
    contactEmail: 'Contact Email',
    platformLogo: 'Platform Logo',
    changeLogo: 'Change Logo',

    accTitle: 'Account & Profile',
    accDesc: 'Update your administrator credentials and session preferences.',
    adminName: 'Admin Name',
    emailAddress: 'Email Address',
    profilePic: 'Profile Picture',
    uploadAvatar: 'Upload New Avatar',
    changePassword: 'Change Password',
    logoutSession: 'Logout Session',

    notifTitle: 'Notification Preferences',
    notifDesc: 'Choose which events trigger instant admin alerts and emails.',
    notif1Label: 'New listing submitted',
    notif1Desc: 'Alert when a landlord or property host submits a new unit for review.',
    notif2Label: 'Listing reported',
    notif2Desc: 'Alert when users flag an existing housing listing for violations.',
    notif3Label: 'New user registered',
    notif3Desc: 'Alert when a new student candidate or property host creates an account.',
    notif4Label: 'New review reported',
    notif4Desc: 'Alert when a review or rating is disputed or flagged by the community.',
    notif5Label: 'System alerts',
    notif5Desc: 'Important server performance, uptime, and database security notifications.',

    secTitle: 'Security & Compliance',
    secDesc: 'Protect administrator access with multi-factor auth and strict log audits.',
    sec1Label: 'Two-Factor Authentication (2FA)',
    sec1Desc: 'Require authenticator app verification upon login.',
    sec2Label: 'Active Login/Session Management',
    sec2Desc: 'Track and automatically expire idle sessions across devices.',
    sec3Label: 'Admin Activity & Audit Logs',
    sec3Desc: 'Log every administrative action (listing approvals, user suspensions).',
    updatePasswordBtn: 'Update Admin Password',

    platTitle: 'Platform Settings & Defaults',
    platDesc: 'Configure global currencies, languages, and user workflow rules.',
    defaultLang: 'Default Language',
    defaultCurr: 'Default Currency',
    listingStatus: 'Default Listing Status on Submission',
    reviewMod: 'Review Moderation Settings',
    userRegPolicy: 'User Registration Policy',
  },
  AR: {
    languageLabel: 'اللغة',
    general: 'العام',
    account: 'الحساب والملف الشخصي',
    notifications: 'الإشعارات',
    security: 'الأمان',
    platform: 'إعدادات المنصة',
    saveChanges: 'حفظ التغييرات',
    toastSuccess: 'تم تحديث الإعدادات بنجاح!',
    toastFooter: 'تأكد من حفظ التعديلات قبل مغادرة هذه الصفحة.',
    
    genTitle: 'الإعدادات العامة',
    genDesc: 'إدارة هوية المنصة الأساسية، الشعارات، ومعلومات الاتصال العامة.',
    platformName: 'اسم المنصة',
    supportPhone: 'رقم هاتف الدعم',
    platformDesc: 'وصف المنصة',
    contactEmail: 'البريد الإلكتروني للاتصال',
    platformLogo: 'شعار المنصة',
    changeLogo: 'تغيير الشعار',

    accTitle: 'الحساب والملف الشخصي',
    accDesc: 'تحديث بيانات اعتماد المشرف وتفضيلات الجلسة.',
    adminName: 'اسم المشرف',
    emailAddress: 'البريد الإلكتروني',
    profilePic: 'الصورة الشخصية',
    uploadAvatar: 'رفع صورة جديدة',
    changePassword: 'تغيير كلمة المرور',
    logoutSession: 'تسجيل خروج الجلسة',

    notifTitle: 'تفضيلات الإشعارات',
    notifDesc: 'اختر الأحداث التي تؤدي إلى تنبيهات فورية ورسائل بريد إلكتروني للمشرف.',
    notif1Label: 'تم إرسال عقار جديد',
    notif1Desc: 'تنبيه عندما يقوم مالك العقار بإرسال وحدة جديدة للمراجعة.',
    notif2Label: 'الإبلاغ عن عقار',
    notif2Desc: 'تنبيه عندما يقوم المستخدمون بالإبلاغ عن انتهاكات في عقار مدرج.',
    notif3Label: 'تسجيل مستخدم جديد',
    notif3Desc: 'تنبيه عندما يقوم طالب أو مالك جديد بإنشاء حساب.',
    notif4Label: 'الإبلاغ عن تقييم جديد',
    notif4Desc: 'تنبيه عندما يتم الطعن في تقييم أو الإبلاغ عنه بواسطة المجتمع.',
    notif5Label: 'تنبيهات النظام',
    notif5Desc: 'إشعارات أداء الخادم الهامة ووقت التشغيل وأمان قاعدة البيانات.',

    secTitle: 'الأمان والامتثال',
    secDesc: 'حماية وصول المشرف باستخدام المصادقة الثنائية ومراجعات السجلات الصارمة.',
    sec1Label: 'المصادقة الثنائية (2FA)',
    sec1Desc: 'طلب التحقق من تطبيق المصادقة عند تسجيل الدخول.',
    sec2Label: 'إدارة تسجيل الدخول الجلسات النشطة',
    sec2Desc: 'تتبع وانتهاء صلاحية الجلسات غير النشطة تلقائيًا عبر الأجهزة.',
    sec3Label: 'سجلات نشاط المشرف والتدقيق',
    sec3Desc: 'تسجيل كل إجراء إداري (موافقات العقارات، تعليق المستخدمين).',
    updatePasswordBtn: 'تحديث كلمة مرور المشرف',

    platTitle: 'إعدادات المنصة والافتراضيات',
    platDesc: 'تكوين العملات العالمية، اللغات، وقواعد سير عمل المستخدم.',
    defaultLang: 'اللغة الافتراضية',
    defaultCurr: 'العملة الافتراضية',
    listingStatus: 'حالة العقار الافتراضية عند الإرسال',
    reviewMod: 'إعدادات الإشراف على التقييمات',
    userRegPolicy: 'سياسة تسجيل المستخدمين',
  },
  FR: {
    languageLabel: 'Langue',
    general: 'Général',
    account: 'Compte & Profil',
    notifications: 'Notifications',
    security: 'Sécurité',
    platform: 'Paramètres de la Plateforme',
    saveChanges: 'Enregistrer les modifications',
    toastSuccess: 'Paramètres mis à jour avec succès !',
    toastFooter: 'Assurez-vous d’enregistrer vos modifications avant de quitter cette section.',
    
    genTitle: 'Configuration Générale',
    genDesc: 'Gérez l’identité principale de votre plateforme, les logos et les coordonnées publiques.',
    platformName: 'Nom de la Plateforme',
    supportPhone: 'Numéro de Téléphone du Support',
    platformDesc: 'Description de la Plateforme',
    contactEmail: 'Email de Contact',
    platformLogo: 'Logo de la Plateforme',
    changeLogo: 'Changer le Logo',

    accTitle: 'Compte & Profil',
    accDesc: 'Mettez à jour vos identifiants d’administrateur et vos préférences de session.',
    adminName: 'Nom de l’Administrateur',
    emailAddress: 'Adresse E-mail',
    profilePic: 'Photo de Profil',
    uploadAvatar: 'Télécharger un Nouvel Avatar',
    changePassword: 'Changer le Mot de Passe',
    logoutSession: 'Fermer la Session',

    notifTitle: 'Préférences de Notification',
    notifDesc: 'Choisissez quels événements déclenchent des alertes et e-mails instantanés.',
    notif1Label: 'Nouvelle annonce soumise',
    notif1Desc: 'Alerte lorsqu’un propriétaire soumet une nouvelle unité pour examen.',
    notif2Label: 'Annonce signalée',
    notif2Desc: 'Alerte lorsque des utilisateurs signalent une violation sur une annonce.',
    notif3Label: 'Nouvel utilisateur enregistré',
    notif3Desc: 'Alerte lorsqu’un nouvel étudiant ou propriétaire crée un compte.',
    notif4Label: 'Nouvel avis signalé',
    notif4Desc: 'Alerte lorsqu’un avis ou une note est contesté par la communauté.',
    notif5Label: 'Alertes système',
    notif5Desc: 'Notifications importantes sur les performances et la sécurité.',

    secTitle: 'Sécurité & Conformité',
    secDesc: 'Protégez l’accès administrateur avec l’authentification multifacteur.',
    sec1Label: 'Authentification à Deux Facteurs (2FA)',
    sec1Desc: 'Exiger une vérification par application d’authentification.',
    sec2Label: 'Gestion des Sessions Actives',
    sec2Desc: 'Suivre et expirer automatiquement les sessions inactives.',
    sec3Label: 'Journaux d’Activité et d’Audit',
    sec3Desc: 'Enregistrer chaque action administrative.',
    updatePasswordBtn: 'Mettre à jour le Mot de Passe Admin',

    platTitle: 'Paramètres & Valeurs par Défaut',
    platDesc: 'Configurez les devises mondiales, les langues et les règles de workflow.',
    defaultLang: 'Langue par Défaut',
    defaultCurr: 'Devise par Défaut',
    listingStatus: 'Statut par Défaut de l’Annonce à la Soumission',
    reviewMod: 'Paramètres de Modération des Avis',
    userRegPolicy: 'Politique d’Inscription des Utilisateurs',
  }
};

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('EN');
  
  
  const [dateFilter, setDateFilter] = useState('ALL');


  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);


  const [logoSrc, setLogoSrc] = useState('/favicon.svg');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [platformName, setPlatformName] = useState('Maskanny');
  const [platformDesc, setPlatformDesc] = useState('Student housing & accommodation platform for university candidates.');
  const [contactEmail, setContactEmail] = useState('support@maskanny.com');
  const [supportPhone, setSupportPhone] = useState('+961 70 123 456');

  const [adminName, setAdminName] = useState('System Administrator');
  const [adminEmail, setAdminEmail] = useState('admin@maskanny.com');

  const [notifs, setNotifs] = useState({
    newListing: true,
    listingReported: true,
    newUserReg: false,
    reviewReported: true,
    systemAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    activeSessions: true,
    auditLogs: true,
  });

  const [platformConfig, setPlatformConfig] = useState({
    defaultLang: 'EN' as SupportedLanguage,
    currency: 'USD',
    defaultListingStatus: 'PENDING',
    reviewModeration: 'AUTO_FILTER',
    userRegistration: 'OPEN',
  });

  const t = translations[currentLang];
  const isRtl = currentLang === 'AR';

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(t.toastSuccess);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoSrc(url);
      triggerToast('Platform logo updated successfully!');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
      triggerToast('Admin avatar updated successfully!');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast('New passwords do not match!');
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Admin password updated successfully!');
  };

  return (
    <div className={`flex flex-col gap-6 w-full flex-1 relative ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-brand-slate/15 shadow-xs">
      
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">{t.languageLabel}:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-brand-light p-1 rounded-xl border border-brand-slate/15">
            {[
              { code: 'EN', label: 'English' },
              { code: 'AR', label: 'العربية' },
              { code: 'FR', label: 'Français' },
            ].map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code as SupportedLanguage);
                    setPlatformConfig(prev => ({ ...prev, defaultLang: lang.code as SupportedLanguage }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-brand-slate hover:text-brand-navy'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    
      {savedToast && (
        <div className={`absolute top-16 ${isRtl ? 'left-0' : 'right-0'} z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-bold animate-fade-in`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

  
      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />


      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-brand-slate/15 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-brand-slate/10 pb-3">
              <div className="flex items-center gap-2 text-brand-navy">
                <Lock className="w-4 h-4 text-brand-navy" />
                <h4 className="text-sm font-bold">{t.updatePasswordBtn}</h4>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg hover:bg-brand-light text-brand-slate cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
           
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 text-brand-slate hover:text-brand-navy cursor-pointer focus:outline-hidden"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-brand-slate hover:text-brand-navy cursor-pointer focus:outline-hidden"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-brand-slate">Must be at least 8 characters long.</p>
              </div>

           
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-brand-slate hover:text-brand-navy cursor-pointer focus:outline-hidden"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-slate/10">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-brand-slate bg-brand-light hover:bg-brand-light/80 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy/90 cursor-pointer shadow-xs transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-slate/15 scrollbar-none">
        {[
          { id: 'GENERAL', label: t.general, icon: Sliders },
          { id: 'ACCOUNT', label: t.account, icon: User },
          { id: 'NOTIFICATIONS', label: t.notifications, icon: Bell },
          { id: 'SECURITY', label: t.security, icon: ShieldCheck },
          { id: 'PLATFORM', label: t.platform, icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-brand-slate hover:text-brand-navy border border-brand-slate/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'GENERAL' && (
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">{t.genTitle}</h3>
              <p className="text-xs text-brand-slate">{t.genDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.platformName}</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.supportPhone}</label>
                <div className="relative flex items-center">
                  <Phone className={`w-4 h-4 text-brand-slate absolute ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'} py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-brand-navy">{t.platformDesc}</label>
                <textarea
                  rows={3}
                  value={platformDesc}
                  onChange={(e) => setPlatformDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.contactEmail}</label>
                <div className="relative flex items-center">
                  <Mail className={`w-4 h-4 text-brand-slate absolute ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-9 pl-3.5' : 'pl-9 pr-3.5'} py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.platformLogo}</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-brand-light border border-brand-slate/20 flex items-center justify-center shrink-0 overflow-hidden">
                    <Image
                      src="\Maskanny.svg"
                      alt="Maskanny Logo"
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-light hover:bg-brand-light/80 text-brand-navy rounded-xl text-xs font-bold border border-brand-slate/15 transition-all cursor-pointer"
                  >
                    {t.changeLogo}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ACCOUNT' && (
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">{t.accTitle}</h3>
              <p className="text-xs text-brand-slate">{t.accDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.adminName}</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.emailAddress}</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy focus:outline-brand-navy"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-brand-navy">{t.profilePic}</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
                    ) : (
                      'SA'
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-light hover:bg-brand-light/80 text-brand-navy rounded-xl text-xs font-bold border border-brand-slate/15 transition-all cursor-pointer"
                  >
                    {t.uploadAvatar}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-slate/10 flex flex-wrap gap-3">
              <button 
                type="button" 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-navy bg-brand-light hover:bg-brand-light/80 border border-brand-slate/20 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                {t.changePassword}
              </button>
              <button 
                type="button" 
                onClick={() => triggerToast('Logged out of active session safely.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logoutSession}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">{t.notifTitle}</h3>
              <p className="text-xs text-brand-slate">{t.notifDesc}</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'newListing', label: t.notif1Label, desc: t.notif1Desc },
                { key: 'listingReported', label: t.notif2Label, desc: t.notif2Desc },
                { key: 'newUserReg', label: t.notif3Label, desc: t.notif3Desc },
                { key: 'reviewReported', label: t.notif4Label, desc: t.notif4Desc },
                { key: 'systemAlerts', label: t.notif5Label, desc: t.notif5Desc },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-brand-light/50 border border-brand-slate/10">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-brand-navy">{item.label}</div>
                    <div className="text-[11px] text-brand-slate">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs[item.key as keyof typeof notifs]}
                    onChange={(e) => setNotifs({ ...notifs, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-navy accent-brand-navy cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">{t.secTitle}</h3>
              <p className="text-xs text-brand-slate">{t.secDesc}</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'twoFactor', label: t.sec1Label, desc: t.sec1Desc },
                { key: 'activeSessions', label: t.sec2Label, desc: t.sec2Desc },
                { key: 'auditLogs', label: t.sec3Label, desc: t.sec3Desc },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-brand-light/50 border border-brand-slate/10">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-brand-navy">{item.label}</div>
                    <div className="text-[11px] text-brand-slate">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securitySettings[item.key as keyof typeof securitySettings]}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-navy accent-brand-navy cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'PLATFORM' && (
          <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">{t.platTitle}</h3>
              <p className="text-xs text-brand-slate">{t.platDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.defaultLang}</label>
                <select
                  value={platformConfig.defaultLang}
                  onChange={(e) => {
                    const lang = e.target.value as SupportedLanguage;
                    setPlatformConfig({ ...platformConfig, defaultLang: lang });
                    setCurrentLang(lang);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy bg-white focus:outline-brand-navy"
                >
                  <option value="EN">English</option>
                  <option value="AR">العربية</option>
                  <option value="FR">Français</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.defaultCurr}</label>
                <select
                  value={platformConfig.currency}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy bg-white focus:outline-brand-navy"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="LBP">LBP (L£)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.listingStatus}</label>
                <select
                  value={platformConfig.defaultListingStatus}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, defaultListingStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy bg-white focus:outline-brand-navy"
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Auto-Approved</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-navy">{t.reviewMod}</label>
                <select
                  value={platformConfig.reviewModeration}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, reviewModeration: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-slate/20 text-xs font-medium text-brand-navy bg-white focus:outline-brand-navy"
                >
                  <option value="AUTO_FILTER">Auto-Filter Profanity</option>
                  <option value="MANUAL">Manual Admin Approval</option>
                  <option value="NONE">No Moderation</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-brand-slate/15 shadow-xs">
          <span className="text-xs text-brand-slate">{t.toastFooter}</span>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy/90 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {t.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}