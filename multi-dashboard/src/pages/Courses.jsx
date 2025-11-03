import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8082/courses-api";
const KEYS = [
  "7a4e543b-3d14-4c7c-9b22-9d29f6c8d664",
  "494b1659-eab4-47f1-85d1-b9f9db41844d",
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

        // 🧠 Rate-limit logging
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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await callAPI("get", "/courses/list");
      setCourses(data);
    } catch (e) {
      setError("Failed to load courses: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
  if (!title) return;
  try {
    // Send both required fields: title and duration
    await callAPI("post", "/courses/add", {
      title,
      duration: "4 weeks",
    });
    setTitle("");
    fetchCourses();
  } catch (e) {
    console.error("Add course failed:", e.message);
  }
};


  const deleteCourse = async (id) => {
    try {
      await callAPI("delete", `/courses/delete/${id}`);
      fetchCourses();
    } catch (e) {
      console.error("Delete failed:", e.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: 30 }}>
      <h1>📘 Course Dashboard</h1>
      <p>Key rotation + rate-limit logs shown in console</p>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 10, padding: "5px 8px" }}
        />
        <button onClick={addCourse}>➕ Add Course</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            {c.title}{" "}
            <button onClick={() => deleteCourse(c.id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
