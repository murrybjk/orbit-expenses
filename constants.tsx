
import React from 'react';
import { CategoryConfig, CategoryId } from './types';
import { 
  // Essentials
  Utensils, Coffee, Car, Plane, ShoppingBag, Gift, Home, Wifi, Zap, 
  Film, Gamepad2, Music, HeartPulse, TrendingUp, Briefcase, GraduationCap, 
  Wrench, Smartphone, CreditCard, Globe, CircleDashed,
  // Moods
  Angry, Smile, Frown, Meh, 
  // Activities
  Bike, Dumbbell, Trophy, Medal, Tent, Camera, Palette, 
  Ticket, Map, Anchor, Train, Bus,
  // Tech
  Laptop, Printer, Cloud, Battery, Thermometer, Server, Database, HardDrive, Cpu,
  // Home & Lifestyle
  Tv, Scissors, Watch, Glasses, Shirt, Baby, Dog, Cat, Sofa, Bed, Bath, ShowerHead, Key, Lock, Shield,
  // Finance
  Banknote, Wallet, PiggyBank, Tag, FileText, DollarSign, Percent, PieChart, BarChart, Activity,
  // Nature
  Sun, Umbrella, Droplet, Hammer, Beer, Pizza, Fuel, Pill, Building,
  Leaf, Flower, Trees, Mountain, Waves, Wind, Snowflake, Flame,
  // Media
  Headphones, Speaker, Mic, Video, Image, Book, Library, Music2,
  // Utility Status
  ZapOff, WifiOff
} from 'lucide-react';

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  [CategoryId.FOOD]: {
    id: CategoryId.FOOD,
    label: 'Food & Dining',
    color: '#3b82f6',
    twColor: 'text-blue-500',
    iconName: 'Utensils'
  },
  [CategoryId.TRANSPORT]: {
    id: CategoryId.TRANSPORT,
    label: 'Transport',
    color: '#f59e0b',
    twColor: 'text-amber-500',
    iconName: 'Car'
  },
  [CategoryId.SHOPPING]: {
    id: CategoryId.SHOPPING,
    label: 'Shopping',
    color: '#ec4899',
    twColor: 'text-pink-500',
    iconName: 'ShoppingBag'
  },
  [CategoryId.HOUSING]: {
    id: CategoryId.HOUSING,
    label: 'Housing',
    color: '#6366f1',
    twColor: 'text-indigo-500',
    iconName: 'Home'
  },
  [CategoryId.ENTERTAINMENT]: {
    id: CategoryId.ENTERTAINMENT,
    label: 'Entertainment',
    color: '#8b5cf6',
    twColor: 'text-violet-500',
    iconName: 'Film'
  },
  [CategoryId.HEALTH]: {
    id: CategoryId.HEALTH,
    label: 'Health',
    color: '#10b981',
    twColor: 'text-emerald-500',
    iconName: 'HeartPulse'
  },
  [CategoryId.INVESTMENT]: {
    id: CategoryId.INVESTMENT,
    label: 'Investments',
    color: '#06b6d4',
    twColor: 'text-cyan-500',
    iconName: 'TrendingUp'
  },
  [CategoryId.OTHER]: {
    id: CategoryId.OTHER,
    label: 'Other',
    color: '#64748b',
    twColor: 'text-slate-500',
    iconName: 'CircleDashed'
  }
};

export const AVAILABLE_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#64748b' },
];

// Local Map of Icons
const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Car, Plane, ShoppingBag, Gift, Home, Wifi, Zap, 
  Film, Gamepad2, Music, HeartPulse, TrendingUp, Briefcase, GraduationCap, 
  Wrench, Smartphone, CreditCard, Globe, CircleDashed,
  Angry, Smile, Frown, Meh, 
  Bike, Dumbbell, Trophy, Medal, Tent, Camera, Palette, 
  Ticket, Map, Anchor, Train, Bus,
  Laptop, Printer, Cloud, Battery, Thermometer, Server, Database, HardDrive, Cpu,
  Tv, Scissors, Watch, Glasses, Shirt, Baby, Dog, Cat, Sofa, Bed, Bath, ShowerHead, Key, Lock, Shield,
  Banknote, Wallet, PiggyBank, Tag, FileText, DollarSign, Percent, PieChart, BarChart, Activity,
  Sun, Umbrella, Droplet, Hammer, Beer, Pizza, Fuel, Pill, Building,
  Leaf, Flower, Trees, Mountain, Waves, Wind, Snowflake, Flame,
  Headphones, Speaker, Mic, Video, Image, Book, Library, Music2,
  ZapOff, WifiOff
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP).sort();

// Date Utilities
export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const getIconComponent = (iconName: string, props: any) => {
  const Icon = ICON_MAP[iconName] || CircleDashed;
  return <Icon {...props} />;
};
