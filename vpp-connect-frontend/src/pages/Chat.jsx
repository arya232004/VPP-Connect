import React, { useState, useRef, useEffect } from "react";
import VPPHeader from "../pages/VPPHeader";
import {
  UsersRound,
  Search,
  SendHorizontal,
  Plus,
  Image,
  FileInput,
  X,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import io from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL;

function Chat() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const chatContainerRef = useRef(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const [groupData, setGroupData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  const { user } = useAuth();

  // Alternate background colors for group icons
  const groupColors = ["bg-vpppurple", "bg-vppgreen", "bg-vppviolet", "bg-vpporange"];

  // Initialize the socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // When a room is selected and the socket is ready, join that room
  useEffect(() => {
    if (socket && selectedGroup) {
      const userId = user?.userId || "Guest";
      // Emit join room event
      socket.emit("joinRoom", {
        roomName: selectedGroup,
        userId,
        name: user?.fullname || "Guest",
      });

      // Define handlers
      const handleJoinedRoom = (data) => {
        console.log("Joined room:", data);
        setCurrentRoom(data.roomId);
        setChats(data.messages || []);
        console.log(data);
      };

      const handleReceiveMessage = (data) => {
        setChats((prev) => [...prev, data]);
      };

      // Remove any existing listeners before adding new ones
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("receiveMessage", handleReceiveMessage);

      // Register listeners
      socket.on("joinedRoom", handleJoinedRoom);
      socket.on("receiveMessage", handleReceiveMessage);

      // Clean up listeners when component unmounts or dependencies change
      return () => {
        socket.off("joinedRoom", handleJoinedRoom);
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, selectedGroup, user]);

  const handleSendMessage = () => {
    if (socket && currentRoom && (message.trim() || file)) {
      const userId = user?.userId || "Guest";
      const sender = user?.fullname || "Guest";

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove the MIME prefix and get base64 data.
          const base64Data = reader.result.split(",")[1];
          socket.emit("sendMessage", {
            roomId: currentRoom,
            userId,
            sender,
            message: message.trim(), // optional text alongside file
            timestamp: Date.now(),
            type: "file",
            fileBuffer: base64Data,
            fileName: file.name,
            fileType: file.type, // send the file type
          });
          setMessage("");
          setFile(null);
          setFileName("");
          setPreview(null);
        };
        reader.readAsDataURL(file);
      } else {
        socket.emit("sendMessage", {
          roomId: currentRoom,
          userId,
          sender,
          message,
          timestamp: Date.now(),
        });
        setMessage("");
      }
    }
  };

  const getDateFromTimestamp = (timestamp) => {
    // If timestamp has a _seconds property, it's a Firebase-like object.
    if (timestamp && typeof timestamp === "object" && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    // Otherwise, assume it's a valid date string.
    return new Date(timestamp);
  };

  async function getchatgroups() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/groups`,
        { rooms: user?.rooms }
      );
      console.log(res.data);
      setGroupData(res.data.groups);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getchatgroups();
  }, [user]);

  // Automatically select the first group if none is selected
  useEffect(() => {
    if (!selectedGroup && groupData.length > 0) {
      setSelectedGroup(groupData[0].roomName);
    }
  }, [groupData, selectedGroup]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (
        selectedFile.type.startsWith("image") ||
        selectedFile.type.startsWith("video")
      ) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
      // Close the file upload options after selecting a file
      setShowUploadOptions(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const uploadRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        setShowUploadOptions(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalMedia(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // New helper to render modal content based on file type
  const renderModalContent = () => {
    if (!modalMedia) return null;
    const lowerUrl = modalMedia.toLowerCase();
    // Check for common video extensions
    if (
      lowerUrl.endsWith(".mp4") ||
      lowerUrl.endsWith(".webm") ||
      lowerUrl.endsWith(".ogg")
    ) {
      return (
        <video
          src={modalMedia}
          controls
          className="max-w-[500px] rounded-2xl h-auto"
        />
      );
    }
    // Otherwise assume it's an image
    return (
      <img
        src={modalMedia}
        className="max-w-[500px] rounded-2xl h-auto"
        alt="Preview"
      />
    );
  };

  return (
    <div className="relative">
      <VPPHeader text={"Chat"} />
      <div
        className={`flex flex-col md:flex-row justify-between gap-4 ${
          modalMedia ? "backdrop-blur-md" : ""
        }`}
      >
        <div className="bg-white w-full md:w-[25%] h-fit rounded-2xl p-6">
          <div className="flex items-center border-2 p-3 mb-2 rounded-lg border-gray-400 opacity-50 gap-3 w-full">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search groups"
              value={fileName || searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none"
              readOnly={!!fileName}
            />
          </div>
          <h1 className="mb-2 opacity-50">Groups</h1>
          <div className="flex flex-col gap-1">
            {groupData.map((group, index) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group.roomName)}
                className={`flex gap-2 items-center p-3 rounded-lg cursor-pointer transition-all font-neueMedium ${
                  selectedGroup === group.roomName
                    ? "bg-themegray opacity-100"
                    : "hover:bg-themegray opacity-50"
                }`}
              >
                <div className={`${groupColors[index % groupColors.length]} p-1 rounded-full text-white`}>
                  <UsersRound size={20} />
                </div>
                <h1 className="text-lg truncate w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  {group.roomName}
                </h1>
              </div>
            ))}
          </div>
        </div>
        {/*Chat Section */}
        <div className="bg-white w-full md:w-[73%] rounded-2xl flex flex-col h-[500px]">
          <h1 className="text-center w-full pt-4 border-b border-gray-300 pb-4 font-neueMedium text-lg flex items-center justify-center">
            {selectedGroup}
          </h1>

          {selectedGroup && (
            <>
              <div
                className="flex-1 px-6 py-3 overflow-y-auto scroll-auto"
                ref={chatContainerRef}
              >
                {chats.map((chat, index) => {
                  const isSent = chat.userId === (user?.userId || "Guest");
                  return (
                    <div
                      key={index}
                      className={`mt-2 ${isSent ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`flex items-baseline gap-2 ${
                          isSent ? "justify-end" : "pl-12"
                        }`}
                      >
                        {!isSent && <h1 className="text-lg">{chat.sender}</h1>}
                        <p className="text-sm opacity-50">
                          {getDateFromTimestamp(chat.timestamp)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace(",", "")}
                        </p>
                      </div>
                      <div
                        className={`flex ${
                          isSent ? "justify-end" : "items-center"
                        }`}
                      >
                        {!isSent && (
                          <div className="w-[35px] h-[35px] rounded-full overflow-hidden">
                            <img
                              src={`${
                                import.meta.env.VITE_SERVER_URL
                              }/api/users/profile?url=${
                                chat?.senderpicture.profilePic
                              }`}
                              alt="Profile"
                            />
                          </div>
                        )}
                        <div className="bg-pastelpurple max-w-[50%] px-3 py-2 ml-3 rounded-xl">
                          <p style={{ whiteSpace: "pre-wrap" }}>{chat.message}</p>
                          {chat.type === "file" && chat.file && (
                            <>
                              {chat.file.type.startsWith("image") ? (
                                <img
                                  src={`${
                                    import.meta.env.VITE_SERVER_URL
                                  }/api/users/profile?url=${chat?.file?.webContentLink}`}
                                  alt="Sent File"
                                  className="w-70 rounded-lg h-auto object-cover cursor-pointer"
                                  onClick={() =>
                                    setModalMedia(
                                      `${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${chat?.file?.webContentLink}`
                                    )
                                  }
                                />
                              ) : chat.file.type.startsWith("video") ? (
                                <video
                                  poster={chat.file.thumbnailLink}
                                  src={chat.file.webContentLink}
                                  controls
                                  className="rounded-lg w-70 h-auto mt-2 cursor-pointer"
                                  onClick={() =>
                                    setModalMedia(
                                      `${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${chat?.file?.webContentLink}`
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex gap-2 items-center">
                                  <FileInput className="opacity-50" size={15}/>
                                  <p
                                  className=" hover:underline opacity-50 cursor-pointer"
                                  onClick={() => {
                                    if (
                                      chat.file.type === "application/pdf"
                                    ) {
                                      console.log(chat.file.webContentLink);
                                      window.open(
                                        chat.file.webContentLink,
                                        "_blank"
                                      );
                                    } else {
                                      setModalMedia(
                                        `${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${chat?.file?.webContentLink}`
                                      );
                                    }
                                  }}
                                >
                                 
                                 {chat.file.name} (File Sent)
                                </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Section (Only shows when a chat is selected) */}
              <div className="relative mx-6 mb-4 bg-white">
                {showUploadOptions && (
                  <div
                    ref={uploadRef}
                    className="absolute z-1 bottom-14 right-0 border-2 border-gray-300 bg-white p-2 rounded-md"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Image size={20} /> Image/File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                )}

                <div className="flex flex-col border-2 p-3 rounded-lg border-gray-400 opacity-50 gap-3 px-4">
                  <div className="flex items-center gap-3">
                    <textarea
                      rows="1"
                      placeholder="Type a message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        const lines = e.target.value.split("\n").length;
                        e.target.rows = lines > 5 ? 5 : lines;
                      }}
                      onKeyDown={handleKeyPress}
                      className="w-full bg-transparent outline-none resize-none"
                    />
                    <button onClick={() => setShowUploadOptions(!showUploadOptions)}>
                      <Plus
                        size={24}
                        className="cursor-pointer hover:text-vpppurple active:text-vpppurple"
                      />
                    </button>
                    <button onClick={handleSendMessage}>
                      <SendHorizontal
                        size={24}
                        className="cursor-pointer hover:text-vpppurple"
                      />
                    </button>
                  </div>

                  {/* File Name Display */}
                  {fileName && (
                    <div className="flex w-fit items-center gap-2 mt-2 bg-gray-100 p-2 rounded-md">
                      <div className="flex">
                      <FileInput />
                      <p className="text-sm text-gray-600 truncate">{fileName}</p>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFileName("");
                          setPreview(null);
                        }}
                      >
                        <X
                          size={16}
                          className="text-gray-500 hover:text-red-600 cursor-pointer"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Modal Preview for Image/Video */}
      {modalMedia && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div ref={modalRef} className="relative bg-white p-4 rounded-lg">
            <button
              className="absolute top-4 right-4"
              onClick={() => setModalMedia(null)}
            >
              <X size={24} className="cursor-pointer" />
            </button>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
