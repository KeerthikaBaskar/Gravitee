// students.js
import express from "express";
const app = express();
// app.use(express.json());
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "DELETE") return next();
  express.json()(req, res, next);
});


let students = [
  { id: 1, name: "Alice", age: 21 },
  { id: 2, name: "Bob", age: 22 },
  { id: 3, name: "Charlie", age: 23 },
];

// ✅ List students
app.get("/student/list", (req, res) => {
  res.json(students);
});

// ✅ Add a new student
app.post("/student/add", (req, res) => {
  const { name, age } = req.body;
  if (!name || !age)
    return res.status(400).json({ error: "Name and age required" });

  const newStudent = { id: students.length + 1, name, age };
  students.push(newStudent);
  res.json(newStudent);
});

// ✅ Delete student by ID
app.delete("/student/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  students = students.filter((s) => s.id !== id);
  res.json({ message: `Student ${id} deleted` });
});

app.listen(3001, () => console.log("🎓 Students API running on port 3001"));
