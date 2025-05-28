import { useState } from "react";

function MobileRatingsDropdown({ club }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      {open && (
        <div id="rating-bars-menu" className="mt-2 grid grid-cols-1 gap-4">
          {/* Time Commitment */}
          <div>
            <div className="mb-1 flex justify-between">
              <span>Time Commitment</span>
              <span>
                {club.average_time_commitment
                  ? club.average_time_commitment.toFixed(1)
                  : "N/A"}
                /5
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#b4d59f]"
                style={{
                  width: `${club.average_time_commitment ? (club.average_time_commitment / 5) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>low</span>
              <span>high</span>
            </div>
          </div>
          {/* Inclusivity */}
          <div>
            <div className="mb-1 flex justify-between">
              <span>Inclusivity</span>
              <span>
                {club.average_inclusivity
                  ? club.average_inclusivity.toFixed(1)
                  : "N/A"}
                /5
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#b4d59f]"
                style={{
                  width: `${club.average_inclusivity ? (club.average_inclusivity / 5) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>low</span>
              <span>high</span>
            </div>
          </div>
          {/* Social Community */}
          <div>
            <div className="mb-1 flex justify-between">
              <span>Social Community</span>
              <span>
                {club.average_social_community
                  ? club.average_social_community.toFixed(1)
                  : "N/A"}
                /5
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#b4d59f]"
                style={{
                  width: `${club.average_social_community ? (club.average_social_community / 5) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>low</span>
              <span>high</span>
            </div>
          </div>
          {/* Competitiveness */}
          <div>
            <div className="mb-1 flex justify-between">
              <span>Competitiveness</span>
              <span>
                {club.average_competitiveness
                  ? club.average_competitiveness.toFixed(1)
                  : "N/A"}
                /5
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#b4d59f]"
                style={{
                  width: `${club.average_competitiveness ? (club.average_competitiveness / 5) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>low</span>
              <span>high</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileRatingsDropdown;
