import React, { useEffect, useState } from "react";
import { Plus, Link2, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const QuickAccess = () => {
  // State to manage links and modal visibility
  const [links, setLinks] = useState([]);
  const [isInputVisible, setIsInputVisible] = useState(false); // To control input visibility
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const { user } = useAuth();

  // Handle link name and URL change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "linkName") {
      setLinkName(value);
    } else if (name === "linkURL") {
      setLinkURL(value);
    }
  };

  async function getLinks(userId) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/quicklinks/${userId}`);
      console.log(response.data);
      setLinks(
        response.data.quicklinks.map((link) => ({
          name: link.linkname,
          url: link.linkurl,
        }))
      );
      console.log(links);
    } catch (error) {
      console.error(error);
    }
  }

  async function addLink(userId, linkName, linkURL) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/quicklinks/`,
        {
          linkname: linkName,
          linkurl: linkURL,
          userId: userId,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    console.log(user);
    getLinks(user?.userId);
  }, [user]);



  // Handle adding a new link
  const handleAddLink = () => {
    if (linkName && linkURL) {
      setLinks([...links, { name: linkName, url: linkURL }]);
      // Hide the input fields after adding the link
      setIsInputVisible(false);
      // Clear inputs
      setLinkName("");
      setLinkURL("");
      addLink(user?.userId, linkName, linkURL);
    }
  };

  return (
    <div className="mt-4">
      <div className="text-lg flex justify-between px-1 opacity-50">
        <h1>Quick Access</h1>
        <div
          className="flex gap-1 items-center underline cursor-pointer"
          onClick={() => setIsInputVisible(!isInputVisible)}
        >
          {isInputVisible ? (
            <div className="flex gap-1 items-center">
              <ChevronUp />
              <h1>Hide Box</h1>
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <ChevronDown />
              <h1>Add Links</h1>
            </div>
          )}
        </div>
      </div>

      {/* Input for Link Name and URL, with transition animation */}
      {isInputVisible && (
        <div className="transition-all duration-300 ease-in-out mt-4 bg-white p-4 rounded-2xl">
          <div className="mb-4">
            <label className="block text-sm mb-1 opacity-50">Link Name</label>
            <input
              type="text"
              name="linkName"
              value={linkName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 opacity-50">Link URL</label>
            <input
              type="url"
              name="linkURL"
              value={linkURL}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsInputVisible(false)} // Hide the input when Cancel is clicked
              className="bg-[#888888] text-white p-2 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLink}
              className="bg-[#5d46ac] text-white p-2 rounded-lg cursor-pointer"
            >
              Add Link
            </button>
          </div>
        </div>
      )}

      {/* Display the List of Links */}
      <div className="flex flex-col gap-2 mt-4">
        {links.length > 0 ? (
          links.map((link, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-3 rounded-2xl hover:underline cursor-pointer"
            >
              <a
                href={link.url}
                target="_blank" // Open the link in a new tab
                rel="noopener noreferrer" // For security reasons
                className="flex items-center gap-2 w-full"
              >
                <div className="bg-vpppurple w-min p-1 rounded-full text-white">
                  <Link2 />
                </div>
                <h1 className="text-xl truncate whitespace-nowrap overflow-hidden">
                  {link.name}
                </h1>
              </a>
            </div>
          ))
        ) : (
          <p className="opacity-50 px-2">
            No links added yet. Click "Add Links" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickAccess;
