import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiStar, FiBook, FiAward, FiBriefcase, FiShield,
  FiUsers, FiTrendingUp, FiDollarSign, FiBookmark,
  FiCheckCircle, FiClock,
} from 'react-icons/fi'
import useAuth from '../../../hooks/useAuth'
import useRole from '../../../hooks/useRole'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'
import UpdateProfileModal from '../../../components/Modal/UpdateProfileModal'

/* ─── role-specific KPI config ──────────────────────────────────────── */
const getKpis = (role, stats = {}) => {
  if (role === 'Student') return [
    { label: 'Tuitions Posted',   value: stats.tuitionsPosted ?? 0,       icon: FiBook,        color: 'text-primary',   bg: 'bg-primary/10' },
    { label: 'Applications',      value: stats.applicationsReceived ?? 0,  icon: FiBriefcase,   color: 'text-blue-500',  bg: 'bg-blue-500/10' },
    { label: 'Tutors Hired',      value: stats.tutorsHired ?? 0,           icon: FiCheckCircle, color: 'text-success',   bg: 'bg-success/10' },
    { label: 'Saved Tuitions',    value: stats.savedTuitions ?? 0,         icon: FiBookmark,    color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Total Spent',       value: `৳${(stats.totalSpent ?? 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-warning', bg: 'bg-warning/10' },
  ]
  if (role === 'Tutor') return [
    { label: 'Applications',      value: stats.totalApplications ?? 0,    icon: FiBriefcase,   color: 'text-primary',  bg: 'bg-primary/10' },
    { label: 'Bookings',          value: stats.approvedBookings ?? 0,      icon: FiCheckCircle, color: 'text-success',  bg: 'bg-success/10' },
    { label: 'Total Earned',      value: `৳${(stats.totalEarned ?? 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Avg Rating',        value: stats.avgRating ?? 'N/A',         icon: FiStar,        color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Reviews',           value: stats.reviewCount ?? 0,           icon: FiAward,       color: 'text-secondary', bg: 'bg-secondary/10' },
  ]
  if (role === 'Admin') return [
    { label: 'Students',          value: stats.totalStudents ?? 0,         icon: FiUsers,       color: 'text-primary',  bg: 'bg-primary/10' },
    { label: 'Tutors',            value: stats.totalTutors ?? 0,           icon: FiBriefcase,   color: 'text-success',  bg: 'bg-success/10' },
    { label: 'Tuitions',          value: stats.totalTuitions ?? 0,         icon: FiBook,        color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Platform Revenue',  value: `৳${(stats.platformRevenue ?? 0).toLocaleString()}`, icon: FiTrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Access Level',      value: 'Full',                           icon: FiShield,      color: 'text-secondary', bg: 'bg-secondary/10' },
  ]
  return []
}

const roleBadge = {
  Student: 'badge-primary',
  Tutor:   'badge-success',
  Admin:   'badge-error',
}

const roleGradient = {
  Student: 'from-primary to-violet-700',
  Tutor:   'from-emerald-500 to-teal-700',
  Admin:   'from-rose-500 to-red-700',
}

/* ─── Main component ─────────────────────────────────────────────────── */
const Profile = () => {
  const { user }      = useAuth()
  const [role]        = useRole()
  const axiosSecure   = useAxiosSecure()
  const queryClient   = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get('/profile')
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  const kpis     = getKpis(role, profile?.stats)
  const gradient = roleGradient[role] || 'from-primary to-violet-700'
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A'
  const lastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A'

  return (
    <div className="min-h-screen bg-base-200 pb-16 font-body text-base-content">

      {/* ── Cover + Avatar ─────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover banner */}
        <div className={`h-52 w-full bg-gradient-to-br ${gradient} md:h-64`} />

        {/* Avatar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 md:left-12 md:translate-x-0">
          <div className="relative">
            <img
              src={user?.photoURL || profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&size=128&background=6B46F3&color=fff`}
              alt="avatar"
              className="h-28 w-28 rounded-full border-4 border-base-100 object-cover shadow-xl md:h-36 md:w-36"
            />
            {/* Edit avatar button */}
            <button
              onClick={() => setEditOpen(true)}
              className="absolute bottom-1 right-1 rounded-full bg-base-100 p-1.5 shadow-lg ring-2 ring-base-200 transition hover:bg-base-200"
              title="Edit profile"
            >
              <FiEdit2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Name + Role + Edit btn ─────────────────────────────────── */}
      <div className="mt-16 flex flex-col items-center gap-2 px-4 text-center md:mt-10 md:flex-row md:items-end md:justify-between md:pl-52 md:pr-8 md:text-left">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            {user?.displayName || profile?.displayName || 'User'}
          </h1>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className={`badge badge-sm font-semibold uppercase tracking-wider ${roleBadge[role] || 'badge-neutral'}`}>
              {role}
            </span>
            {profile?.location && (
              <span className="flex items-center gap-1 text-xs text-base-content/50">
                <FiMapPin size={11} /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-base-content/50">
              <FiCalendar size={11} /> Joined {joinDate}
            </span>
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="btn btn-primary btn-sm gap-2 rounded-full px-5 shadow-md"
        >
          <FiEdit2 size={13} /> Edit Profile
        </button>
      </div>

      {/* ── KPI Stats Row ──────────────────────────────────────────── */}
      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="flex flex-col items-center rounded-2xl border border-base-300 bg-base-100 p-4 text-center shadow-sm"
            >
              <div className={`mb-2 rounded-full ${k.bg} p-2.5`}>
                <k.icon className={`text-lg ${k.color}`} />
              </div>
              <span className={`text-xl font-black ${k.color}`}>{k.value}</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-base-content/50">
                {k.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content grid ──────────────────────────────────────── */}
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 px-4 md:grid-cols-3">

        {/* LEFT column ─ About + Contact + Account */}
        <div className="flex flex-col gap-5 md:col-span-1">

          {/* About */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <FiAward className="text-primary" /> About
            </h3>
            <p className="text-sm leading-relaxed text-base-content/70">
              {profile?.bio || (
                <span className="italic text-base-content/30">
                  No bio added yet. Click "Edit Profile" to add one.
                </span>
              )}
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <FiMail className="text-primary" /> Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiMail size={13} />
                </span>
                <span className="truncate text-base-content/70">{user?.email || '—'}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <FiPhone size={13} />
                </span>
                <span className="text-base-content/70">{profile?.phone || <em className="text-base-content/30">Not added</em>}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <FiMapPin size={13} />
                </span>
                <span className="text-base-content/70">{profile?.location || <em className="text-base-content/30">Not added</em>}</span>
              </li>
            </ul>
          </div>

          {/* Account Info */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <FiShield className="text-primary" /> Account Info
            </h3>
            <ul className="space-y-2 text-xs text-base-content/60">
              <li className="flex justify-between">
                <span className="font-medium">Last login</span>
                <span>{lastLogin}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">Joined</span>
                <span>{joinDate}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-medium">User ID</span>
                <span className="truncate rounded bg-base-200 px-2 py-1 font-mono text-[10px]">
                  {user?.uid}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT column ─ Skills / Role details */}
        <div className="flex flex-col gap-5 md:col-span-2">

          {/* Tutor-specific: skills & experience */}
          {role === 'Tutor' && (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <FiBriefcase className="text-primary" /> Teaching Profile
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">Experience</p>
                  <p className="text-sm font-medium">
                    {profile?.experience ? `${profile.experience} years` : <em className="text-base-content/30">Not added</em>}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">Qualification</p>
                  <p className="text-sm font-medium">
                    {profile?.qualification || <em className="text-base-content/30">Not added</em>}
                  </p>
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">Subjects Taught</p>
                {profile?.subjects?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((s) => (
                      <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-base-content/30">No subjects added. Edit profile to add.</p>
                )}
              </div>

              {/* Rating */}
              {profile?.stats?.avgRating && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <FiStar
                        key={i}
                        className={i <= Math.round(profile.stats.avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-base-content/20'}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold">{profile.stats.avgRating}</span>
                  <span className="text-xs text-base-content/50">({profile.stats.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          )}

          {/* Student-specific: activity */}
          {role === 'Student' && (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <FiBook className="text-primary" /> Learning Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tuitions Posted',  val: profile?.stats?.tuitionsPosted ?? 0,       color: 'text-primary',   bg: 'bg-primary/10',   icon: FiBook },
                  { label: 'Tutors Hired',     val: profile?.stats?.tutorsHired ?? 0,           color: 'text-success',   bg: 'bg-success/10',   icon: FiCheckCircle },
                  { label: 'Pending Reviews',  val: (profile?.stats?.applicationsReceived ?? 0) - (profile?.stats?.tutorsHired ?? 0), color: 'text-warning', bg: 'bg-warning/10', icon: FiClock },
                  { label: 'Total Spent',      val: `৳${(profile?.stats?.totalSpent ?? 0).toLocaleString()}`, color: 'text-error', bg: 'bg-error/10', icon: FiDollarSign },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-3 rounded-xl ${item.bg} p-3`}>
                    <item.icon className={`text-xl ${item.color}`} />
                    <div>
                      <p className={`font-black text-lg ${item.color}`}>{item.val}</p>
                      <p className="text-[10px] font-semibold uppercase text-base-content/50">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin-specific: platform overview */}
          {role === 'Admin' && (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <FiShield className="text-primary" /> Platform Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Students',  val: profile?.stats?.totalStudents ?? 0,        color: 'text-primary',   bg: 'bg-primary/10',   icon: FiUsers },
                  { label: 'Total Tutors',    val: profile?.stats?.totalTutors ?? 0,           color: 'text-success',   bg: 'bg-success/10',   icon: FiBriefcase },
                  { label: 'Total Tuitions',  val: profile?.stats?.totalTuitions ?? 0,         color: 'text-blue-500',  bg: 'bg-blue-500/10',  icon: FiBook },
                  { label: 'Revenue',         val: `৳${(profile?.stats?.platformRevenue ?? 0).toLocaleString()}`, color: 'text-warning', bg: 'bg-warning/10', icon: FiTrendingUp },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-3 rounded-xl ${item.bg} p-3`}>
                    <item.icon className={`text-xl ${item.color}`} />
                    <div>
                      <p className={`font-black text-lg ${item.color}`}>{item.val}</p>
                      <p className="text-[10px] font-semibold uppercase text-base-content/50">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification badge card */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <FiCheckCircle className="text-primary" /> Profile Completion
            </h3>
            {(() => {
              const fields = [
                { label: 'Display Name',  done: !!user?.displayName },
                { label: 'Photo',         done: !!user?.photoURL },
                { label: 'Phone',         done: !!profile?.phone },
                { label: 'Location',      done: !!profile?.location },
                { label: 'Bio',           done: !!profile?.bio },
                ...(role === 'Tutor' ? [
                  { label: 'Subjects',    done: (profile?.subjects?.length || 0) > 0 },
                  { label: 'Experience',  done: !!profile?.experience },
                ] : []),
              ]
              const done = fields.filter(f => f.done).length
              const pct  = Math.round((done / fields.length) * 100)
              return (
                <>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">{pct}% complete</span>
                    <span className="text-base-content/50">{done}/{fields.length} fields</span>
                  </div>
                  <progress className="progress progress-primary w-full" value={pct} max="100" />
                  <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                    {fields.map(f => (
                      <li key={f.label} className={`flex items-center gap-1.5 ${f.done ? 'text-success' : 'text-base-content/40'}`}>
                        <FiCheckCircle size={11} className={f.done ? 'text-success' : 'text-base-content/20'} />
                        {f.label}
                      </li>
                    ))}
                  </ul>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      <UpdateProfileModal
        isOpen={editOpen}
        setIsOpen={setEditOpen}
        user={user}
        profile={profile}
        role={role}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['profile', user?.email] })}
      />
    </div>
  )
}

export default Profile
