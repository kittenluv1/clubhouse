"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [singleCategory, setSingleCategory] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync state with URL parameters on mount and URL changes
  useEffect(() => {
    const nameParam = searchParams.get('name') || '';
    const singleCategoryParam = searchParams.get('category') || '';
    const multiCategoriesParam = searchParams.get('categories') || '';
    
    setSearchTerm(nameParam);
    setSingleCategory(singleCategoryParam);
    setSelectedCategories(multiCategoriesParam ? multiCategoriesParam.split(',') : []);
  }, [searchParams]);

  // Clear all search states
  const clearAllSearch = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSingleCategory('');
  };

  // Search by name - clears category selections
  const searchByName = (term) => {
    const trimmedTerm = (term || '').trim();
    
    // Clear category states
    setSelectedCategories([]);
    setSingleCategory('');
    setSearchTerm(trimmedTerm);

    if (!trimmedTerm) {
      router.push('/clubs');
      return;
    }

    const encoded = encodeURIComponent(trimmedTerm);
    router.push(`/clubs?name=${encoded}`);
  };

  // Search by single category - clears name search
  const searchBySingleCategory = (category) => {
    const trimmedCategory = (category || '').trim();
    
    // Clear name search and multi-categories
    setSearchTerm('');
    setSelectedCategories([]);
    setSingleCategory(trimmedCategory);

    if (!trimmedCategory) {
      router.push('/clubs');
      return;
    }

    const encoded = encodeURIComponent(trimmedCategory);
    router.push(`/clubs?category=${encoded}`);
  };

  // Search by multiple categories - clears name search
  const searchByCategories = (categories) => {
    const validCategories = Array.isArray(categories) ? categories.filter(Boolean) : [];
    
    // Clear name search and single category
    setSearchTerm('');
    setSingleCategory('');
    setSelectedCategories(validCategories);

    if (validCategories.length === 0) {
      router.push('/clubs');
      return;
    }

    const encoded = encodeURIComponent(validCategories.join(','));
    router.push(`/clubs?categories=${encoded}`);
  };

  // Get current search state for UI display
  const getCurrentSearchState = () => {
    if (searchTerm) return { type: 'name', value: searchTerm };
    if (singleCategory) return { type: 'category', value: singleCategory };
    if (selectedCategories.length > 0) return { type: 'categories', value: selectedCategories };
    return { type: 'none', value: null };
  };

  // Check if we're currently on the clubs page (for conditional behavior)
  const isOnClubsPage = pathname === '/clubs';

  const value = {
    // State
    searchTerm,
    selectedCategories,
    singleCategory,
    isOnClubsPage,
    
    // Actions
    searchByName,
    searchBySingleCategory,
    searchByCategories,
    clearAllSearch,
    getCurrentSearchState,
    
    // Direct state setters (for internal component use)
    setSearchTerm,
    setSelectedCategories,
    setSingleCategory,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};