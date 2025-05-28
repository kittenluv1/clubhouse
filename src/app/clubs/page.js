"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClubCard from "../components/clubCard";
import Filter from "../components/filter";
import ErrorScreen from "../components/ErrorScreen";
import LoadingScreen from "../components/LoadingScreen";
import SortModal from "../components/sortModal";
import MobileNavbar from "../components/MobileNavbar";

function AllClubsPage() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") ?? null;
  const singleCategoryParam = searchParams.get("category") ?? null;
  const multiCategoriesParam = searchParams.get("categories") ?? null;
  const filterParam = searchParams.has("showCategories");

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTotal, setPageTotal] = useState(1);
  const [currPage, setCurrPage] = useState(1);
  const [sortType, setSortType] = useState("rating");
  const [isMobile, setIsMobile] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const router = useRouter();

  const initialSelectedTags = multiCategoriesParam
    ? multiCategoriesParam.split(",")
    : [];

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setShowSortModal(false);
  }, [nameParam, singleCategoryParam, multiCategoriesParam]);

  useEffect(() => {
    setError(null);
    let url = `/api/clubs?page=${currPage}&sort=${sortType}`;
    if (nameParam) {
      url = `/api/clubs?name=${encodeURIComponent(
        nameParam,
      )}&page=${currPage}&sort=${sortType}`;
    } else if (multiCategoriesParam) {
      url = `/api/categories/multi?list=${encodeURIComponent(
        multiCategoriesParam,
      )}&page=${currPage}&sort=${sortType}`;
    } else if (singleCategoryParam) {
      url = `/api/categories/${encodeURIComponent(
        singleCategoryParam,
      )}?page=${currPage}&sort=${sortType}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setClubs(data.orgList || []);
        setPageTotal(data.totalNumPages || 1);
      })
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs");
      })
      .finally(() => setLoading(false));
  }, [
    currPage,
    sortType,
    nameParam,
    singleCategoryParam,
    multiCategoriesParam,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currPage]);

  const handlePreviousPage = () => currPage > 1 && setCurrPage((p) => p - 1);
  const handleNextPage = () =>
    currPage < pageTotal && setCurrPage((p) => p + 1);

  if (loading) return LoadingScreen();
  if (error) return <ErrorScreen error={error} />;

  const title = nameParam
    ? `Search results for "${nameParam}"`
    : multiCategoriesParam
      ? `Clubs in "${multiCategoriesParam.replaceAll(",", ", ")}"`
      : singleCategoryParam
        ? `Clubs in "${singleCategoryParam}"`
        : "All Clubs";

  return (
    <>
      <div className="flex flex-col space-y-6 p-6 md:p-20">
        <div className="mb-6 flex items-start justify-between">
          <Filter
            initialSelectedTags={initialSelectedTags}
            show={filterParam}
            onInteraction={() => setShowSortModal(false)}
          />

          {isMobile ? (
            <>
              <button
                onClick={() => setShowSortModal(true)}
                className="flex-shrink-0 rounded-full border border-black bg-[#FFF7D6] px-4 py-2 font-bold text-black"
              >
                Sort by
              </button>
              <SortModal
                open={showSortModal}
                onClose={() => setShowSortModal(false)}
                selected={sortType}
                onSelect={(newSort) => setSortType(newSort)}
                sortOptions={[
                  { label: "Highest Rated", value: "rating" },
                  { label: "Most Reviewed", value: "reviews" },
                  { label: "A – Z", value: "alphabetical" },
                ]}
              />
            </>
          ) : (
            <div className="flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full border border-black bg-[#FFF7D6] px-4 py-2">
              <label className="cursor-pointer font-medium text-black">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="cursor-pointer font-bold text-black outline-hidden"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </div>
          )}
        </div>

        <h1 className="mb-4 text-[16px] font-normal">{title}</h1>

        <div className="grid grid-cols-1 gap-12">
          {clubs.map((club) => (
            <ClubCard
              key={`${club.OrganizationID}-${club.OrganizationName}`}
              club={club}
            />
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currPage === 1}
            className="rounded-xl border border-black bg-[#FFB0D8] px-4 py-2 font-medium text-black transition-colors duration-200 hover:bg-[#F6E18C] disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currPage} of {pageTotal}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currPage === pageTotal}
            className="rounded-xl border border-black bg-[#FFB0D8] px-4 py-2 font-medium text-black transition-colors duration-200 hover:bg-[#F6E18C] disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <MobileNavbar />
      </div>
    </>
  );
}

export default AllClubsPage;
