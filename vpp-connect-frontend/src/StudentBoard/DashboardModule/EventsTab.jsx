import React from "react";
import { MoveUpRight, MapPin } from "lucide-react";

const EventsTab = ({
  title,
  assignment,
  date,
  venue,
  profilePic,
  color,
  fullname,
  postedBy,
  onClick,
}) => {
  console.log(title, assignment, date, venue, profilePic, color, onClick);
  return (
    <button
      onClick={onClick}
      className="w-[300px] rounded-2xl border-2 border-gray-200 overflow-hidden transition-transform duration-200 hover:scale-102 cursor-pointer focus:outline-none"
    >
      <div
        className={`pt-2 px-4 pb-1 ${color} flex items-center justify-between text-white`}
      >
        <div className="flex items-center gap-2">
          <div className="w-[28px] h-[28px] rounded-full overflow-hidden">
            {profilePic && profilePic ? (
              <img 
              src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${profilePic}`} 
              alt="Profile" />
            ) : (
              <img 
            src='https://static.vecteezy.com/system/resources/previews/020/429/953/original/admin-icon-vector.jpg'
            alt="Profile" /> 
            )}
            
            {/* <img 
            src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${thumbnailUrl})`} 
            alt="Profile" /> */}
          </div>
          <h1 className="text-[16px]">Posted by {fullname ? fullname : postedBy}</h1>
        </div>
      </div>
      <div className="px-4 pt-2 pb-4 text-left">
        <h1 className="text-[22px] font-neueMedium truncate">{title}</h1>
        <h2 className="text-[15px]">Date: {date}</h2>
        <div className="mt-3 flex items-center gap-2">
          
          <h3 className="text-[15px]">{venue}</h3>
        </div>
      </div>
    </button>
  );
};

export default EventsTab;
