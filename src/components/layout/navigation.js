import {
  BarChart3,
  Bookmark,
  BookOpenCheck,
  Briefcase,
  ClipboardList,
  CreditCard,
  FilePlus2,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessagesSquare,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

export const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/tuitions', label: 'Find tuitions' },
  { to: '/tutors', label: 'Find tutors' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/** Sidebar sections per role. `end` marks exact-match links. */
export const DASHBOARD_NAV = {
  Student: [
    {
      title: 'Overview',
      items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
    },
    {
      title: 'Tuitions',
      items: [
        { to: '/dashboard/post-tuition', label: 'Post a tuition', icon: FilePlus2 },
        { to: '/dashboard/my-posts', label: 'My tuitions', icon: ClipboardList },
        { to: '/dashboard/applied-tutors', label: 'Applicants & hires', icon: Users },
        { to: '/dashboard/saved-tuitions', label: 'Saved', icon: Bookmark },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/dashboard/payment-history', label: 'Payments', icon: CreditCard },
        { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
      ],
    },
  ],
  Tutor: [
    {
      title: 'Overview',
      items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
    },
    {
      title: 'Work',
      items: [
        { to: '/tuitions', label: 'Browse tuitions', icon: Search },
        { to: '/dashboard/my-applications', label: 'My applications', icon: ListChecks },
        { to: '/dashboard/ongoing-tuitions', label: 'Ongoing tuitions', icon: BookOpenCheck },
        { to: '/dashboard/saved-tuitions', label: 'Saved', icon: Bookmark },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/dashboard/payment-history', label: 'Earnings', icon: CreditCard },
        { to: '/dashboard/profile', label: 'Tutor profile', icon: UserRound },
      ],
    },
  ],
  Admin: [
    {
      title: 'Overview',
      items: [{ to: '/dashboard', label: 'Analytics', icon: BarChart3, end: true }],
    },
    {
      title: 'Manage',
      items: [
        { to: '/dashboard/admin/tuitions', label: 'Tuitions', icon: ShieldCheck },
        { to: '/dashboard/admin/users', label: 'Users', icon: Users },
        { to: '/dashboard/admin/payments', label: 'Transactions', icon: CreditCard },
        { to: '/dashboard/admin/chats', label: 'Live chat', icon: MessagesSquare },
        { to: '/dashboard/admin/messages', label: 'Contact inbox', icon: Inbox },
      ],
    },
    {
      title: 'Account',
      items: [{ to: '/dashboard/profile', label: 'Profile', icon: UserRound }],
    },
  ],
};

export const ROLE_META = {
  Student: { icon: GraduationCap, label: 'Student' },
  Tutor: { icon: Briefcase, label: 'Tutor' },
  Admin: { icon: ShieldCheck, label: 'Admin' },
};

export const FOOTER_LINKS = [
  {
    title: 'Platform',
    links: [
      { to: '/tuitions', label: 'Browse tuitions' },
      { to: '/tutors', label: 'Find tutors' },
      { to: '/signup', label: 'Become a tutor' },
      { to: '/dashboard/post-tuition', label: 'Post a tuition' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
      { to: '/about#how-it-works', label: 'How it works' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/contact', label: 'Help centre', icon: Mail },
      { to: '/about#faq', label: 'FAQ' },
      { to: '/about#safety', label: 'Safety & trust' },
    ],
  },
];
