import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8082/student-api";
const KEYS = [
  "a60ceb3e-2b29-499a-8254-8bb4b7039772",
  "fb04451a-2311-40c2-bf01-d027a007a1aa",
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
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
            `%c[STUDENT] Limit:${limit} | Remaining:${remaining} | Reset:${reset}`,
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await callAPI("get", "/student/list");
      setStudents(data);
    } catch (e) {
      setError("Failed to load students: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async () => {
    if (!name) return;
    await callAPI("post", "/student/add", { name, age: 22 });
    setName("");
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    await callAPI("delete", `/student/delete/${id}`);
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: 30 }}>
      <h1>👩‍🎓 Students Dashboard</h1>
      <p>Rate-limit and key rotation logs in console</p>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Student name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10, padding: "5px 8px" }}
        />
        <button onClick={addStudent}>➕ Add Student</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.name} <button onClick={() => deleteStudent(s.id)}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
