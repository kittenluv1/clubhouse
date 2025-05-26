"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClubCard from "../components/clubCard";
import Filter from "../components/filter";
import ErrorScreen from "../components/ErrorScreen";
import LoadingScreen from "../components/LoadingScreen";
import SortModal from "../components/sortModal";

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
    setError(null);
    let url = `/api/clubs?page=${currPage}&sort=${sortType}`;
    if (nameParam) {
      url = `/api/clubs?name=${encodeURIComponent(
        nameParam
      )}&page=${currPage}&sort=${sortType}`;
    } else if (multiCategoriesParam) {
      url = `/api/categories/multi?list=${encodeURIComponent(
        multiCategoriesParam
      )}&page=${currPage}&sort=${sortType}`;
    } else if (singleCategoryParam) {
      url = `/api/categories/${encodeURIComponent(
        singleCategoryParam
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
      <div className="p-6 md:p-20 space-y-6 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <Filter
            initialSelectedTags={initialSelectedTags}
            show={filterParam}
          />

          {isMobile ? (
            <>
              <button
                onClick={() => setShowSortModal(true)}
                className="flex-shrink-0 bg-[#FFF7D6] text-black border border-black rounded-full font-bold px-4 py-2"
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
            <div className="flex-shrink-0 flex items-center gap-2 border border-black rounded-full bg-[#FFF7D6] px-4 py-2 cursor-pointer">
              <label className="font-medium text-black cursor-pointer">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="text-black font-bold cursor-pointer outline-hidden"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </div>
          )}
        </div>

        <h1 className="text-[16px] font-normal mb-4">{title}</h1>

        <div className="grid grid-cols-1 gap-12">
          {clubs.map((club) => (
            <ClubCard
              key={`${club.OrganizationID}-${club.OrganizationName}`}
              club={club}
            />
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-16">
          <button
            onClick={handlePreviousPage}
            disabled={currPage === 1}
            className="px-4 py-2 bg-[#FFB0D8] hover:bg-[#F6E18C] rounded-xl border border-black text-black font-medium disabled:opacity-50 transition-colors duration-200"
          >
            Previous
          </button>
          <span>
            Page {currPage} of {pageTotal}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currPage === pageTotal}
            className="px-4 py-2 bg-[#FFB0D8] hover:bg-[#F6E18C] rounded-xl border border-black text-black font-medium disabled:opacity-50 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default AllClubsPage;
