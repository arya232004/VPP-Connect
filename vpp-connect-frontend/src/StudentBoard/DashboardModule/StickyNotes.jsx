import React from "react";
import { Plus, EllipsisIcon } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuickAccess from "./QuickAccess";

const StickyNotes = ({ stickyNote, handleNoteChange, modules }) => {
  return (
    <div className="">
      {/* Sticky Notes Widget with Rich Text Editor */}
      <div className="rounded-2xl overflow-hidden bg-white ">
        <div className="bg-themeblue px-4 py-3 text-white flex justify-between">
          <Plus />
          <EllipsisIcon />
        </div>
        <div className="relative w-full">
          {/* Quill Editor */}
          <ReactQuill
            value={stickyNote}
            onChange={handleNoteChange}
            theme="snow"
            placeholder="Write your notes here..."
            modules={modules}
            className="font-neueMedium"
            style={{
              minHeight: "120px",
              height: "auto",
              maxHeight: "300px",
              overflowY: "auto",
              fontFamily: "inherit", // Ensures body font is used
              border: "none", // Removes border
            }}
          />

          {/* Hiding Default Border + Toolbar Styling */}
          <style>
            {`
              .ql-container { border: none !important; }
              .ql-editor { font-family: inherit !important; min-height: 120px; }
              .ql-toolbar { border: none !important; }
            `}
          </style>
        </div>
      </div>
      <QuickAccess />
    </div>
  );
};

export default StickyNotes;
