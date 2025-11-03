import { Routes, Route, Link, useLocation } from "react-router-dom";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Enrollments from "./pages/Enrollments";

const gradientBg = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
const cardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: "/students", label: "Students", icon: "👩‍🎓" },
    { path: "/courses", label: "Courses", icon: "📘" },
    { path: "/enrollments", label: "Enrollments", icon: "🧾" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: gradientBg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            color: "white",
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "12px",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}>
            🎓 Gravitee Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px" }}>
            Unified API management with automatic key rotation
          </p>
        </div>

        <nav style={{
          display: "flex",
          gap: "16px",
          marginBottom: "40px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s",
                backgroundColor: location.pathname === item.path
                  ? "white"
                  : "rgba(255, 255, 255, 0.2)",
                color: location.pathname === item.path
                  ? "#667eea"
                  : "white",
                border: "2px solid transparent",
                boxShadow: location.pathname === item.path
                  ? "0 4px 12px rgba(0,0,0,0.15)"
                  : "none",
              }}
              onMouseOver={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.border = "2px solid white";
                }
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.border = "2px solid transparent";
                }
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <Routes>
          <Route path="/students" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route
            path="*"
            element={
              <div style={{
                ...cardStyle,
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
                padding: "60px 40px",
              }}>
                <div style={{ fontSize: "80px", marginBottom: "20px" }}>
                  🎓
                </div>
                <h2 style={{ color: "#667eea", fontSize: "24px", marginBottom: "12px" }}>
                  Welcome to Gravitee Dashboard
                </h2>
                <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.6" }}>
                  Select a section from the navigation above to manage students, courses, or enrollments.
                </p>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}