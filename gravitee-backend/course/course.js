// courses.js
import express from "express";

const app = express();
// app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "DELETE") return next();
  express.json()(req, res, next);
});


let courses = [
  { id: 1, title: "React Basics", duration: "3 weeks" },
  { id: 2, title: "Node Fundamentals", duration: "4 weeks" },
  { id: 3, title: "API Design", duration: "2 weeks" },
];

// ✅ List courses
app.get("/courses/list", (req, res) => {
  res.json(courses);
});

// app.get("/courses/list", (req, res) => {
//   const courses = db.map((c) => ({
//     id: c.id || c.courseId,
//     title: c.title || c.courseName,
//   }));
//   res.json(courses);
// });


// ✅ Add a new course
app.post("/courses/add", (req, res) => {
  const { title, duration } = req.body;
  if (!title || !duration)
    return res.status(400).json({ error: "Title and duration required" });

  const newCourse = { id: courses.length + 1, title, duration };
  courses.push(newCourse);
  res.json(newCourse);
});

// ✅ Delete course by ID
app.delete("/courses/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  courses = courses.filter((c) => c.id !== id);
  res.json({ message: `Course ${id} deleted` });
});

app.listen(3002, () => console.log("📘 Courses API running on port 3002"));
