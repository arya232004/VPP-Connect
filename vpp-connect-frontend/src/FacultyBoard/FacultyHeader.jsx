import { Bell } from "lucide-react";
import React from "react";

const FacultyHeader = ({ user, text }) => {
    return (
        <div>
            <div className="flex items-center justify-between mt-2 ">
                <img
                    className="w-[200px]"
                    src="/VPP logo updated.svg"
                    alt="Logo"
                />
                <div className="flex p-1 rounded-full bg-white gap-1">
                    <div className="flex items-center w-[40px] h-[40px] p-1  rounded-full hover:bg-[#E5E9EC] opacity-50 cursor-pointer">
                        <Bell className="w-full" />
                    </div>
                    <img
                        className="w-[40px] h-[40px] p-1 rounded-full hover:bg-[#E5E9EC] cursor-pointer"
                        src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${user?.profilePic}`}
                        alt="Profile"
                        loading="lazy"
                    />
                </div>
            </div>
            <hr className="my-4 border-[#E5E9EC]" />
            <div className="flex justify-between mt-4 items-center mb-6">
                <div className="flex flex-col gap-1 m-auto md:m-0">
                    <h1 className="text-xl  font-neueMedium md:text-2xl">
                        {text}
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default FacultyHeader;