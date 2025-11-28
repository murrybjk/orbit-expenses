import React from 'react';
import { X } from 'lucide-react';

// --- Card ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-card border border-border rounded-2xl p-5 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', className = '', ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20",
    secondary: "bg-card hover:bg-accent/5 text-primary border border-border",
    ghost: "bg-transparent hover:bg-accent/5 text-muted hover:text-primary",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "w-10 h-10 p-2"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-muted mb-1.5 ml-1">{label}</label>}
    <input
      className={`w-full bg-app border ${error ? 'border-red-500/50' : 'border-border'} rounded-xl px-4 py-3 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all ${className}`}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-muted mb-1.5 ml-1">{label}</label>}
    <div className="relative">
      <select
        className={`w-full bg-app border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent appearance-none transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  </div>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 fade-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};