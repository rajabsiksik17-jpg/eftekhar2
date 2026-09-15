import {
  Activity,
  Award,
  Baby,
  Brain,
  Calendar,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  Facebook,
  Globe,
  Heart,
  HeartHandshake,
  HeartPulse,
  Instagram,
  Layers,
  Layout,
  Leaf,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Microscope,
  Move,
  Music2,
  Phone,
  Quote,
  Route,
  Scale,
  Scissors,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  Target,
  Triangle,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap,
  Menu,
  Search,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Image as ImageIcon,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Activity,
  Award,
  Baby,
  Brain,
  Calendar,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  Facebook,
  Globe,
  Heart,
  HeartHandshake,
  HeartPulse,
  Instagram,
  Layers,
  Layout,
  Leaf,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  Move,
  Music2,
  Phone,
  Quote,
  Route,
  Scale,
  Scissors,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  Target,
  Triangle,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  ImageIcon,
  ClipboardList,
};

export type IconName = keyof typeof MAP;

export const ICON_NAMES = Object.keys(MAP) as string[];

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Sparkles;
  return MAP[name] ?? Sparkles;
}

export function Icon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const C = getIcon(name);
  return <C className={className} />;
}

export function socialIcon(platform: string): LucideIcon {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return Facebook;
  if (p.includes("instagram")) return Instagram;
  if (p.includes("tiktok")) return Music2;
  if (p.includes("youtube")) return Youtube;
  if (p.includes("whatsapp")) return MessageCircle;
  if (p.includes("snapchat")) return Send;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("telegram")) return Send;
  if (p === "x" || p.includes("twitter")) return Twitter;
  return Globe;
}
