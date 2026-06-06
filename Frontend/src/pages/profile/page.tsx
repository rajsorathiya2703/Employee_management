import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Hash, Mail, Phone, Briefcase, Building2,
  MapPin, Calendar, Loader2, CheckCircle2, Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TextInput from '../../component/common/TextInput';
import DatePicker from '../../component/common/DatePicker';
import { BACKEND_URL } from '../../service/axios';
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  uploadProfilePhoto,
  type EmployeeProfile,
} from '../../service/employee.service';

// ── Form shape ────────────────────────────────────────────────────────────────

interface ProfileForm {
  firstName: string;
  lastName: string;
  personalEmail: string;
  phone: string;
  designation: string;
  department: string;
  branch: string;
  dateOfJoining: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const toFormDate = (iso: string | null) =>
  iso ? iso.split('T')[0] : '';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<ProfileForm>({
    defaultValues: {
      firstName: '', lastName: '', personalEmail: '',
      phone: '', designation: '', department: '', branch: '', dateOfJoining: '',
    },
  });

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const res = await getEmployeeProfile(EMPLOYEE_ID);
        const p = res.data.data;
        setProfile(p);
        
        if (p.profilePhoto !== user?.profilePhoto) {
          updateUser({ profilePhoto: p.profilePhoto });
        }

        reset({
          firstName:     p.firstName     ?? '',
          lastName:      p.lastName      ?? '',
          personalEmail: p.personalEmail ?? '',
          phone:         p.phone         ?? '',
          designation:   p.designation   ?? '',
          department:    p.department    ?? '',
          branch:        p.branch        ?? '',
          dateOfJoining: toFormDate(p.dateOfJoining),
        });
      } catch {
        setLoadError('Failed to load profile.');
      }
    })();
  }, [EMPLOYEE_ID, reset]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProfileForm) => {
    setSaveSuccess(false);
    try {
      const res = await updateEmployeeProfile(EMPLOYEE_ID, {
        firstName:     data.firstName     || undefined,
        lastName:      data.lastName      || undefined,
        personalEmail: data.personalEmail || undefined,
        phone:         data.phone         || undefined,
        designation:   data.designation   || undefined,
        department:    data.department    || undefined,
        branch:        data.branch        || undefined,
        dateOfJoining: data.dateOfJoining || undefined,
      });
      setProfile(res.data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('root', {
        message:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to save profile.',
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadProfilePhoto(EMPLOYEE_ID, file);
      setProfile(res.data.data);
      updateUser({ profilePhoto: res.data.data.profilePhoto });
    } catch (err) {
      setError('root', { message: 'Failed to upload photo.' });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  // ── Avatar initials ───────────────────────────────────────────────────────

  const avatarLetters = profile ? initials(profile.name) : (user?.name ? initials(user.name) : 'U');

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center">
      {/* Page Header */}
      <div className="shrink-0 w-full max-w-3xl">
        <div className="flex items-center gap-2">
          <User size={26} className="text-indigo-600" strokeWidth={2.5} />
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        </div>
        <p className="text-slate-500 mt-1 text-sm">
          View your official details and update your personal contact details.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto w-full">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative shrink-0">
            {profile?.profilePhoto ? (
              <img
                src={`${BACKEND_URL}${profile.profilePhoto}`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xl select-none">
                {avatarLetters}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              title="Upload photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={13} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingPhoto ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

            {/* First Name */}
            <TextInput
              label="First Name"
              placeholder=""
              errorMessage={errors.firstName?.message}
              {...register('firstName')}
              className="[&_label]:flex [&_label]:items-center [&_label]:gap-1.5 [&_label]:before:content-[''] relative"
            />

            {/* Last Name */}
            <TextInput
              label="Last Name"
              placeholder=""
              errorMessage={errors.lastName?.message}
              {...register('lastName')}
            />

            {/* Employee ID (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                Employee ID (Official)
              </label>
              <input
                readOnly
                value={profile?.id ?? ''}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 cursor-not-allowed w-full focus:outline-none"
              />
            </div>

            {/* Official Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                Official Email
              </label>
              <input
                readOnly
                value={profile?.email ?? ''}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 cursor-not-allowed w-full focus:outline-none"
              />
            </div>

            {/* Personal Email */}
            <TextInput
              label="Personal Email"
              type="email"
              placeholder=""
              errorMessage={errors.personalEmail?.message}
              {...register('personalEmail', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 99999 99999"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full"
                {...register('phone')}
              />
              {errors.phone && (
                <span className="text-sm text-red-500">{errors.phone.message}</span>
              )}
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase size={13} className="text-slate-400" />
                Designation
              </label>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full"
                {...register('designation')}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 size={13} className="text-slate-400" />
                Department
              </label>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full"
                {...register('department')}
              />
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                Branch
              </label>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full"
                {...register('branch')}
              />
            </div>

            {/* Date of Joining */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Date of Joining
              </label>
              <DatePicker
                errorMessage={errors.dateOfJoining?.message}
                {...register('dateOfJoining')}
              />
            </div>

          </div>

          {/* Root error */}
          {errors.root && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {errors.root.message}
            </p>
          )}

          {/* Save button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <User size={15} />
                  Save Profile
                </>
              )}
            </button>

            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 size={16} />
                Profile saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
