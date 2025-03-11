const express = require("express");
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const { db } = require("./firebase/config");
const { setupSocket } = require("./chat/socket/config");

const setupRoutesMicroBlogs = require("./microblogging/routes/api");
const setupRoutesTasks = require("./tasks/routes/api");
const setupRoutesAnnouncements = require("./announcement/routes/api");
const setupRoutesCommunity = require("./community/routes/api");
const setupRoutesUsers = require("./users/routes/api");
const departmentRoutes = require("./department/routes/api");
const driveroutes = require("./drive/routes/api");
const authroutes = require("./auth/routes/api");
const quiklinkroutes = require("./quicklinks/routes/api");
const chatroutes = require("./chat/routes/api");
const latestcourseroutes = require("./latest/routes/api");
const { notificationroutes } = require("./notification/controllers/apicontroller.js");


const app = express();
const server = http.createServer(app);


app.use(express.json());
app.use(cors());


app.use("/api/microblogs", setupRoutesMicroBlogs);
app.use("/api/tasks", setupRoutesTasks);
app.use("/api/announcements", setupRoutesAnnouncements);
app.use("/api/community", setupRoutesCommunity);
app.use("/api/users", setupRoutesUsers);
app.use("/api/departments", departmentRoutes);
app.use("/api/drive", driveroutes);
app.use("/api/auth", authroutes);
app.use("/api/quicklinks", quiklinkroutes);
app.use("/api/chat", chatroutes);
app.use("/api/latest", latestcourseroutes);


setupSocket(server);


app.get("/", (req, res) => {
    res.send("Hello, Socket.io Chat Server is Running!");
});

server.listen(5000, () => {
    console.log("🚀 Server is running on port 5000");
});