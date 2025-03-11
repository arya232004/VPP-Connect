import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubmissionTab from "./SubmissionTab";
import SubmissionModal from "../Modals/SubmissionModal";

const SubmissionList = ({ submissions, submissionsData, pastelColors }) => {
  const scrollContainerRef = useRef(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const shiftScroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: (scrollContainerRef.current.offsetWidth / 5) * direction,
        behavior: "smooth",
      });
    }
  };

  console.log("Submissions ", submissionsData);

  return (
    <div className="bg-white rounded-2xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <h1 className="text-xl font-neueMedium md:text-2xl">
            Your Tasks
          </h1>
          <h2 className="font-neueMedium">{`(${submissionsData.length})`}</h2>
        </div>
        <div className="cursor-pointer flex gap-4 opacity-50">
          <ChevronLeft onClick={() => shiftScroll(-1)} />
          <ChevronRight onClick={() => shiftScroll(1)} />
        </div>
      </div>

      {/* Submission List */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 py-4"
      >
        {submissionsData.map((submission, index) => (
          <div key={index} className="flex-shrink-0">
            <SubmissionTab
              {...submission}
              color={pastelColors[index % pastelColors.length]}
              onClick={() => setSelectedSubmission(submission)}
            />
          </div>
        ))}
      </div>

      {/* Modal for Selected Submission */}
      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

export default SubmissionList;
