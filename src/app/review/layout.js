"use client";
import { Suspense } from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function ReviewLayout({ children }) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            {children}
        </Suspense>
    );
}