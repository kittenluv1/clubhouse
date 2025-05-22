'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

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
    <Suspense fallback={<LoadingScreen />}>
      <ClubsLayoutContent>{children}</ClubsLayoutContent>
    </Suspense>
  );
}
