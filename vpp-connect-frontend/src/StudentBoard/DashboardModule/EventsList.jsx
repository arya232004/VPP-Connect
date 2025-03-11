import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventsTab from "./EventsTab";
import EventModal from "../Modals/EventModal";
import AnnouncementModal from "../Modals/AnnouncementModal";

const EventsList = ({ events, announcementsData ,pastelColors }) => {
  const scrollContainerRef = useRef(null);
  console.log(announcementsData);
  console.log(events);
  const [selectedEvent, setSelectedEvent] = useState(null); // Track clicked event

  const shiftLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.offsetWidth / 5,
        behavior: "smooth",
      });
    }
  };

  const shiftRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.offsetWidth / 5,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white mt-4 rounded-2xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <h1 className="text-xl font-neueMedium md:text-2xl">
            Upcoming Events & Announcements
          </h1>
          <h2 className="font-neueMedium"> 
            (
            {Object.values(announcementsData).reduce((sum, arr) => sum + arr.length, 0)}
            )
            </h2>
        </div>
        <div className="cursor-pointer">
          <div className="flex gap-4 opacity-50">
            <ChevronLeft onClick={shiftLeft} />
            <ChevronRight onClick={shiftRight} />
          </div>
        </div>
      </div>

      {/* Event List with Horizontal Scrolling */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 py-4"
        style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}
      >
        {/* {events.map((event, index) => (
          <div key={index} className="flex-shrink-0">
            <button
              onClick={() => setSelectedEvent(event)}
              className="focus:outline-none"
            >
              <EventsTab
                {...event}
                color={pastelColors[index % pastelColors.length]}
              />
            </button>
          </div>
        ))} */}
          {
            Object.keys(announcementsData).map((key) => {
              return announcementsData[key].map((event, idx) => (
                <div key={key + idx} className="flex-shrink-0">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="focus:outline-none"
                  >
                    <EventsTab
                      {...event}
                      color={pastelColors[idx % pastelColors.length]}
                    />
                  </button>
                </div>
              ))
            })
          }

      </div>

      {/* Show EventModal when an event is clicked */}
      {selectedEvent && (
        <AnnouncementModal
          data={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default EventsList;
