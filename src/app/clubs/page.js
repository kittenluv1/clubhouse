"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClubCard from "../components/clubCard";
import Filter from "../components/filter";
import ErrorScreen from "../components/ErrorScreen";
import LoadingScreen from "../components/LoadingScreen";
import SortModal from "../components/sortModal";
import Button from "../components/button";

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
      <div className="flex flex-col space-y-6 p-6 lg:p-30 lg:py-20">
        <div className=" mb-10 lg:mb-20 flex items-start justify-between">
          <Filter
            initialSelectedTags={initialSelectedTags}
            show={filterParam}
            onInteraction={() => setShowSortModal(false)}
          />

          {isMobile ? (
            <>
              <Button
                type="border"
                size="small"
                onClick={() => setShowSortModal(true)}
              >
                Sort By
              </Button>
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
            <div className="flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full border-1 py-2 px-4 text-sm border-[#6E808D] hover:bg-[#E5EBF1]">
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
          <Button
            type="pink"
            size="small"
            onClick={handlePreviousPage}
            disabled={currPage === 1}
            style="flex items-center gap-2"
          >
            <svg width="5" height="10" viewBox="0 0 5 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 0.81727L4.25637 0L0.206022 4.45412C0.140733 4.5255 0.0889179 4.61037 0.0535603 4.70385C0.0182026 4.79734 0 4.89759 0 4.99884C0 5.1001 0.0182026 5.20035 0.0535603 5.29384C0.0889179 5.38732 0.140733 5.47219 0.206022 5.54356L4.25637 10L4.9993 9.18273L1.19776 5L5 0.81727Z" fill="black" />
            </svg>
            Previous
          </Button>
          <span>
            Page {currPage} of {pageTotal}
          </span>
          <Button
            type="pink"
            size="small"
            onClick={handleNextPage}
            disabled={currPage === pageTotal}
            style="flex items-center gap-2"
          >
            Next
            <svg width="5" height="10" viewBox="0 0 5 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0.81727L0.743627 0L4.79398 4.45412C4.85927 4.5255 4.91108 4.61037 4.94644 4.70385C4.9818 4.79734 5 4.89759 5 4.99884C5 5.1001 4.9818 5.20035 4.94644 5.29384C4.91108 5.38732 4.85927 5.47219 4.79398 5.54356L0.743627 10L0.000700951 9.18273L3.80224 5L0 0.81727Z" fill="black" />
            </svg>
          </Button>
        </div>
      </div>
    </>
  );
}

export default AllClubsPage;
