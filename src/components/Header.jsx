import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Home, HeartPulse, BarChart2, Calendar, FileText, Bell, Settings, Search } from 'lucide-react';

export function Header({
  scansCount = 1360,
  medsTaken = 2654,
  upcomingApts = 54
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="relative w-full pt-5 pb-3">
      {/* Top Bar: Brand, Center Nav with Solid Buttons, Right Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Solid White Circle + Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0F3B3F]">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-white text-base font-semibold tracking-tight">
            CareNest <span className="font-normal opacity-90">• DermaTrack</span>
          </span>
        </Link>

        {/* Center Nav: React Router Links */}
        <nav className="flex items-center gap-2">
          {/* Dashboard Button */}
          <Link
            to="/dashboard"
            className={`h-9 px-4 rounded-full flex items-center gap-2 text-xs font-semibold transition shadow-xs border ${
              currentPath === '/dashboard' || currentPath === '/'
                ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]'
                : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          {/* Scans Icon */}
          <Link
            to="/dashboard?tab=scans"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition shadow-xs border bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50"
            title="Scan Repository"
          >
            <HeartPulse className="w-4 h-4" />
          </Link>

          {/* Trends Icon */}
          <Link
            to="/dashboard?tab=trends"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition shadow-xs border bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50"
            title="Analytics & Trends"
          >
            <BarChart2 className="w-4 h-4" />
          </Link>

          {/* Schedule Icon */}
          <Link
            to="/dashboard?tab=schedule"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition shadow-xs border bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50"
            title="Schedule & Appointments"
          >
            <Calendar className="w-4 h-4" />
          </Link>

          {/* Records Icon */}
          <Link
            to="/dashboard?tab=records"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition shadow-xs border bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50"
            title="Clinical Records"
          >
            <FileText className="w-4 h-4" />
          </Link>
        </nav>

        {/* Right Controls: Solid Search Pill + Solid Icons + Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-[210px] h-9 bg-white border border-slate-200 rounded-full shadow-xs flex items-center px-3 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search records…"
              className="bg-transparent text-xs text-[#1F2A2E] placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#E5484D] absolute top-2 right-2 border border-white" />
          </button>

          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Alex Mercer Avatar"
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs cursor-pointer hover:scale-105 transition"
          />
        </div>
      </div>

      {/* Greeting and Metrics Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mt-5 gap-3">
        <div>
          <h1 className="text-[28px] font-light text-white tracking-tight leading-none drop-shadow-xs">
            Good morning
          </h1>
          <p className="text-xs text-white/90 mt-1 font-medium">
            Alex • Here is your dermatological update for today
          </p>
        </div>

        {/* Right: Solid White Metrics Card */}
        <div className="flex items-center gap-6 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs text-[#1F2A2E]">
          {/* Stat 1: Total Scans */}
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#1F2A2E] leading-none">
                  {scansCount.toLocaleString()}
                </span>
                <span className="w-3.5 h-3.5 rounded bg-[#2FBF71] flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </span>
              </div>
              <div className="text-[9px] text-[#8A9AA0] mt-0.5 uppercase tracking-wider font-semibold">
                Total Scans
              </div>
            </div>
            <div className="w-[50px] h-5 flex items-end justify-between gap-1">
              {[40, 65, 55, 80, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-t bg-slate-300 hover:bg-[#3F5F4A] transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          {/* Stat 2: Meds Taken Today */}
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#1F2A2E] leading-none">
                  {medsTaken.toLocaleString()}
                </span>
                <span className="w-3.5 h-3.5 rounded bg-[#2FBF71] flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </span>
              </div>
              <div className="text-[9px] text-[#8A9AA0] mt-0.5 uppercase tracking-wider font-semibold">
                Meds Taken Today
              </div>
            </div>
            <div className="w-[50px] h-5 flex items-end justify-between gap-1">
              {[50, 70, 60, 90, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-t bg-[#F2C98A] transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          {/* Stat 3: Appointments */}
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#1F2A2E] leading-none">
                  {upcomingApts}
                </span>
                <span className="w-3.5 h-3.5 rounded bg-[#E5484D] flex items-center justify-center text-[9px] text-white font-bold">
                  !
                </span>
              </div>
              <div className="text-[9px] text-[#8A9AA0] mt-0.5 uppercase tracking-wider font-semibold">
                Appointments
              </div>
            </div>
            <div className="w-[50px] h-5 flex items-end justify-between gap-1">
              {[80, 50, 70, 40, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-t bg-slate-300 transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
