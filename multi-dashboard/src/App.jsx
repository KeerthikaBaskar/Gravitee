import { Routes, Route, Link } from "react-router-dom";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Enrollments from "./pages/Enrollments";

export default function App() {
  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>🎓 Gravitee Unified Dashboard</h1>

      <nav style={{ display: "flex", gap: "20px", marginBottom: 30 }}>
        <Link to="/students">Students</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/enrollments">Enrollments</Link>
      </nav>

      <Routes>
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/enrollments" element={<Enrollments />} />
        <Route path="*" element={<p>Select a dashboard above.</p>} />
      </Routes>
    </div>
  );
}
