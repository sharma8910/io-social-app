import express from "express";
import { connectDB } from './db.js'
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'
import authMware from "./middleware/authMware.js";
import postRoutes from "./routes/postRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://io-social-app-frontend.vercel.app/'], credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

app.get('/profile', authMware,(req,res)=> {
  res.json({ message: 'logged in', userId: req.user})
})

app.get("/",(req,res)=>{
  res.send("server running")
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://io-social-app-frontend.vercel.app/"],
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {};
app.set("io", io);
app.set("userSocketMap", userSocketMap);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  socket.on("sendMessage", (messageData) => {
    const receiverSocketId = userSocketMap[messageData.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", messageData);
    }
  });

  socket.on("followNotification", (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFollowNotification", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} unregistered`);
        break;
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`)
});