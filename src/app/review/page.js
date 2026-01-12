"use client";

import React, { useState, useEffect } from "react";
import SearchableDropdown from "../components/searchable-dropdown";
import { QuarterYearDropdown } from "../components/dropdowns";
import CustomSlider from "../components/custom-slider";
import { supabase } from "../lib/db";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AiFillStar } from "react-icons/ai";
import Tooltip from "../components/tooltip";
import LoadingScreen from "../components/LoadingScreen";
import Button from "../components/button";

const nouns = [
  "Panda",
  "Koala",
  "Otter",
  "Bunny",
  "Duckling",
  "Squirrel",
  "Hedgehog",
  "Fox",
  "Penguin",
  "Dolphin",
  "Shark",
  "Spider",
  "Unicorn",
  "Lemur",
  "Platypus",
  "Axolotl",
  "Capybara",
  "Narwhal",
  "Sloth",
  "SugarGlider",
  "Newt",
  "Hummingbird",
  "Firefly",
  "Mermaid",
  "Saola",
  "Quokka",
  "Pangolin",
  "Kitten",
  "Student",
  "Bruin",
  "Doodle",
  "Notebook",
  "Scribble",
  "Origami",
  "Flower",
  "Acorn",
  "Pebble",
  "Dewdrop",
  "Cloud",
  "Sunbeam",
  "Raindrop",
  "Fawn",
  "Pinecone",
  "Nymph",
  "Faerie",
  "Jackalope",
  "Fern",
  "Rose",
  "Ivy",
  "Clover",
  "Twilight",
  "Frost",
  "Sprite",
  "Seashell",
  "Moss",
  "Matcha",
  "Sandwich",
  "Bagel",
  "Noodle",
  "Cupcake",
  "Marshmallow",
  "Donut",
  "Macaron",
  "Cookie",
  "Peach",
  "Mochi",
  "Taffy",
  "Toast",
  "Muffin",
  "Taco",
  "Dumpling",
  "Rice",
  "Omelet",
  "Naan",
  "Pizza",
  "Boba",
  "Latte",
  "Lemonade",
  "Smoothie",
  "Espresso",
  "Sushi",
  "Mouse",
  "Açaí",
  "Panini",
  "Salad",
  "Dessert",
  "Churro",
];
const verbs = [
  "Pretty",
  "Fast",
  "Fluffy",
  "Bubbly",
  "Sunny",
  "Zesty",
  "Wiggly",
  "Cheerful",
  "Silky",
  "Jolly",
  "Breezy",
  "Goofy",
  "Fuzzy",
  "Squishy",
  "Swift",
  "Spirited",
  "Wobbly",
  "Mysterious",
  "Anonymous",
  "Silly",
  "Curious",
  "Fancy",
  "Magical",
  "Tiny",
  "Cozy",
  "Mellow",
  "Dreamy",
  "Gentle",
  "Kind",
  "Quiet",
  "Wandering",
  "Thoughtful",
  "Shy",
  "Bashful",
  "Whispering",
  "Nimble",
  "Luminous",
  "Daring",
  "Radiant",
  "Hyper",
  "Solitary",
  "Untamed",
  "Obscure",
  "Invisible",
  "Subtle",
  "Abstract",
  "Private",
  "Creative",
  "Adventurous",
  "Brave",
  "Noble",
  "Clever",
  "Witty",
  "Earnest",
  "Playful",
  "Humble",
  "Wise",
  "Peaceful",
  "Charming",
  "Serene",
];
const anonymousName = () => {
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
  return `${randomVerb}${randomNoun}`;
};

const isEndDateValid = (startQuarter, startYear, endQuarter, endYear) => {
  if (!startQuarter || !startYear || !endQuarter || !endYear) return true;
  const startYearNum = parseInt(startYear);
  const endYearNum = parseInt(endYear);

  if (endYearNum > startYearNum) return true;

  if (endYearNum === startYearNum) {
    const quarters = ["Winter", "Spring", "Fall"];
    return quarters.indexOf(endQuarter) >= quarters.indexOf(startQuarter);
  }
  return false;
};

