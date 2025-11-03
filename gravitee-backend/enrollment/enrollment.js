// enroll.js
import express from "express";
const app = express();
// app.use(express.json());
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "DELETE") return next();
  express.json()(req, res, next);
});


let enrollments = [
  { id: 1, studentId: 1, courseId: 2 },
  { id: 2, studentId: 2, courseId: 1 },
];

// ✅ List enrollments
app.get("/enroll/list", (req, res) => {
  res.json(enrollments);
});

// ✅ Add new enrollment
app.post("/enroll/add", (req, res) => {
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId)
    return res.status(400).json({ error: "studentId and courseId required" });

  const newEnroll = { id: enrollments.length + 1, studentId, courseId };
  enrollments.push(newEnroll);
  res.json(newEnroll);
});

// ✅ Delete enrollment
app.delete("/enroll/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  enrollments = enrollments.filter((e) => e.id !== id);
  res.json({ message: `Enrollment ${id} deleted` });
});

app.listen(3003, () => console.log("🧾 Enrollments API running on port 3003"));
