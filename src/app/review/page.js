"use client";

import React, { useRef, useState, useEffect } from 'react';
import SearchableDropdown from '../components/searchable-dropdown';
import {QuarterDropdown, YearDropdown} from '../components/dropdowns';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const isEndDateValid = (startQuarter, startYear, endQuarter, endYear) => {
    if (!startQuarter || !startYear || !endQuarter || !endYear) return true;
    
    const startYearNum = parseInt(startYear);
    const endYearNum = parseInt(endYear);
    
    if (endYearNum > startYearNum) return true;
    
    if (endYearNum === startYearNum) {
        const quarters = ['Winter', 'Spring', 'Fall'];
        const startQuarterIndex = quarters.indexOf(startQuarter);
        const endQuarterIndex = quarters.indexOf(endQuarter);
        
        return endQuarterIndex >= startQuarterIndex;
    }
    return false;
};

export default function ReviewPage() {
    const [selectedClub, setSelectedClub] = useState('');
    const [clubId, setClubId] = useState(null);
    const [startQuarter, setStartQuarter] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endQuarter, setEndQuarter] = useState('');
    const [endYear, setEndYear] = useState('');
    const [timeCommitment, setTimeCommitment] = useState(null);
    const [diversityRating, setDiversityRating] = useState(null);
    const [socialCommunity, setSocialCommunity] = useState(null);
    const [competitiveness, setCompetitiveness] = useState(null);
    const [overallSatisfaction, setOverallSatisfaction] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [dateError, setDateError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
      // Listen for auth state changes (e.g., sign in or sign out)
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
          window.location.href = "./sign-in";
        }
      });
      return () => {
        data.subscription.unsubscribe();
      };
    }, []);

    useEffect(() => {
        if (startQuarter && startYear && endQuarter && endYear) {
            const isValid = isEndDateValid(startQuarter, startYear, endQuarter, endYear);
            setDateError(isValid ? null : 'End date cannot be earlier than start date');
        } else {
            setDateError(null);
        }
    }, [startQuarter, startYear, endQuarter, endYear]);

    const handleClubSelect = async (club) => {
        setSelectedClub(club);
        try {
            const { data, error } = await supabase
                .from('clubs')
                .select('OrganizationID')
                .eq('OrganizationName', club)
                .single();
                
            if (error) {
                console.error('Full error object:', error);
                throw new Error(`${error.message}${error.details ? ' - ' + error.details : ''}${error.hint ? ' - ' + error.hint : ''}`);
            }
            setClubId(data.OrganizationID);
        } catch (error) {
            console.error('Error fetching club ID:', error);
            setError('Club not found.');
        }
    };

    const handleStartQuarterChange = (e) => {
        setStartQuarter(e.target.value);
    };

    const handleStartYearChange = (e) => {
        setStartYear(e.target.value);
    };

    const handleEndQuarterChange = (e) => {
        setEndQuarter(e.target.value);
    };

    const handleEndYearChange = (e) => {
        setEndYear(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setDateError(null);
        
        if (!isEndDateValid(startQuarter, startYear, endQuarter, endYear)) {
            setDateError('End date cannot be earlier than start date');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            if (!clubId) throw new Error('Please select a club');
            if (!startQuarter || !startYear) throw new Error('Please select a start date');
            if (!endQuarter || !endYear) throw new Error('Please select an end date');
            if (!reviewText) throw new Error('Please write a review');
            
            let userId = null;
            let updatedAt = null;

            const reviewData = {
                club_id: clubId,
                user_id: userId,
                membership_start_quarter: startQuarter,
                membership_start_year: parseInt(startYear),
                membership_end_quarter: endQuarter,
                membership_end_year: parseInt(endYear),
                time_commitment_rating: timeCommitment,
                diversity_rating: diversityRating,
                social_community_rating: socialCommunity,
                competitiveness_rating: competitiveness,
                overall_satisfaction: overallSatisfaction,
                review_text: reviewText,
                is_anon: isAnonymous,
                updated_at: updatedAt,
            };
            console.log(clubId, 'clubID');
            console.log("Sending review data to Supabase:", reviewData);
            const { data, error } = await supabase
                .from('reviews')
                .insert(reviewData)
                .select(); 

            
            if (error) {
                console.error('Full error object:', error);
                throw new Error(`${error.message}${error.details ? ' - ' + error.details : ''}${error.hint ? ' - ' + error.hint : ''}`);
            }
            
            setSuccess(true);
            resetForm();
            
        } catch (error) {
            console.error('Error submitting review:', error);
            setError(error.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setSelectedClub('');
        setClubId(null);
        setStartQuarter('');
        setStartYear('');
        setEndQuarter('');
        setEndYear('');
        setTimeCommitment(null);
        setDiversityRating(null);
        setSocialCommunity(null);
        setCompetitiveness(null);
        setOverallSatisfaction(null);
        setReviewText('');
        setIsAnonymous(true);
        setDateError(null);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-20 flex justify-center overflow-x-hidden">

        <div className="flex flex-col w-full h-full justify-center">
            <div className="text-6xl font-bold text-blue-700">Review A Club</div>
            <p className="py-6 text text-gray-700">
            Your review is completely anonymous, so feel free to be honest! 
                Your insights help other students get a better sense of what the club is really like. 
                Be real, respectful, and specific—your voice makes a difference.
            </p>
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Review submitted successfully! Thank you for your contribution.
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Club Name */}
                <div className="w-full md:w-1/2">
                    <label className="block text-lg font-bold text-gray-700 mb-2">Club Name *</label>
                    <div className="mb-4">
                        <SearchableDropdown 
                            tableName="clubs"  
                            onSelect={handleClubSelect}
                            value={selectedClub}
                        />
                    </div>
                </div>
                
                {/* Membership dates */}
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className="flex-1">
                        <label className="block text-lg font-bold text-gray-700 mb-2">
                            Club Membership Start Date *
                        </label>
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <QuarterDropdown 
                                    value={startQuarter}
                                    onChange={(e) => setStartQuarter(e.target.value)}
                                    required={true}
                                />
                            </div>
                            <div className="w-1/2">
                                <YearDropdown 
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                    required={true}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <label className="block text-lg font-bold text-gray-700 mb-2">
                            Club Membership End Date *
                        </label>
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <QuarterDropdown 
                                    value={endQuarter}
                                    onChange={(e) => setEndQuarter(e.target.value)}
                                    required={true}
                                />
                            </div>
                            <div className="w-1/2">
                                <YearDropdown 
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    required={true}
                                />
                            </div>
                        </div>
                        {dateError && (
                            <p className="text-red-500 text-sm mt-2">{dateError}</p>
                        )}
                    </div>
                </div>
                
                {/* Ratings */}
                <div>
                    <label className="block text-lg font-bold text-gray-700 mb-4">Rank the Following...</label>
                    <div className='flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 w-full'>
                            <div className="flex-1 min-w-[180px]">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700 text-center mb-1">
                                        Time Commitment
                                    </label>
                                    <span className="text-sm text-gray-500 mb-1">
                                        {timeCommitment}
                                    </span>
                                </div>                                
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-xs text-gray-500">Low</span>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="0.1"
                                        value={timeCommitment || 3}
                                        onChange={(e) => setTimeCommitment(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">High</span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Diversity
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {diversityRating}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Low</span>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="0.1"
                                        value={diversityRating || 3}
                                        onChange={(e) => setDiversityRating(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">High</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-[180px]">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Social Community
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {socialCommunity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Poor</span>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="0.1"
                                        value={socialCommunity || 3}
                                        onChange={(e) => setSocialCommunity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">Great</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-[180px]">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Competitiveness
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {competitiveness}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Low</span>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="0.1"
                                        value={competitiveness || 3}
                                        onChange={(e) => setCompetitiveness(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">High</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-[180px]">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Overall Satisfaction
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {overallSatisfaction}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Poor</span>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="0.1"
                                        value={overallSatisfaction || 3}
                                        onChange={(e) => setOverallSatisfaction(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs text-gray-500">Excellent</span>
                                </div>
                            </div>
                    </div>
                </div>
                
                {/* Review Text */}
                <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">Review *</label>
                    <textarea 
                        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="Write your review here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                    ></textarea>
                </div>
                
                {/* Anonymous Toggle */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                        Submit review anonymously
                    </label>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || dateError}
                        className="bg-blue-700 border-blue-600 text-white text-lg rounded-xl py-2 px-6 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
        </div>
        
    );
}