import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { currentBrand, GrowthFlowLogo } from '../brands';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Home: LayoutDashboard,
  LayoutDashboard: LayoutDashboard,
  BarChart3: LayoutDashboard,
  Users: Users,
  FileText: FileText,
  Send: Send,
  MessageSquare: MessageSquare,
  MessageSquareQuote: MessageSquare,
  BarChart2: BarChart2,
  Settings: Settings,
};

export function Sidebar() {
  const { signOut, user, currentOrg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isGrowthFlow = currentBrand.id === 'growthflow';
  const currentPathWithSearch = location.pathname + location.search;

  return (
    <aside
      className="flex flex-col h-screen w-64 shrink-0 shadow-2xl border-r transition-colors select-none"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-text)',
      }}
    >
      {/* Brand Header */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}
      >
        {isGrowthFlow ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-[#D4AF37]/40 shadow-sm shrink-0">
              <img
                src="/growthflow-logo.png"
                alt="GrowthFlow Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-extrabold text-base tracking-tight text-white">Growth</span>
                <span className="font-extrabold text-base tracking-tight text-[#D4AF37]">Flow</span>
              </div>
              <p className="text-[10px] text-amber-200/80 font-medium truncate max-w-[130px]">
                {currentBrand.tagline}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={currentBrand.logoSrc}
              alt={currentBrand.name}
              className="w-9 h-9 rounded-xl object-cover shadow-md border border-white/20 bg-black/20"
            />
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-white">{currentBrand.name}</h2>
              <p className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider truncate max-w-[140px]">
                {currentOrg?.name || 'Business Platform'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {currentBrand.sidebarItems.map(({ to, label, icon }) => {
          const Icon = iconMap[icon] || LayoutDashboard;
          const isItemActive = to.includes('?')
            ? currentPathWithSearch === to
            : location.pathname === to && !location.search;

          return (
            <NavLink
              key={to}
              to={to}
              className={
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  isItemActive
                    ? 'text-white font-bold shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
              style={
                isItemActive
                  ? {
                      background: 'var(--sidebar-active-bg)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: '#FFFFFF',
                    }
                  : {}
              }
            >
              <Icon size={18} className="shrink-0 text-[#D4AF37]" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* GrowthFlow Pro Banner (from Mockup Design) */}
      {isGrowthFlow && (
        <div className="px-3 pb-3">
          <div className="rounded-xl p-3 bg-gradient-to-br from-[#2E3E24] to-[#1E2B16] border border-[#D4AF37]/30 text-white shadow-inner">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                <Rocket size={14} />
              </span>
              <p className="text-xs font-bold leading-tight text-white">Grow Faster</p>
            </div>
            <p className="text-[10px] text-amber-100/70 mb-2">
              Scale messaging limits with GrowthFlow Pro.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full text-center py-1.5 px-2 bg-gradient-to-r from-[#D4AF37] to-[#E5C048] hover:brightness-105 text-[#111827] font-extrabold text-[11px] rounded-lg shadow-sm transition-all"
            >
              Upgrade Plan →
            </button>
          </div>
        </div>
      )}

      {/* User Info & Logout */}
      <div
        className="px-4 py-3.5 border-t"
        style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-amber-100/60 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
