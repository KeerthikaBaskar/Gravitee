import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://10.0.0.79:8082/courses-api";
const KEYS = [
  "7a4e543b-3d14-4c7c-9b22-9d29f6c8d664",
  "494b1659-eab4-47f1-85d1-b9f9db41844d",
];

const cardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  let keyIndex = 0;

  const callAPI = async (method, endpoint, data = null) => {
    for (let i = 0; i < KEYS.length; i++) {
      const key = KEYS[keyIndex];
      try {
        const res = await axios({
          method,
          url: `${API_BASE}${endpoint}`,
          headers: {
            "X-Gravitee-Api-Key": key,
            "Content-Type": "application/json",
          },
          data,
          validateStatus: () => true,
        });

        const limit = res.headers["x-rate-limit-limit"];
        const remaining = res.headers["x-rate-limit-remaining"];
        const reset = res.headers["x-rate-limit-reset"];
        if (limit && remaining) {
          console.log(
            `%c[COURSE] Limit:${limit} | Remaining:${remaining} | Reset:${reset}`,
            "color:orange;font-weight:bold;"
          );
        }

        if (res.status >= 200 && res.status < 300) {
          console.log(`✅ Success with key [${keyIndex + 1}]`);
          return res.data;
        }

        if ([403, 429].includes(res.status)) {
          console.warn(
            `%c⚠️ Key [${keyIndex + 1}] hit limit (${res.status}) — rotating...`,
            "color:red;font-weight:bold;"
          );
          keyIndex = (keyIndex + 1) % KEYS.length;
          continue;
        }

        throw new Error(res.statusText || "Request failed");
      } catch (err) {
        console.error(`💥 Key [${keyIndex + 1}] failed: ${err.message}`);
        keyIndex = (keyIndex + 1) % KEYS.length;
      }
    }
    throw new Error("All keys failed");
  };

  // const fetchCourses = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await callAPI("get", "/courses/list");
  //     setCourses(data || []);
  //   } catch (e) {
  //     setError("Failed to load courses: " + e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCourses = async () => {
  try {
    setLoading(true);
    const data = await callAPI("get", "/courses/list");

    // ✅ Normalize backend response to array
    if (Array.isArray(data)) {
      setCourses(data);
    } else if (data && typeof data === "object") {
      console.warn("Non-array response from backend:", data);
      setCourses([]);
    } else {
      setCourses([]);
    }
  } catch (e) {
    setError("Failed to load courses: " + e.message);
    setCourses([]); // fallback to empty array to prevent map crash
  } finally {
    setLoading(false);
  }
};


  const addCourse = async () => {
    setMessage("");
    if (!title.trim()) {
      setMessage("⚠️ Please enter a course title");
      return;
    }
    try {
      await callAPI("post", "/courses/add", {
        title,
        duration: "4 weeks",
      });
      setTitle("");
      setMessage("✅ Course added successfully!");
      fetchCourses();
    } catch (e) {
      setMessage("❌ Failed to add course: " + e.message);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await callAPI("delete", `/courses/delete/${id}`);
      setMessage("🗑️ Course deleted");
      fetchCourses();
    } catch (e) {
      setMessage("❌ Failed to delete course: " + e.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={cardStyle}>
        <h2 style={{ color: "#667eea", fontSize: "28px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          📘 Courses
        </h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>Manage course catalog with rate limiting</p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input
            placeholder="Enter course title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCourse()}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              transition: "border 0.3s",
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
          <button
            onClick={addCourse}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ➕ Add Course
          </button>
        </div>

        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: message.includes("✅") ? "#e8f5e9" : message.includes("❌") ? "#ffebee" : "#fff3e0",
            color: message.includes("✅") ? "#2e7d32" : message.includes("❌") ? "#c62828" : "#e65100",
            marginBottom: "16px",
            fontSize: "14px",
          }}>
            {message}
          </div>
        )}

        {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading courses...</p>}
        {error && <p style={{ color: "#c62828", textAlign: "center" }}>{error}</p>}

        <div style={{ display: "grid", gap: "12px" }}>
          {courses.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                transition: "all 0.3s",
                border: "2px solid transparent",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e3f2fd";
                e.currentTarget.style.border = "2px solid #667eea";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.border = "2px solid transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}>
                  📖
                </div>
                <span style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>{c.title}</span>
              </div>
              <button
                onClick={() => deleteCourse(c.id)}
                style={{
                  backgroundColor: "#ff4757",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#ee2e3f";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#ff4757";
                  e.target.style.transform = "scale(1)";
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}