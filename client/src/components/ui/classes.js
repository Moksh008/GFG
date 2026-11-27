// Shared Tailwind class strings so forms and buttons look identical everywhere.

export const inputClass =
  'w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3F5F4A] placeholder-slate-400';

export const labelClass = 'text-xs font-medium text-[#1F2A2E] mb-1 block';

const btnBase =
  'inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-xl transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const buttonClass = {
  primary: `${btnBase} px-5 py-2 text-white bg-[#0F3B3F] hover:bg-[#1F6A66]`,
  success: `${btnBase} px-5 py-2 text-white bg-[#3F5F4A] hover:bg-[#2FBF71]`,
  ghost: `${btnBase} px-4 py-2 text-slate-600 hover:bg-slate-100 shadow-none`,
  subtle: `${btnBase} px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1F2A2E] shadow-none`,
  pill: `${btnBase} px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#1F2A2E] hover:bg-slate-50`
};
