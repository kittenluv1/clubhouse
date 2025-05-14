"use client";

import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../components/searchable-dropdown';
import {QuarterDropdown, YearDropdown} from '../components/dropdowns';
import CustomSlider from '../components/custom-slider';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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
    const [timeCommitment, setTimeCommitment] = useState(3);
    const [diversityRating, setDiversityRating] = useState(3);
    const [socialCommunity, setSocialCommunity] = useState(3);
    const [competitiveness, setCompetitiveness] = useState(3);
    const [overallSatisfaction, setOverallSatisfaction] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isMember, setIsMember] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [dateError, setDateError] = useState(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

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
            router.push('/review/thankyou');
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
        setTimeCommitment(3);
        setDiversityRating(3);
        setSocialCommunity(3);
        setCompetitiveness(3);
        setOverallSatisfaction(null);
        setReviewText('');
        setIsAnonymous(true);
        setIsMember(false);
        setDateError(null);
    };

    const StarRating = ({ rating, setRating }) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-4xl focus:outline-none"
                    >
                        {star <= (rating || 0) ? "★" : "☆"}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4 md:p-12">
            <div className="max-w-4xl mx-auto font-dm-sans">
                <div className="text-5xl font-bold mt-8 mb-8">Review a Club</div>
                <p className="text mb-12">
                    Your review is completely anonymous, so feel free to be honest! Your insights help other students get a better sense of what the club is really like. 
                    Be real, respectful, and specific—your voice makes a difference.
                </p>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Club Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Club Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <SearchableDropdown 
                                tableName="clubs"  
                                onSelect={handleClubSelect}
                                value={selectedClub}
                                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    {/* Membership dates */}
                    <div className="grid grid-cols-1 mt-12 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Club Membership Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-2">
                                <div className="w-1/2">
                                    <QuarterDropdown 
                                        value={startQuarter}
                                        onChange={(e) => setStartQuarter(e.target.value)}
                                        required={true}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <YearDropdown 
                                        value={startYear}
                                        onChange={(e) => setStartYear(e.target.value)}
                                        required={true}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Club Membership End Date <span className="text-red-500">*</span>
                            </label>
                            <div className="flex space-x-2">
                                <div className="w-1/2">
                                    <QuarterDropdown 
                                        value={endQuarter}
                                        onChange={(e) => setEndQuarter(e.target.value)}
                                        required={true}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <YearDropdown 
                                        value={endYear}
                                        onChange={(e) => setEndYear(e.target.value)}
                                        required={true}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {dateError && (
                                <p className="text-red-500 text-xs mt-1">{dateError}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Current Member Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="member"
                            checked={isMember}
                            onChange={(e) => setIsMember(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="member" className="font-bold ml-2 block text-sm text-gray-700">
                            I am currently a member
                        </label>
                    </div>
                    
                    {/* Ratings */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mt-10 mb-4">Rank the Following... <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                                    {/* Timer/Clock SVG icon */}
                                    <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 5.1582C28.2843 5.1582 35 12.0872 35 20.6338C34.9998 29.1802 28.2841 36.1084 20 36.1084C11.7159 36.1084 5.00024 29.1802 5 20.6338C5 12.0872 11.7157 5.1582 20 5.1582ZM20 10.1768C19.4477 10.1768 19 10.6245 19 11.1768V20.3838C19.0002 21.0739 19.5598 21.6338 20.25 21.6338H25.833L25.9355 21.6289C26.4397 21.5777 26.8328 21.1514 26.833 20.6338C26.833 20.116 26.4398 19.6899 25.9355 19.6387L25.833 19.6338H21V11.1768C21 10.6245 20.5523 10.1768 20 10.1768Z" fill="#222222"/>
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-green-800 mb-3">Time Commitment</span>
                                <div className="relative w-full">
                                    <CustomSlider
                                        value={timeCommitment}
                                        onChange={(val) => setTimeCommitment(val)}
                                        lowLabel="low"
                                        highLabel="high"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    {/* Diversity SVG icon */}
                                    <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M13.28 5.64725C15.3866 4.64367 17.6796 4.12479 20 4.12661C22.8114 4.12612 25.5732 4.88986 28.0075 6.34092C30.4417 7.79198 32.4624 9.87912 33.8659 12.3922H32.3899C31.0899 12.3922 30.0359 12.908 30.0359 14.2491C30.0359 14.93 30.0359 18.4582 25.984 18.3922C22.04 18.3922 22.04 14.8186 22.04 14.2491C22.04 11.3007 20.466 10.8447 18.536 10.2814C17.788 10.0648 16.988 9.83161 16.204 9.4334C14.196 8.40794 13.508 6.99252 13.28 5.64725ZM8 4.12661C5.67633 5.93163 3.75794 8.23308 2.37601 10.8736C0.812309 13.8733 -0.00416438 17.227 1.5972e-05 20.633C1.5972e-05 31.5457 8.212 40.4798 18.608 41.2164L18.716 41.2246C19.4851 41.2754 20.2563 41.2802 21.026 41.2391H21.03C22.0381 41.1867 23.041 41.0556 24.03 40.8471C25.5907 40.516 27.1074 39.9937 28.548 39.2913C33.0677 37.0797 36.6245 33.2072 38.5219 28.4322C39.5048 25.9573 40.0069 23.3075 39.9999 20.633C40.0016 18.893 39.7899 17.1599 39.3699 15.4747C38.2612 11.0449 35.7568 7.12081 32.2505 4.31958C28.7441 1.51835 24.4347 -0.00114436 20 1.84345e-05C15.6716 -0.00596058 11.4592 1.44263 8 4.12661ZM34.7439 27.056C34.2576 26.9037 33.7522 26.8259 33.2439 26.8249H32.8099C31.0042 26.8249 29.2723 27.5648 27.9953 28.8819C26.7182 30.199 26.0005 31.9854 26 33.8484V35.9405C29.9402 34.2896 33.0848 31.0957 34.7439 27.056ZM20.228 37.1393H20C17.1814 37.1396 14.4128 36.3718 11.9743 34.9136C9.53582 33.4554 7.51397 31.3585 6.1134 28.8352C4.71282 26.3119 3.98322 23.4516 3.99843 20.5439C4.01364 17.6362 4.77311 14.7842 6.2 12.2766C8.1 13.3929 9.042 15.4479 9.86999 17.2595C10.288 18.1694 10.676 19.0195 11.144 19.657C12.224 21.1261 13.27 21.7595 14.326 22.3971C15.366 23.0264 16.42 23.6619 17.526 25.1124C20.406 28.8779 20.364 34.1207 20.226 37.1372L20.228 37.1393Z" fill="black"/>
                                    </svg>

                                </div>
                                <span className="text-xs font-medium text-green-800 mb-3">Diversity</span>
                                <div className="relative w-full">
                                    <CustomSlider
                                        value={diversityRating}
                                        onChange={(val) => setDiversityRating(val)}
                                        lowLabel="low"
                                        highLabel="high"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                                    {/* Social Community SVG icon */}
                                    <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="20.0002" cy="15.4999" r="6.66667" fill="#33363F"/>
                                    <circle cx="28.3335" cy="15.5" r="5" fill="#33363F"/>
                                    <circle cx="11.6665" cy="15.5" r="5" fill="#33363F"/>
                                    <path d="M28.334 22.1667C32.8461 22.1671 34.3661 27.1536 34.8232 29.4119C34.9406 29.9916 34.487 30.4996 33.8955 30.4998H29.2793C28.6075 27.984 27.3097 25.1301 24.7979 23.4998C25.7013 22.702 26.8572 22.1667 28.334 22.1667Z" fill="#33363F"/>
                                    <path d="M11.6665 22.1667C13.1429 22.1667 14.2973 22.7024 15.2007 23.4998C12.6895 25.1302 11.3929 27.9844 10.7212 30.4998H6.105C5.51337 30.4998 5.05891 29.9917 5.17628 29.4119C5.63345 27.1536 7.15397 22.1668 11.6665 22.1667Z" fill="#33363F"/>
                                    <path d="M19.9998 23.8333C26.7064 23.8333 28.0156 30.3101 28.2712 32.8388C28.3267 33.3883 27.8855 33.8333 27.3332 33.8333H12.6665C12.1142 33.8333 11.673 33.3883 11.7285 32.8388C11.9841 30.3101 13.2933 23.8333 19.9998 23.8333Z" fill="#33363F"/>
                                    </svg>

                                </div>
                                <span className="text-xs font-medium text-green-800 mb-3">Social Community</span>
                                <div className="relative w-full">
                                    <CustomSlider
                                        value={socialCommunity}
                                        onChange={(val) => setSocialCommunity(val)}
                                        lowLabel="low"
                                        highLabel="high"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center space-y-1">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                                    {/* Competitiveness SVG icon */}
                                    <svg width="40" height="42" viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.88889 17.8822V9.17036H4.44444V11.463C4.44444 12.9149 4.85185 14.224 5.66667 15.3902C6.48148 16.5563 7.55555 17.387 8.88889 17.8822ZM31.1111 17.8822C32.4444 17.3855 33.5185 16.554 34.3333 15.3879C35.1481 14.2217 35.5556 12.9134 35.5556 11.463V9.17036H31.1111V17.8822ZM17.7778 36.6815V29.5744C15.963 29.1541 14.343 28.3616 12.9178 27.197C11.4926 26.0324 10.4459 24.5705 9.77778 22.8113C7 22.4674 4.6763 21.2164 2.80667 19.0583C0.937037 16.9002 0.00148148 14.3684 0 11.463V9.17036C0 7.90944 0.435556 6.83039 1.30667 5.93322C2.17778 5.03606 3.2237 4.58671 4.44444 4.58518H8.88889C8.88889 3.32426 9.32444 2.24521 10.1956 1.34804C11.0667 0.450876 12.1126 0.00152839 13.3333 0H26.6667C27.8889 0 28.9356 0.449348 29.8067 1.34804C30.6778 2.24674 31.1126 3.32579 31.1111 4.58518H35.5556C36.7778 4.58518 37.8244 5.03453 38.6956 5.93322C39.5667 6.83192 40.0015 7.91097 40 9.17036V11.463C40 14.3669 39.0644 16.8987 37.1933 19.0583C35.3222 21.2179 32.9985 22.4689 30.2222 22.8113C29.5556 24.5689 28.5096 26.0308 27.0844 27.197C25.6593 28.3632 24.0385 29.1556 22.2222 29.5744V36.6815H28.8889C29.5185 36.6815 30.0467 36.9015 30.4733 37.3417C30.9 37.7819 31.1126 38.326 31.1111 38.974C31.1096 39.6221 30.8963 40.167 30.4711 40.6087C30.0459 41.0504 29.5185 41.2697 28.8889 41.2666H11.1111C10.4815 41.2666 9.95407 41.0465 9.52889 40.6064C9.1037 40.1662 8.89037 39.6221 8.88889 38.974C8.88741 38.326 9.10074 37.7819 9.52889 37.3417C9.95704 36.9015 10.4844 36.6815 11.1111 36.6815H17.7778Z" fill="black"/>
                                    </svg>

                                </div>
                                <span className="text-xs font-medium text-green-800 mb-3">Competitiveness</span>
                                <div className="relative w-full">
                                    <CustomSlider
                                        value={competitiveness}
                                        onChange={(val) => setCompetitiveness(val)}
                                        lowLabel="low"
                                        highLabel="high"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Satisfaction Stars */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mt-10 mb-5">
                            How satisfied are you with your club experience?
                        </label>
                        <StarRating 
                            rating={overallSatisfaction} 
                            setRating={setOverallSatisfaction} 
                        />
                    </div>
                    
                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Your Club Review <span className="text-red-500">*</span></label>
                        <textarea 
                            className="w-full h-32 p-3 border bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 text-sm"
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
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isSubmitting || dateError}
                            className="w-24 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition duration-300 ease-in-out disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}