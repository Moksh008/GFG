import React from 'react';
import { AppHeader } from './AppHeader';

/** Page frame for all signed-in screens: gradient background, header, content column. */
export function AppShell({ title, subtitle, aside, children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#6F8FA3] via-[#A9C1CC] to-[#DCEBE8] text-[#1F2A2E] antialiased">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
        <AppHeader title={title} subtitle={subtitle} aside={aside} />
        <main className="space-y-2.5 mt-2">{children}</main>
      </div>
    </div>
  );
}
