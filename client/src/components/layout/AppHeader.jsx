import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AudioLines, BarChart2, Brain, HeartPulse, Home, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { initials } from '../../utils/format';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/scans', label: 'Scans', icon: HeartPulse },
  { to: '/mind', label: 'Mind', icon: Brain },
  { to: '/solace', label: 'Solace', icon: AudioLines },
  { to: '/insights', label: 'Insights', icon: BarChart2 }
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `h-9 rounded-full flex items-center gap-2 text-xs font-semibold transition shadow-xs border ${
          isActive
            ? 'px-4 bg-[#0F3B3F] text-white border-[#0F3B3F]'
            : 'px-3 bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-4 h-4" />
          <span className={isActive ? '' : 'hidden lg:inline'}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full bg-white border-2 border-white shadow-xs flex items-center justify-center text-xs font-bold text-[#0F3B3F] hover:scale-105 transition cursor-pointer"
        aria-label="Account menu"
      >
        {initials(user?.fullName || user?.email)}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-40 text-[#1F2A2E]">
          <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
            <div className="text-xs font-semibold truncate">{user?.fullName || 'Dermora user'}</div>
            <div className="text-[10px] text-[#8A9AA0] truncate">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Top navigation + page title row. `aside` renders on the right of the title (e.g. stats). */
export function AppHeader({ title, subtitle, aside }) {
  return (
    <header className="relative w-full pt-5 pb-3">
      <div className="flex items-center justify-between gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition shrink-0">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0F3B3F]">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-white text-base font-semibold tracking-tight">
            Dermora<span className="font-normal opacity-90">.ai</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2" aria-label="Main">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <UserMenu />
      </div>

      {/* Phones: fixed bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] print:hidden"
        aria-label="Main"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
                isActive ? 'text-[#0F3B3F]' : 'text-[#8A9AA0]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`w-9 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-[#DCEBE8]' : ''}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between mt-4 sm:mt-5 gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-light text-white tracking-tight leading-none drop-shadow-xs">{title}</h1>
          {subtitle && <p className="text-xs text-white/90 mt-1 font-medium">{subtitle}</p>}
        </div>
        {aside}
      </div>
    </header>
  );
}
