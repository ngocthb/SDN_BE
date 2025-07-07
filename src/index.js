const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const routes = require("./routes");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend URLs
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  })
  .catch((error) => {
    console.log(error);
  });

// Thay app.listen bằng server.listen
server.listen(port, () => {
  console.log("Server is running on port " + port);
});
