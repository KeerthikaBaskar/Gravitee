import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8082/enroll-api";
const KEYS = [
  "fa5b5f87-4930-413c-bee3-0d6a07b0ec40",
  "ec8cd376-23e4-4aea-afbb-dee96e9d2540",
];

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
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

        const limit = res.headers["x-rate-limit-limit"];
        const remaining = res.headers["x-rate-limit-remaining"];
        const reset = res.headers["x-rate-limit-reset"];
        if (limit && remaining) {
          console.log(
            `%c[ENROLL] Limit:${limit} | Remaining:${remaining} | Reset:${reset}`,
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

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await callAPI("get", "/enroll/list");
      setEnrollments(data);
    } catch (e) {
      setError("Failed to load enrollments: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addEnrollment = async () => {
    await callAPI("post", "/enroll/add", { studentId: 1, courseId: 1 });
    fetchEnrollments();
  };

  const deleteEnrollment = async (id) => {
    await callAPI("delete", `/enroll/delete/${id}`);
    fetchEnrollments();
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: 30 }}>
      <h1>🧾 Enrollment Dashboard</h1>
      <p>Rate-limit and key rotation logs in console</p>

      <button onClick={addEnrollment}>➕ Enroll Student 1 → Course 1</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {enrollments.map((e) => (
          <li key={e.id}>
            Student {e.studentId} → Course {e.courseId}{" "}
            <button onClick={() => deleteEnrollment(e.id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
