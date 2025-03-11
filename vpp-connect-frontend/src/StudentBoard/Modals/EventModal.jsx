import React from "react";
import { Bell, LogIn, MapPin, Ticket, X } from "lucide-react";

const EventModal = ({ submission, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50  backdrop-blur-sm">
      <div className="bg-themegray overflow-hidden rounded-2xl w-2/6 h-[80vh] shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-vppgreen p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                <img src="src/assets/images/pfp1.jpeg" alt="Profile" />
              </div>
              <div>
                <h1 className="text-lg">Posted by: Deven Bhagtani</h1>
                <h1 className="text-sm">March 8, 2025 | 4:00 PM</h1>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-[40px] h-[40px] flex items-center justify-center  rounded-full cursor-pointer"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="mt-4 mb-4">
            <h1 className="text-3xl font-neueMedium">
              Design Thinking Workshop
            </h1>
            <h1>Date & Time: March 8, 2025 | 4:00 PM</h1>
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <MapPin size={18} />
              <h1>Room 304 / Zoom Link</h1>
            </div>
            <div className="flex gap-2 items-center">
              <Ticket size={18} />
              <h1>Event Type: Workshop</h1>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h1>
            hands-on workshop hands-on workshop hands-on workshop hands-on
            workshop
          </h1>

          {/* Doc Format */}
          <div className="bg-white rounded-2xl w-[200px] p-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
                <img
                  className="scale-150"
                  src="src/assets/images/docsimage.png"
                  alt="Document Icon"
                />
              </div>
              <h1 className="text-sm">UX Workshop Details</h1>
            </div>
            <div className="h-[150px] rounded-xl overflow-hidden mt-2">
              <img src="src/assets/images/documentimage.webp" alt="Document" />
            </div>
          </div>
        </div>

        {/* Static Buttons at Bottom */}
        <div className="p-4 bg-themegray border-t border-gray-300 flex gap-2">
          <button className="bg-vppgreen w-[50%] p-2 text-white rounded-md">
            <div className="w-full flex gap-2 items-center">
              <LogIn size={20} />
              <h1>Register Now</h1>
            </div>
          </button>
          <button className="bg-themedarkgray w-[50%] p-2 rounded-md">
            <div className="w-full flex gap-2 items-center">
              <Bell size={20} />
              <h1>Remind me Later</h1>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
