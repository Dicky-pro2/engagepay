import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Only expose the icons we actually use in the app.
// Add new entries here as needed — keeps the bundle predictable
// instead of pulling in the entire lucide-react icon set.
export const Icons = {
  // Navigation
  Dashboard: LucideIcons.LayoutDashboard,
  Tasks: LucideIcons.ListChecks,
  Wallet: LucideIcons.Wallet,
  Submissions: LucideIcons.ClipboardList,
  Review: LucideIcons.ClipboardCheck,
  Profile: LucideIcons.UserCircle,
  Bell: LucideIcons.Bell,
  Logout: LucideIcons.LogOut,
  Home: LucideIcons.Home,

  // Auth
  Mail: LucideIcons.Mail,
  Lock: LucideIcons.Lock,
  User: LucideIcons.User,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  ArrowRight: LucideIcons.ArrowRight,
  ArrowLeft: LucideIcons.ArrowLeft,

  // Roles
  Advertiser: LucideIcons.Megaphone,
  Earner: LucideIcons.Coins,

  // Actions
  Pause: LucideIcons.Pause,
  Play: LucideIcons.Play,
  Cancel: LucideIcons.XCircle,
  Approve: LucideIcons.CheckCircle,
  Edit: LucideIcons.Pencil,
  Confirm: LucideIcons.Check,
  Close: LucideIcons.X,

  // Status / misc
  Clock: LucideIcons.Clock,
  Trending: LucideIcons.TrendingUp,
  Star: LucideIcons.Star,
  ExternalLink: LucideIcons.ExternalLink,
  MarkAllRead: LucideIcons.CheckCheck,
  Verified: LucideIcons.ShieldCheck,
} as const;

export type IconName = keyof typeof Icons;

// Dynamic icon-by-name renderer, e.g. <Icon name="Bell" size={16} />
interface IconProps extends React.ComponentProps<LucideIcon> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const Component = Icons[name];
  return <Component {...props} />;
}