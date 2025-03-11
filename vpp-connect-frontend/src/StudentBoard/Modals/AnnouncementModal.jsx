import React from "react";
import { X } from "lucide-react";

const AnnouncementModal = ({ data, onClose }) => {
  // Mapping announcement category to modal header background color
  const categoryModalMapping = {
    update: "bg-vpppurple",
    holiday_notice: "bg-vpporange",
    exam_update: "bg-vppviolet",
    event: "bg-vppgreen",
  };

  // Get the background class based on the announcement category; fallback to "bg-vpppurple"
  const modalBg = categoryModalMapping[data.category] || "bg-vpppurple";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-themegray overflow-hidden rounded-2xl w-2/6 h-[60vh] shadow-lg flex flex-col">
        {/* Header */}
        <div className={`${modalBg} p-6 text-white`}>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                {data?.profilePic ? (
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${data.profilePic}`}
                    alt="Profile"
                  />
                ) : (
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/020/429/953/original/admin-icon-vector.jpg"
                    alt="Profile"
                  />
                )}
              </div>
              <div>
                <h1 className="text-lg">
                  {data.fullname ? data.fullname : data.postedBy}
                </h1>
                <h1 className="text-sm">{data.date}</h1>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-[40px] h-[40px] flex items-center justify-center rounded-full cursor-pointer"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-neueMedium">{data.title}</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 mb-6 flex-1 overflow-y-auto">
          <p>{data.content}</p>
          {/* check if data has file, if yes, show thumbnail and link it to fileUrl */}
          {data.fileId && (
            <div className="flex flex-col gap-1 mt-4">
              <div className="w-40 h-40 overflow-hidden p-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <a href={`${data.fileUrl}`} target="_blank" rel="noreferrer">
                  <img
                    className="rounded-lg"
                    src={`http://localhost:5000/api/users/profile?url=${data.thumbnailUrl}`}
                    alt="file"
                  />
                </a>
              </div>
              <div className="w-2/3">
                <a
                  href={`${data.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-vpppurple underline"
                  download={data.fileName}
                >
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
