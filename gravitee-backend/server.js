// const express = require("express");
// const cors = require("cors");
// const app = express();
// app.use(cors());
// app.use(express.json());

// let students = [
//   { id: 1, name: "Alice", age: 21 },
//   { id: 2, name: "Bob", age: 22 },
// ];

// // Get all students
// app.get("/students", (req, res) => {
//   res.json(students);
// });

// // Add new student
// app.post("/students", (req, res) => {
//   const newStudent = { id: Date.now(), ...req.body };
//   students.push(newStudent);
//   res.status(201).json(newStudent);
// });

// app.get("/health", (req, res) => res.send("Server is healthy ✅"));

// // Test root
// app.get("/", (req, res) => res.send("Student API running..."));

// app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));