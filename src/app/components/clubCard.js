import Link from "next/link";

var displayOfLikesCounter = 0;
function activeLikeButton(e) {
  e.preventDefault();
  if(e.target.style.backgroundImage == `url("../likeUnfilled.svg")`){
    e.target.style.backgroundImage = 'url(../likeFilled.svg)';
    displayOfLikesCounter = displayOfLikesCounter + 1;
  } else {
    e.target.style.backgroundImage = 'url(../likeUnfilled.svg)';
    displayOfLikesCounter = displayOfLikesCounter - 1;
  }
  var likesCounter = document.getElementById("likesCounter");
  if(displayOfLikesCounter == 0){
    likesCounter.style.display = "none";
  } else {
  likesCounter.style.display = "inline";
  likesCounter.innerHTML = displayOfLikesCounter;
  }  
}

function activeSaveButton(e){
   e.preventDefault();
  if(e.target.style.backgroundImage == `url("../saveUnfilled.svg")`){
    e.target.style.backgroundImage = 'url(../saveFilled.svg)';
  } else {
    e.target.style.backgroundImage = 'url(../saveUnfilled.svg)';
  }
}

export default function ClubCard({ club }) {
  return (
    <Link
      href={`/clubs/${encodeURIComponent(club.OrganizationName)}`}
      className="w-full transform space-y-4 rounded-xl bg-[#E6F4FF] px-4 py-6 transition-all duration-100 hover:shadow-[0_0_13px_#1C6AB380] md:space-y-5 md:px-10 md:py-10"
    >
     <div style={{display: "flex", justifyContent: "space-between"}}>
      <h2 className="text-xl font-bold text-black md:text-2xl">
        {club.OrganizationName}
      </h2>
      <div style={{marginTop: -12, display: "flex", alignItems: "center", justifyContent: "center"}}>
      <button className="hover:bg-[#E5EBF1]" onClick={activeLikeButton} style={{ borderRadius: "30px", backgroundImage: `url("../likeUnfilled.svg")`, height: "37px", width: "37px", backgroundRepeat: 'no-repeat', backgroundPosition: "center"}} ></button>
      <button className="hover:bg-[#E5EBF1]" onClick={activeSaveButton} style={{ borderRadius: "30px", backgroundImage: `url("../saveUnfilled.svg")`, height: "37px", width: "37px", backgroundRepeat: 'no-repeat', backgroundPosition: "center" }} ></button>
      <h1 id="likesCounter" style={{display: "none"}}></h1>
      </div>
      
      </div>
      <div className="flex flex-wrap gap-2">
        {club.Category1Name &&
          <span className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7]">
            {club.Category1Name}
          </span>}
        {club.Category2Name &&
          <span className="rounded-full py-2 px-4 text-sm bg-[#FFCEE5] border-1 border-[#FFA1CD] hover:bg-[#FFB3D7]">
            {club.Category2Name}
          </span>}
      </div>

      <p className="line-clamp-4 text-sm font-normal text-black md:text-base">
        {club.OrganizationDescription}
      </p>

      <div>
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <label className="flex items-center text-xl font-bold text-black">
            {club.average_satisfaction ? (
              <>
                {club.average_satisfaction}
                <span className="ml-1 text-yellow-400">★</span>
              </>
            ) : (
              <>
                N/A
                <span className="ml-1 text-yellow-400">★</span>
              </>
            )}
          </label>
          <label className="text-base font-bold text-black">
            satisfaction rating
          </label>
        </div>
        <label className="text-base text-black italic">
          {club.total_num_reviews === 0
            ? "0 reviews"
            : `from ${club.total_num_reviews} trusted ${club.total_num_reviews === 1 ? "student" : "students"
            }`}
        </label>
      </div>
    </Link>
  );
}
