// In socket/config.js
const socketIo = require("socket.io");
const { db } = require("../../firebase/config");
const admin = require("firebase-admin");
const { uploadFile, getFileMetadata } = require('../../drive/controllers/apicontroller');
const { getprofilepicture } = require('../../users/controllers/apicontroller');

// In-memory storage for room participants and user socket mapping
let rooms = {};
// Mapping from userId to socketId
const userSockets = {};

// Helper function to generate a unique room ID from a room name
function generateRoomId(roomName) {
    return "room-" + roomName.replace(/\s+/g, "").toLowerCase() + "-" + Date.now();
}

// Function to create a room in Firestore with no participants initially.
async function createRoomInFirebase(roomName) {
    if (!roomName) throw new Error("Room name is required");

    const roomQuery = await db.collection("rooms").where("roomName", "==", roomName).get();
    if (!roomQuery.empty) {
        return roomQuery.docs[0].data();
    } else {
        const roomId = generateRoomId(roomName);
        await db.collection("rooms").doc(roomId).set({
            roomId,
            roomName,
            participants: [],
            latestMessage: {}
        });
        return { roomId, roomName, participants: [] };
    }
}

async function deleteRoomInFirebase(roomId) {
    if (!roomId) throw new Error("Room ID is required");

    const roomDoc = await db.collection("rooms").doc(roomId).get();
    if (!roomDoc.exists) {
        throw new Error(`Room with roomId "${roomId}" does not exist.`);
    } else {
        await db.collection("rooms").doc(roomId).delete();
        return { message: `Room with roomId "${roomId}" has been deleted.` };
    }
}

async function addUserToRoomDB({ roomId, userId, name }) {
    // Validate input
    if (!roomId || !userId || !name) {
        throw new Error("Missing required fields: roomId, userId, or name");
    }

    // Retrieve the room document by roomId
    let roomDoc;
    try {
        roomDoc = await db.collection("rooms").doc(roomId).get();
        if (!roomDoc.exists) {
            throw new Error(`Room with roomId "${roomId}" does not exist. Please create it first.`);
        }
    } catch (error) {
        console.error("Error fetching room document:", error);
        throw error;
    }
    const roomData = roomDoc.data();

    // Update the user's record in Firestore
    try {
        await db.collection("users").doc(userId).set({ name, userId }, { merge: true });
        await db.collection("users").doc(userId).update({
            rooms: admin.firestore.FieldValue.arrayUnion(roomId),
        });
    } catch (error) {
        console.error("Error updating user record:", error);
        throw error;
    }

    // Update the room's participants list
    let participants = roomData.participants || [];
    if (!participants.some(user => user.userId === userId)) {
        participants.push({ userId, name });
        try {
            await db.collection("rooms").doc(roomId).update({
                participants: participants,
            });
        } catch (error) {
            console.error("Error updating room participants:", error);
            throw error;
        }
    }

    // Optionally, fetch the last 50 messages from the room
    let messages = [];
    try {
        const messagesSnapshot = await db
            .collection("rooms")
            .doc(roomId)
            .collection("messages")
            .orderBy("timestamp", "asc")
            .limit(50)
            .get();
        messages = messagesSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        console.error("Error fetching messages:", error);
    }

    // Return the updated room info
    return {
        roomId,
        name,
        participants,
        messages,
    };
}



// New function to handle joining a room
async function joinRoom({ roomName, userId, name }, socket, io) {
    if (!roomName || !userId || !name) {
        console.error("Missing required fields: roomName, userId, or name");
        socket.emit("roomJoinError", { message: "Missing required fields" });
        return;
    }

    let roomData;
    try {
        const roomQuery = await db.collection("rooms").where("roomName", "==", roomName).get();
        if (roomQuery.empty) {
            console.error(`Room "${roomName}" does not exist. Please create it first.`);
            socket.emit("roomJoinError", { message: "Room does not exist. Please create it first." });
            return;
        }
        roomData = roomQuery.docs[0].data();
    } catch (error) {
        console.error("Error fetching room data:", error);
        socket.emit("roomJoinError", { message: "Error fetching room data" });
        return;
    }
    const roomId = roomData.roomId;

    // Join the socket to the room
    socket.join(roomId);

    // Update in-memory participants list for this room
    if (!rooms[roomId]) {
        rooms[roomId] = [];
    }
    if (!rooms[roomId].some((user) => user.userId === userId)) {
        rooms[roomId].push({ userId, name });
    }
    console.log(`🟢 ${name} (${userId}) joined room: ${roomId}`);

    try {
        await db.collection("users").doc(userId).set({ name, userId }, { merge: true });
        await db.collection("users").doc(userId).update({
            rooms: admin.firestore.FieldValue.arrayUnion(roomId),
        });
        await db.collection("rooms").doc(roomId).update({
            participants: rooms[roomId],
        });
    } catch (error) {
        console.error("Error updating Firestore with participant data:", error);
    }

    let messages = [];

    try {
        const messagesSnapshot = await db
            .collection("rooms")
            .doc(roomId)
            .collection("messages")
            .orderBy("timestamp", "asc")
            .limit(50)
            .get();
        messages = messagesSnapshot.docs.map((doc) => doc.data());
        console.log(messages);
        // Await all asynchronous operations to fetch the sender picture
        await Promise.all(
            messages.map(async(message) => {
                message.senderpicture = await getprofilepicture(message.userId);
            })
        );
    } catch (error) {
        console.error("Error fetching messages:", error);
    }

    socket.emit("joinedRoom", {
        roomId,
        roomName,
        name,
        participants: rooms[roomId],
        messages,
    });
    io.to(roomId).emit("updateParticipants", rooms[roomId]);
}

