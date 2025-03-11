import React from "react";
import { CircleArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCard = ({ text, count, icon: Icon, color, name }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (text.includes("Classes")) {
      navigate("/admin/classes");
    } else if (text.includes("Users")) {
      navigate("/admin/users");
    } else if (text.includes("Announcements")) {
      navigate("/admin/announcements");
    } else if (text.includes("Groups")) {
      navigate("/admin/groups");
    } else {
      navigate("/admin/departments");
    }
  };

  return (
    <div
      onClick={handleNavigation}
      className="bg-white rounded-xl w-full h-full cursor-pointer overflow-hidden "
    >
      {/* Header with dynamic background */}
      <div className={`p-3 text-white flex gap-2 items-center ${color}`}>
        {Icon && <Icon size={20} />}
        <h3 className="text-lg md:text-xl">{text}</h3>
      </div>
      <div className="p-3 py-6 flex flex-col flex-grow h-full items-center ">
        <p className="text-3xl font-neueMedium text-center">{count}</p>
        <div className="flex opacity-50 hover:underline gap-1 items-center">
          <p className="text-lg text-center">Manage {name}</p>
          <ArrowUpRight size={18} />
        </div>
      </div>
      {/* Optional button section can be added here if needed */}
      {/* <div className="mt-4 grid">
            <button
                onClick={handleNavigation}
                className="px-4 py-2 gap-2 flex items-center justify-center text-sm font-semibold bg-[#5d46ac] text-white rounded-lg hover:bg-[#4a3b8e] transition duration-200 cursor-pointer"
            >
                More <CircleArrowRight size={20} className="ml-2" />
            </button>
        </div> */}
    </div>
  );
};

export default AdminCard;
