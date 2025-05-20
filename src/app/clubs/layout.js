'use client';
import { useState, useEffect, Suspense, cloneElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Filter from '../components/filter';

function ClubsLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  return (

      <div className="relative min-h-screen w-full">

        {/* Main club page content */}
        <div className="z-10">{children}</div>
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