function setupSocket(server) {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true,
        },
        transports: ["websocket"],
    });

    io.on("connection", (socket) => {
        console.log(`✅ New user connected: ${socket.id}`);

        // Listen for an 'identify' event to map a userId to the socket
        socket.on("identify", ({ userId }) => {
            if (userId) {
                userSockets[userId] = socket.id;
            }
        });

        socket.on("createRoom", async({ roomName }) => {
            if (!roomName) {
                console.error("Missing roomName in createRoom event");
                socket.emit("roomCreationError", { message: "Missing roomName" });
                return;
            }
            try {
                const roomData = await createRoomInFirebase(roomName);
                if (!rooms[roomData.roomId]) {
                    rooms[roomData.roomId] = [];
                }
                socket.emit("roomCreated", roomData);
                console.log(`Created room: ${roomData.roomId}`);
            } catch (error) {
                console.error("Error creating room in Firebase:", error);
                socket.emit("roomCreationError", { message: "Error creating room" });
            }
        });

        socket.on("joinRoom", async(data) => {
            await joinRoom(data, socket, io);
        });

        socket.on("sendMessage", async(data) => {
            const { roomId, userId, message, type, fileUrl, fileBuffer, fileName, fileType, mainFolder } = data;
            if (!roomId || !userId || (!message && !fileBuffer && !fileUrl)) return;

            let uploadedFileId = fileUrl || null;
            let fileMeta = {}; // Declare fileMeta

            if (type === "file" && fileBuffer && fileName) {
                try {
                    const folder = mainFolder || "chat";
                    let bufferData = fileBuffer;
                    if (typeof fileBuffer === "string") {
                        bufferData = Buffer.from(fileBuffer, "base64");
                    }
                    // Upload file and get the file ID.
                    uploadedFileId = await uploadFile(folder, fileName, bufferData);
                    console.log(`Uploaded file with ID: ${uploadedFileId}`);
                    // Retrieve metadata (thumbnail, view, download links).
                    fileMeta = await getFileMetadata(uploadedFileId);
                    console.log("File metadata:", fileMeta);
                } catch (error) {
                    console.error("Error uploading file:", error);
                }
            }

            // Find the sender's name from in-memory room participants.
            let senderUser = null;
            if (rooms[roomId]) {
                senderUser = rooms[roomId].find((user) => user.userId === userId);
            }
            const senderName = senderUser ? senderUser.name : "Unknown";

            // Construct the message object.
            const newMessage = {
                sender: senderName,
                message: message || "",
                type: type || (uploadedFileId ? "file" : "text"),
                fileUrl: uploadedFileId, // This holds your file ID.
                userId: userId,
                timestamp: new Date(),
            };

            // Add file metadata to the message if it's a file.
            if (type === "file") {
                newMessage.file = {
                    name: fileName,
                    type: fileType, // Make sure the client sends this.
                    ...fileMeta, // This spreads in thumbnailLink, webContentLink, webViewLink.
                };
            }

            try {
                // Store the message in Firestore.
                await db.collection("rooms").doc(roomId).collection("messages").add(newMessage);
                await db.collection("rooms").doc(roomId).update({
                    latestMessage: {
                        sender: senderName,
                        message: message || (uploadedFileId ? "File sent" : ""),
                        timestamp: new Date(),
                    },
                });
            } catch (error) {
                console.error("Error storing message in Firestore:", error);
            }
            newMessage.senderpicture = await getprofilepicture(userId);
            // Broadcast the message.
            io.to(roomId).emit("receiveMessage", newMessage);
        });




        socket.on("disconnect", (reason) => {
            console.log(`❌ User ${socket.id} disconnected: ${reason}`);
            // Optionally remove the socket from userSockets mapping here
        });

        socket.on("error", (err) => {
            console.error(`🔥 Socket error: ${err.message}`);
        });
    });

    return { io, userSockets };
}

module.exports = { setupSocket, joinRoom, createRoomInFirebase, addUserToRoomDB, deleteRoomInFirebase };