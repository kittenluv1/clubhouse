'use client';
import { useState, useEffect, Suspense, cloneElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '../components/filter';

function ClubsLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  return (

      <div className="relative">
        {/* Gradient background that covers start and middle parts */}
        <div className="absolute top-0 left-0 h-1/6 w-full bg-gradient-to-b from-[#DFEBFF] via-[#DFF1F1] to-[#FFFFFF] -z-10"></div>
        <div className="absolute top-1/3 h-1/3 w-full bg-gradient-to-b from-[#FFFFFF] via-[#F1FFE8] to-[#FFFFFF] -z-10" />
        <div className="absolute top-2/3 h-1/3 w-full bg-gradient-to-b from-[#FFFFFF] to-[#DFF1F1] -z-10" />

        {/* Main club page content */}
        <div className="px-6 relative z-10">{children}</div>
      </div>
      );
}

export default function ClubsLayout({ children }) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <ClubsLayoutContent>{children}</ClubsLayoutContent>
    </Suspense>
  );
}