// Helper function to determine the current quarter
const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1;

  if (month >= 9 && month <= 12) {
    return "Fall";
  } else if (month >= 1 && month <= 3) {
    return "Winter";
  } else {
    return "Spring";
  }
};

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedClub, setSelectedClub] = useState("");
  const [clubId, setClubId] = useState(null);
  const [startQuarter, setStartQuarter] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endQuarter, setEndQuarter] = useState("");
  const [endYear, setEndYear] = useState("");
  const [savedEndQuarter, setSavedEndQuarter] = useState("");
  const [savedEndYear, setSavedEndYear] = useState("");
  const [timeCommitment, setTimeCommitment] = useState(3);
  const [inclusivityRating, setInclusivityRating] = useState(3);
  const [socialCommunity, setSocialCommunity] = useState(3);
  const [competitiveness, setCompetitiveness] = useState(3);
  const [overallSatisfaction, setOverallSatisfaction] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUser(user);
      } else {
        console.error("Error getting user:", error);
        window.location.href = "/sign-in";
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
          window.location.href = "/sign-in";
        }
      },
    );

    // cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Getting club name and ID from URL parameters
  useEffect(() => {
    const clubFromUrl = searchParams.get("club");
    const clubIdFromUrl = searchParams.get("clubId");

    if (clubFromUrl) {
      setSelectedClub(decodeURIComponent(clubFromUrl));
    }

    if (clubIdFromUrl) {
      setClubId(parseInt(clubIdFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    if (startQuarter && startYear && endQuarter && endYear) {
      const isValid = isEndDateValid(
        startQuarter,
        startYear,
        endQuarter,
        endYear,
      );
      setDateError(
        isValid ? null : "End date cannot be earlier than start date",
      );
    } else {
      setDateError(null);
    }
  }, [startQuarter, startYear, endQuarter, endYear]);

  const handleMembershipCheckbox = (e) => {
    const checked = e.target.checked;
    if (checked) {
      if (endQuarter && endYear) {
        setSavedEndQuarter(endQuarter);
        setSavedEndYear(endYear);
      }
      setEndQuarter(getCurrentQuarter());
      setEndYear(new Date().getFullYear().toString());
    } else {
      setEndQuarter(savedEndQuarter || "");
      setEndYear(savedEndYear || "");
    }
    setIsMember(checked);
  };

  const handleClubSelect = async (club) => {
    setSelectedClub(club);
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("OrganizationID")
        .eq("OrganizationName", club)
        .single();

      if (error) {
        console.error("Full error object:", error);
        throw new Error(
          `${error.message}${error.details ? " - " + error.details : ""}${error.hint ? " - " + error.hint : ""}`,
        );
      }
      setClubId(data.OrganizationID);
    } catch (error) {
      console.error("Error fetching club ID:", error);
      setError("Club not found.");
    }
  };

  const handleStartQuarterChange = (e) => {
    setStartQuarter(e.target.value);
  };

  const handleStartYearChange = (e) => {
    setStartYear(e.target.value);
  };

  const handleEndQuarterChange = (e) => {
    if (!isMember) {
      setEndQuarter(e.target.value);
    }
  };

  const handleEndYearChange = (e) => {
    if (!isMember) {
      setEndYear(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setDateError(null);

    if (!isEndDateValid(startQuarter, startYear, endQuarter, endYear)) {
      setDateError("End date cannot be earlier than start date");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!clubId) throw new Error("Please select a club");
      if (!startQuarter || !startYear)
        throw new Error("Please select a start date");
      if (!endQuarter || !endYear) throw new Error("Please select an end date");
      if (!reviewText) throw new Error("Please write a review");

      if (overallSatisfaction === null)
        throw new Error("Please rate your overall satisfaction");

      let userAlias = anonymousName();

      const reviewData = {
        club_id: clubId,
        user_id: currentUser?.id,
        user_email: currentUser?.email,
        membership_start_quarter: startQuarter,
        membership_start_year: parseInt(startYear),
        membership_end_quarter: endQuarter,
        membership_end_year: parseInt(endYear),
        time_commitment_rating: timeCommitment,
        inclusivity_rating: inclusivityRating,
        social_community_rating: socialCommunity,
        competitiveness_rating: competitiveness,
        overall_satisfaction: overallSatisfaction,
        review_text: reviewText,
        updated_at: null,
        club_name: selectedClub,
        user_alias: userAlias,
      };

      const { data, error } = await supabase
        .from("pending_reviews")
        .insert(reviewData)
        .select();

      if (error) throw new Error(error.message);

      await fetch(
        `${process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL}/send-review-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            club_name: data[0].club_name,
            overall_satisfaction: data[0].overall_satisfaction,
            review_text: data[0].review_text,
            user_email: data[0].user_email,
          }),
        },
        console.log("HERE IS EMAIL", data[0].user_email),
      );

      router.push("/review/thankyou");

    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.message || "Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClub("");
    setClubId(null);
    setStartQuarter("");
    setStartYear("");
    setEndQuarter("");
    setEndYear("");
    setSavedEndQuarter("");
    setSavedEndYear("");
    setTimeCommitment(3);
    setInclusivityRating(3);
    setSocialCommunity(3);
    setCompetitiveness(3);
    setOverallSatisfaction(null);
    setReviewText("");
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
            className="text-6xl focus:outline-none"
          >
            {star <= (rating || 0) ? (
              <AiFillStar className="mr-2 text-4xl text-yellow-400" />
            ) : (
              <AiFillStar className="mr-2 text-4xl" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isSubmitting) return LoadingScreen();

  return (
    <div className="min-h-screen w-full p-10 md:p-12">
      <div className="font-dm-sans mx-auto max-w-7xl">
        <div className="my-10 text-6xl font-bold md:my-18">Review a Club</div>
        <div className="mb-10 max-w-6xl space-y-10">
          <p>
            Your review is completely anonymous, so feel free to be honest! Your
            insights help other students get a better sense of what the club is
            really like. Be real, respectful, and specific—your voice makes a
            difference.
          </p>
          <p>
            Review our Community Guidelines for posting reviews{" "}
            <Link href="/community-guidelines" className="underline">
              here
            </Link>
            .
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club Name */}
          <div>
            <label className="mb-3 block text-lg font-bold">
              Club Name <span className="text-red-500">*</span>
            </label>
            <div className="max-w-md">
              <SearchableDropdown
                tableName="clubs"
                onSelect={handleClubSelect}
                value={selectedClub}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholderColor="#374151"
              />
            </div>
          </div>

          {/* Membership dates */}
          <div className="mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-lg font-bold">
                Club Membership Start Date{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <QuarterYearDropdown
                    selectedQuarter={startQuarter}
                    selectedYear={startYear}
                    onQuarterChange={handleStartQuarterChange}
                    onYearChange={handleStartYearChange}
                    required={true}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-lg font-bold">
                Club Membership End Date <span className="text-red-500">*</span>
              </label>
              <div className="mb-4 flex space-x-2">
                <div className="w-1/2">
                  <QuarterYearDropdown
                    selectedQuarter={endQuarter}
                    selectedYear={endYear}
                    onQuarterChange={handleEndQuarterChange}
                    onYearChange={handleEndYearChange}
                    required={true}
                    disabled={isMember}
                  />
                </div>
              </div>
              {dateError && (
                <p className="mt-1 text-xs text-red-500">{dateError}</p>
              )}
              {/* Current Member Checkbox */}
              <div className="flex">
                <input
                  type="checkbox"
                  id="member"
                  checked={isMember}
                  onChange={handleMembershipCheckbox}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label
                  htmlFor="member"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I am currently a member.
                </label>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex h-15 w-15 items-center justify-center rounded-full">
                  {/* Timer/Clock SVG icon */}
                  <svg
                    width="54"
                    height="51"
                    viewBox="0 0 54 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27 10.8V25.5L37.4 30.4M53 25.5C53 39.031 41.3594 50 27 50C12.6406 50 1 39.031 1 25.5C1 11.969 12.6406 1 27 1C41.3594 1 53 11.969 53 25.5Z"
                      stroke="#005A32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-6 mb-6 flex items-center justify-center gap-1">
                  <span className="text-center text-xs font-medium text-green-800">
                    Time Commitment
                  </span>
                  <Tooltip rating="timeCommitment" />
                </div>
                <div className="lg:2-full relative w-full md:w-3/4">
                  <CustomSlider
                    value={timeCommitment}
                    onChange={(val) => setTimeCommitment(val)}
                    lowLabel="low"
                    highLabel="high"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full">
                  {/* Inclusivity SVG icon */}
                  <svg
                    width="55"
                    height="51"
                    viewBox="0 0 55 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.5 1C34.1284 7.70896 37.8953 16.4155 38.1 25.5C37.8953 34.5845 34.1284 43.291 27.5 50M27.5 1C20.8716 7.70896 17.1047 16.4155 16.9 25.5C17.1047 34.5845 20.8716 43.291 27.5 50M27.5 1C12.8645 1 1 11.969 1 25.5C1 39.031 12.8645 50 27.5 50M27.5 1C42.1355 1 54 11.969 54 25.5C54 39.031 42.1355 50 27.5 50M2.32505 18.15H52.6751M2.325 32.85H52.675"
                      stroke="#005A32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-6 mb-6 flex items-center justify-center gap-1">
                  <span className="text-center text-xs font-medium text-green-800">
                    Inclusivity
                  </span>
                  <Tooltip rating="inclusivity" />
                </div>
                <div className="lg:2-full relative w-full md:w-3/4">
                  <CustomSlider
                    value={inclusivityRating}
                    onChange={(val) => setInclusivityRating(val)}
                    lowLabel="low"
                    highLabel="high"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full">
                  {/* Social Community SVG icon */}
                  <svg
                    width="55"
                    height="45"
                    viewBox="0 0 55 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M38.1 2.18316C42.0266 4.04569 44.725 7.91323 44.725 12.3824C44.725 16.8515 42.0266 20.719 38.1 22.5815M43.4 35.8209C47.4054 37.5509 51.0122 40.3703 54 44M1 44C6.1582 37.7336 13.1613 33.8824 20.875 33.8824C28.5887 33.8824 35.5918 37.7336 40.75 44M32.8 12.3824C32.8 18.6687 27.461 23.7647 20.875 23.7647C14.289 23.7647 8.95 18.6687 8.95 12.3824C8.95 6.09605 14.289 1 20.875 1C27.461 1 32.8 6.09605 32.8 12.3824Z"
                      stroke="#005A32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-6 mb-6 flex items-center justify-center gap-1">
                  <span className="text-center text-xs font-medium text-green-800">
                    Social Community
                  </span>
                  <Tooltip rating="socialCommunity" />
                </div>
                <div className="lg:2-full relative w-full md:w-3/4">
                  <CustomSlider
                    value={socialCommunity}
                    onChange={(val) => setSocialCommunity(val)}
                    lowLabel="low"
                    highLabel="high"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full">
                  {/* Competitiveness SVG icon */}
                  <svg
                    width="54"
                    height="51"
                    viewBox="0 0 54 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27 32.85C18.3844 32.85 11.4 26.2686 11.4 18.15V4.53889C11.4 3.52496 11.4 3.018 11.5568 2.61205C11.8197 1.93152 12.3886 1.39544 13.1107 1.14775C13.5415 1 14.0796 1 15.1556 1H38.8444C39.9204 1 40.4584 1 40.8893 1.14775C41.6114 1.39544 42.1803 1.93152 42.4432 2.61205C42.6 3.018 42.6 3.52496 42.6 4.53889V18.15C42.6 26.2686 35.6156 32.85 27 32.85ZM27 32.85V40.2M42.6 5.9H49.1C50.3114 5.9 50.9172 5.9 51.395 6.0865C52.032 6.33516 52.5382 6.81211 52.8021 7.41243C53 7.86266 53 8.43344 53 9.575V10.8C53 13.0784 53 14.2176 52.7342 15.1523C52.013 17.6887 49.9105 19.6699 47.2188 20.3496C46.2269 20.6 45.0179 20.6 42.6 20.6M11.4 5.9H4.9C3.68855 5.9 3.08283 5.9 2.60502 6.0865C1.96795 6.33516 1.4618 6.81211 1.19791 7.41243C1 7.86266 1 8.43344 1 9.575V10.8C1 13.0784 1 14.2176 1.26578 15.1523C1.98702 17.6887 4.08949 19.6699 6.78121 20.3496C7.77311 20.6 8.98207 20.6 11.4 20.6M15.1556 50H38.8444C39.4826 50 40 49.5125 40 48.9111C40 44.1001 35.8611 40.2 30.7556 40.2H23.2444C18.1389 40.2 14 44.1001 14 48.9111C14 49.5125 14.5174 50 15.1556 50Z"
                      stroke="#005A32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-6 mb-6 flex items-center justify-center gap-1">
                  <span className="text-center text-xs font-medium text-green-800">
                    Competitiveness
                  </span>
                  <Tooltip rating="competitiveness" />
                </div>
                <div className="lg:2-full relative w-full md:w-3/4">
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
            <label className="mt-20 mb-3 block text-lg font-bold">
              How satisfied are you with your club experience?{" "}
              <span className="text-red-500">*</span>
            </label>
            <StarRating
              rating={overallSatisfaction}
              setRating={setOverallSatisfaction}
            />
          </div>

          {/* Review Text */}
          <div className="mt-10">
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Your Club Review <span className="text-red-500">*</span>
            </label>
            <textarea
              className="h-32 w-full rounded-md border bg-white p-3 text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Write about the recruitment process, types of activities the club offers, professional opportunities, social culture & community, or anything else that shaped your overall experience."
              value={reviewText}
              onChange={(e) => {
                if (e.target.value.length <= 2500) {
                  setReviewText(e.target.value);
                }
              }}
              maxLength={2500}
              required
            ></textarea>
            <div className={`mt-1 text-right text-sm ${reviewText.length >= 2500 ? 'text-red-500' : 'text-gray-500'}`}>
              {reviewText.length} / 2500 Characters
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-10 mb-15 flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting || dateError}
              className="w-24 rounded-full border-1 border-black bg-gray-900 px-4 py-2 font-medium text-white transition duration-300 ease-in-out hover:bg-white hover:text-black disabled:opacity-50"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
