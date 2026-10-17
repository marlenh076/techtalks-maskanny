"use client";
import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { User, ShieldCheck, Globe, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/src/features/admin/client/api";
import { useAdminAction } from "@/src/features/admin/client/hooks";
import { useAdminSession } from "./AdminAccessGuard";
import { AdminModal, QueryState, buttonClass, inputClass } from "./AdminUI";

const labels = {
  EN: {
    account: "Account & Profile",
    security: "Security",
    save: "Save Changes",
    first: "First name",
    last: "Last name",
    email: "Email Address",
    avatar: "Upload New Avatar",
    password: "Change Password",
    logout: "Logout Session",
  },
  AR: {
    account: "الحساب والملف الشخصي",
    security: "الأمان",
    save: "حفظ التغييرات",
    first: "الاسم الأول",
    last: "اسم العائلة",
    email: "البريد الإلكتروني",
    avatar: "رفع صورة جديدة",
    password: "تغيير كلمة المرور",
    logout: "تسجيل الخروج",
  },
  FR: {
    account: "Compte & Profil",
    security: "Sécurité",
    save: "Enregistrer les modifications",
    first: "Prénom",
    last: "Nom",
    email: "Adresse E-mail",
    avatar: "Télécharger un Nouvel Avatar",
    password: "Changer le Mot de Passe",
    logout: "Fermer la Session",
  },
};
type Language = keyof typeof labels;
function AccountForm({
  language,
  onPassword,
  onMessage,
}: {
  language: Language;
  onPassword: () => void;
  onMessage: (value: string) => void;
}) {
  const { profile, refresh, logout, loggingOut } = useAdminSession();
  const t = labels[language];
  const [firstname, setFirstname] = useState(profile.firstname),
    [lastname, setLastname] = useState(profile.lastname),
    [email, setEmail] = useState(profile.email);
  const names = useAdminAction(),
    emailAction = useAdminAction(),
    avatar = useAdminAction();
  const busy = names.pending || emailAction.pending || avatar.pending || loggingOut;
  const [fileError, setFileError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function saveNames(event: FormEvent) {
    event.preventDefault();
    onMessage("");
    const result = await names.run(() => adminApi.names(firstname.trim(), lastname.trim()));
    if (result.ok) {
      onMessage("Profile saved.");
      refresh();
    }
  }
  async function saveEmail(event: FormEvent) {
    event.preventDefault();
    onMessage("");
    const result = await emailAction.run(() => adminApi.email(email.trim()));
    if (result.ok) {
      onMessage(
        result.value.confirmation_required
          ? `Email change requested for ${result.value.requested_email}. Complete the confirmation steps sent by Supabase Auth; your current email remains ${result.value.email}.`
          : "Email updated.",
      );
      refresh();
    }
  }
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider">{t.account}</h3>
        <p className="text-xs text-brand-slate">
          Manage your personal Admin credentials and profile.
        </p>
      </div>
      <form className="space-y-4" onSubmit={saveNames}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="text-xs font-bold">
            {t.first}
            <input
              required
              maxLength={100}
              value={firstname}
              disabled={busy}
              onChange={(event) => setFirstname(event.target.value)}
              className={inputClass + " mt-2"}
            />
          </label>
          <label className="text-xs font-bold">
            {t.last}
            <input
              required
              maxLength={100}
              value={lastname}
              disabled={busy}
              onChange={(event) => setLastname(event.target.value)}
              className={inputClass + " mt-2"}
            />
          </label>
        </div>
        <QueryState error={names.error} />
        <button
          disabled={
            busy ||
            !firstname.trim() ||
            !lastname.trim() ||
            (firstname === profile.firstname && lastname === profile.lastname)
          }
          className={buttonClass}
        >
          {names.pending ? "Saving…" : t.save}
        </button>
      </form>
      <form className="space-y-3 border-t border-brand-slate/10 pt-4" onSubmit={saveEmail}>
        <label className="block text-xs font-bold">
          {t.email}
          <input
            type="email"
            required
            maxLength={254}
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass + " mt-2"}
          />
        </label>
        <p className="text-xs text-brand-slate">
          Email is saved separately and may require confirmation.
        </p>
        <QueryState error={emailAction.error} />
        <button disabled={busy || email.trim() === profile.email} className={buttonClass}>
          {emailAction.pending ? "Requesting…" : "Update email"}
        </button>
      </form>
      <div className="space-y-2 border-t border-brand-slate/10 pt-4">
        <p className="text-xs font-bold">Profile Picture</p>
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
            {profile.avatar_url ? (
              <Image
                unoptimized
                src={profile.avatar_url}
                alt="Admin avatar"
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              profile.firstname.charAt(0) + profile.lastname.charAt(0)
            )}
          </div>
          <input
            type="file"
            ref={input}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            aria-label="Choose Admin avatar"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file || busy) return;
              onMessage("");
              if (
                file.size > 2097152 ||
                !["image/png", "image/jpeg", "image/webp"].includes(file.type)
              ) {
                setFileError("Choose a PNG, JPEG or WebP image up to 2 MiB.");
                event.target.value = "";
                return;
              }
              setFileError("");
              const result = await avatar.run(() => adminApi.avatar(file));
              if (result.ok) {
                onMessage("Avatar saved.");
                refresh();
              }
              if (input.current) input.current.value = "";
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="px-4 py-2 bg-brand-light rounded-xl text-xs font-bold border border-brand-slate/15 disabled:opacity-50"
          >
            {avatar.pending ? "Uploading…" : t.avatar}
          </button>
        </div>
        <p className="text-xs text-brand-slate">PNG, JPEG or WebP · Up to 2 MiB</p>
        <QueryState error={fileError || avatar.error} />
      </div>
      <div className="pt-4 border-t border-brand-slate/10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPassword}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-light border border-brand-slate/20"
        >
          <Lock className="w-3.5 h-3.5" />
          {t.password}
        </button>
        <button
          type="button"
          disabled={loggingOut}
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          {loggingOut ? "Logging out…" : t.logout}
        </button>
      </div>
    </div>
  );
}
function PasswordDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [nonce, setNonce] = useState("");
  const [show, setShow] = useState(false);
  const [validation, setValidation] = useState("");
  const action = useAdminAction();
  return (
    <AdminModal title="Change Admin Password" onClose={onClose} busy={action.pending}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (password !== confirm) {
            setValidation("New passwords do not match.");
            return;
          }
          setValidation("");
          const result = await action.run(() =>
            adminApi.password(current, password, nonce.trim() || undefined),
          );
          if (result.ok) onSaved();
        }}
      >
        {[
          {
            id: "current-password",
            label: "Current Password",
            value: current,
            set: setCurrent,
            auto: "current-password",
          },
          {
            id: "new-password",
            label: "New Password",
            value: password,
            set: setPassword,
            auto: "new-password",
          },
          {
            id: "confirm-password",
            label: "Confirm New Password",
            value: confirm,
            set: setConfirm,
            auto: "new-password",
          },
        ].map((field) => (
          <label key={field.id} htmlFor={field.id} className="block text-xs font-bold">
            {field.label}
            <input
              id={field.id}
              required
              type={show ? "text" : "password"}
              autoComplete={field.auto}
              minLength={field.id === "current-password" ? 1 : 8}
              maxLength={field.id === "current-password" ? 1024 : 128}
              value={field.value}
              disabled={action.pending}
              onChange={(event) => field.set(event.target.value)}
              className={inputClass + " mt-2"}
            />
          </label>
        ))}
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="flex items-center gap-2 text-xs text-brand-slate"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {show ? "Hide passwords" : "Show passwords"}
        </button>
        <p className="text-xs text-brand-slate">
          Use at least 8 characters. Supabase Auth may apply additional password and
          reauthentication requirements.
        </p>
        <label className="block text-xs font-bold">
          Reauthentication code (if requested)
          <input
            maxLength={100}
            value={nonce}
            onChange={(event) => setNonce(event.target.value)}
            className={inputClass + " mt-2"}
          />
        </label>
        <QueryState error={validation || action.error} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={action.pending}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-light text-xs font-bold"
          >
            Cancel
          </button>
          <button disabled={action.pending || password === current} className={buttonClass}>
            {action.pending ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
export default function SettingsView() {
  const [language, setLanguage] = useState<Language>("EN"),
    [tab, setTab] = useState<"ACCOUNT" | "SECURITY">("ACCOUNT");
  const [message, setMessage] = useState(""),
    [password, setPassword] = useState(false);
  const { profile } = useAdminSession();
  const t = labels[language];
  const tabs = [
    { id: "ACCOUNT", label: t.account, icon: User },
    { id: "SECURITY", label: t.security, icon: ShieldCheck },
  ] as const;
  return (
    <div
      className="flex flex-col gap-6 w-full flex-1 relative"
      dir={language === "AR" ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-brand-slate/15 shadow-xs">
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold">Language:</span>
        <div className="flex gap-1.5 bg-brand-light p-1 rounded-xl">
          {[
            { id: "EN", label: "English" },
            { id: "AR", label: "العربية" },
            { id: "FR", label: "Français" },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setLanguage(item.id as Language)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${language === item.id ? "bg-brand-navy text-white" : "text-brand-slate"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {message && (
        <p
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-slate/15">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMessage("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 ${tab === item.id ? "bg-brand-navy text-white shadow-sm" : "bg-white text-brand-slate border border-brand-slate/15"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
      {tab === "ACCOUNT" ? (
        <AccountForm
          key={profile.firstname + "|" + profile.lastname + "|" + profile.email}
          language={language}
          onPassword={() => {
            setMessage("");
            setPassword(true);
          }}
          onMessage={setMessage}
        />
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-brand-slate/15 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase">{t.security}</h3>
          <p className="text-sm text-brand-slate">
            Admin authorization and audit logging are enforced by the server. Two-factor and
            cross-device session-management controls are unavailable in this Dashboard.
          </p>
          <button type="button" onClick={() => setPassword(true)} className={buttonClass}>
            {t.password}
          </button>
        </div>
      )}
      {password && (
        <PasswordDialog
          onClose={() => setPassword(false)}
          onSaved={() => {
            setPassword(false);
            setMessage("Password updated.");
          }}
        />
      )}
    </div>
  );
}
