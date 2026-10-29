import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import AccountLayout, { SectionHeader } from "../account/AccountLayout";
import { Avatar, Button, Card, cx, Field, Input, Skeleton } from "../admin/ui/primitives";
import { errorMessage } from "../admin/lib/adminApi";
import { compressImage } from "../admin/lib/compressImage";
import { useProfile, useSaveProfile } from "../../lib/accountApi";
import { openCookieSettings } from "../../lib/consent";
import { logout } from "../../redux/slices/authSlice";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import NotificationPreferences from "./NotificationPreferences";
import { Bell, Camera, ChevronRight, Cookie, Lock, LogOut, Mail, ShieldCheck } from "../ui/icons";

const FIELDS = ["first_name", "last_name", "username", "phone"];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { data: profile, isLoading } = useProfile();
  const { save } = useSaveProfile();

  const [form, setForm] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null);
  const fileRef = useRef(null);

  const original = useMemo(
    () => (profile ? Object.fromEntries(FIELDS.map((k) => [k, profile[k] || (k === "username" ? user?.username || "" : "")])) : null),
    [profile, user]
  );
  useEffect(() => {
    if (original && !form) setForm(original);
  }, [original, form]);

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => photoPreview && URL.revokeObjectURL(photoPreview), [photoPreview]);

  const dirty = !!photo || (form && original && FIELDS.some((k) => (form[k] || "") !== (original[k] || "")));
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const pickPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    setPhoto(await compressImage(file));
  };

  const discard = () => {
    setForm(original);
    setPhoto(null);
    setErrors({});
  };

  const submit = async (e) => {
    e?.preventDefault();
    const er = {};
    if (!form.username.trim()) er.username = "Required";
    // Stored compactly (max 15 chars): "+263 77 123 4567" -> "+263771234567"
    const phone = (form.phone || "").replace(/[\s()-]/g, "");
    if (phone && !/^\+?\d{7,14}$/.test(phone)) er.phone = "Enter a valid phone number, e.g. +263 77 123 4567";
    setErrors(er);
    if (Object.keys(er).length) return;

    setSaving(true);
    const fields = { ...Object.fromEntries(FIELDS.map((k) => [k, (form[k] || "").trim()])), phone };
    try {
      const data = await save({ fields, photo });
      setForm(Object.fromEntries(FIELDS.map((k) => [k, data[k] || ""])));
      setPhoto(null);
      toast.success("Profile saved");
    } catch (err) {
      const fieldErrors = err.response?.data;
      if (fieldErrors?.username) setErrors({ username: [].concat(fieldErrors.username).join(" ") });
      toast.error(`Couldn't save your profile — ${errorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const signOut = () => {
    dispatch(logout());
    navigate("/");
  };

  const avatarSrc = photoPreview || profile?.profile_picture || undefined;

  return (
    <AccountLayout subtitle={user?.email}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 lg:gap-6 items-start">
        {/* Personal details */}
        <form onSubmit={submit}>
          <Card className="overflow-hidden">
            <div className="p-5 sm:p-6">
              <SectionHeader title="Personal details" description="Buyers and sellers only ever see your username." />

              {isLoading || !form ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="relative rounded-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      aria-label="Change profile photo"
                    >
                      <Avatar name={form.username || "?"} src={avatarSrc} size={80} />
                      <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                        <Camera className="w-6 h-6 text-white" />
                      </span>
                    </button>
                    <div>
                      <Button type="button" size="sm" icon={Camera} onClick={() => fileRef.current?.click()}>
                        {avatarSrc ? "Change photo" : "Add a photo"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1.5">JPG or PNG. We resize it for you.</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First name">
                      <Input value={form.first_name} onChange={set("first_name")} autoComplete="given-name" />
                    </Field>
                    <Field label="Last name">
                      <Input value={form.last_name} onChange={set("last_name")} autoComplete="family-name" />
                    </Field>
                    <Field label="Username" required error={errors.username} hint="Shown on your offers and listings">
                      <Input value={form.username} onChange={set("username")} autoComplete="username" invalid={errors.username} />
                    </Field>
                    <Field label="Phone" error={errors.phone} hint="Only our team sees this, to arrange inspections and sales">
                      <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+263 77 123 4567" autoComplete="tel" invalid={errors.phone} />
                    </Field>
                    <Field label="Email" className="sm:col-span-2">
                      <div className="flex gap-2">
                        <Input value={profile?.email || user?.email || ""} disabled />
                        <Button type="button" size="md" onClick={() => setModal("email")}>Change</Button>
                      </div>
                    </Field>
                  </div>
                </>
              )}
            </div>

            {/* Save bar appears only when something changed */}
            <AnimatePresence initial={false}>
              {dirty && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/70">
                    <span className="mr-auto text-xs text-gray-500 hidden sm:inline">You have unsaved changes</span>
                    <Button type="button" onClick={discard} disabled={saving}>Discard</Button>
                    <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </form>

        {/* Account & privacy */}
        <div className="space-y-5">
          <Card className="p-1.5">
            <p className="px-3 pt-2.5 pb-1 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Security</p>
            <SettingRow icon={Lock} title="Password" sub="Change the password you sign in with" onClick={() => setModal("password")} />
            <SettingRow icon={Mail} title="Email address" sub={profile?.email || user?.email} onClick={() => setModal("email")} />
          </Card>

          <Card className="p-1.5">
            <p className="px-3 pt-2.5 pb-1 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Preferences</p>
            <SettingRow icon={Bell} title="Notifications" sub="Offers, listing updates and alerts" onClick={() => setModal("notifications")} />
            <SettingRow icon={Cookie} title="Cookie settings" sub="Choose which cookies we use" onClick={openCookieSettings} />
            <Link to="/privacy" className="block">
              <SettingRow as="div" icon={ShieldCheck} title="Privacy policy" sub="How we look after your data" />
            </Link>
          </Card>

          <Button variant="danger" size="md" icon={LogOut} onClick={signOut} className="w-full justify-center">
            Sign out
          </Button>
        </div>
      </div>

      <ChangePasswordModal open={modal === "password"} onClose={() => setModal(null)} />
      <ChangeEmailModal open={modal === "email"} onClose={() => setModal(null)} />
      <NotificationPreferences open={modal === "notifications"} onClose={() => setModal(null)} />
    </AccountLayout>
  );
};

function SettingRow({ icon: Icon, title, sub, onClick, as = "button" }) {
  const Tag = as;
  return (
    <Tag
      {...(as === "button" ? { type: "button", onClick } : {})}
      className={cx("w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer")}
    >
      <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 grid place-items-center shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        {sub && <span className="block text-xs text-gray-500 truncate">{sub}</span>}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </Tag>
  );
}

export default ProfilePage;
