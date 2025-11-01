// import { useState, useEffect } from "react";
// import axios from "axios";

// function App() {
//   const [students, setStudents] = useState([]);
//   const [name, setName] = useState("");
//   const [age, setAge] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // 🔑 List of Gravitee API keys (for rotation)
//   const GRAVITEE_KEYS = [
//     "6ed4cb1f-4d11-497c-9542-73c53a42c0b6",
//     "cce3a92d-7a86-4334-89ee-f3f77be6701b",
//   ];

//   // Base Gravitee Gateway URL
//   const API_BASE = "http://localhost:8082/students";

//   // Track current key
//   let currentKeyIndex = 0;

//   // 🧠 Function to make requests with key rotation
//   const callWithRotation = async (method, url, data = null) => {
//   let lastError = null;

//   for (let i = 0; i < GRAVITEE_KEYS.length; i++) {
//     const key = GRAVITEE_KEYS[currentKeyIndex];
//     console.log(`➡️ Using Gravitee Key [${currentKeyIndex + 1}] ${key}`);

//     try {
//       const res = await axios({
//         method,
//         url: `${API_BASE}${url}`,
//         headers: {
//           "X-Gravitee-Api-Key": key,
//           "Content-Type": "application/json",
//         },
//         data,
//         validateStatus: () => true,
//       });

//       // 🧩 Log rate-limit headers if present
//       const limit = res.headers["x-ratelimit-limit"];
//       const remaining = res.headers["x-ratelimit-remaining"];
//       const reset = res.headers["x-ratelimit-reset"];
//       if (limit && remaining) {
//         console.log(
//           `%c📊 Rate limit → Limit: ${limit}, Remaining: ${remaining}, Reset: ${reset}`,
//           "color: orange"
//         );
//       }

//       if (res.status >= 200 && res.status < 300) {
//         console.log(`✅ Success with Key [${currentKeyIndex + 1}]`);
//         return res.data;
//       }

//       if ([403, 429].includes(res.status)) {
//         console.warn(
//           `⚠️ Key [${currentKeyIndex + 1}] got ${res.status}. Rotating key...`
//         );
//         currentKeyIndex = (currentKeyIndex + 1) % GRAVITEE_KEYS.length;
//         continue;
//       }

//       lastError = res.data || res.statusText;
//       break;
//     } catch (err) {
//       console.error(
//         `💥 Request failed with key [${currentKeyIndex + 1}]: ${err.message}`
//       );
//       lastError = err.message;
//       currentKeyIndex = (currentKeyIndex + 1) % GRAVITEE_KEYS.length;
//     }
//   }

//   throw new Error(lastError || "All Gravitee keys failed");
// };


//   // 🔹 Fetch students
//   const fetchStudents = async () => {
//     try {
//       setLoading(true);
//       const data = await callWithRotation("get", "/students");
//       setStudents(data);
//       setLoading(false);
//     } catch (err) {
//       setError("❌ Failed to fetch students: " + err.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   // 🔹 Add student
//   const addStudent = async (e) => {
//     e.preventDefault();
//     if (!name || !age) return;

//     try {
//       setLoading(true);
//       await callWithRotation("post", "/students", { name, age: Number(age) });
//       setName("");
//       setAge("");
//       fetchStudents();
//     } catch (err) {
//       setError("❌ Failed to add student: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ fontFamily: "Arial", padding: "30px" }}>
//       <h1>🎓 Student Management</h1>
//       <form onSubmit={addStudent} style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{ marginRight: "10px", padding: "5px" }}
//         />
//         <input
//           type="number"
//           placeholder="Age"
//           value={age}
//           onChange={(e) => setAge(e.target.value)}
//           style={{ marginRight: "10px", padding: "5px" }}
//         />
//         <button type="submit" style={{ padding: "5px 10px" }}>
//           ➕ Add Student
//         </button>
//       </form>

//       {loading ? (
//         <p>Loading students...</p>
//       ) : error ? (
//         <p style={{ color: "red" }}>{error}</p>
//       ) : (
//         <table border="1" cellPadding="10">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Age</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.map((s) => (
//               <tr key={s.id}>
//                 <td>{s.id}</td>
//                 <td>{s.name}</td>
//                 <td>{s.age}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default App;

import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 Gravitee API keys for rotation
  const GRAVITEE_KEYS = [
    "6ed4cb1f-4d11-497c-9542-73c53a42c0b6",
    "cce3a92d-7a86-4334-89ee-f3f77be6701b",
  ];

  const API_BASE = "http://localhost:8082/students";

  // Track current key index persistently
  const currentKeyIndex = useRef(0);

  // 🧠 Unified call handler with key rotation + rate-limit logs
  const callWithRotation = async (method, url, data = null) => {
    let lastError = null;

    for (let i = 0; i < GRAVITEE_KEYS.length; i++) {
      const key = GRAVITEE_KEYS[currentKeyIndex.current];
      console.log(`➡️ Using Gravitee Key [${currentKeyIndex.current + 1}] ${key}`);

      try {
        const res = await axios({
          method,
          url: `${API_BASE}${url}`,
          headers: {
            "X-Gravitee-Api-Key": key,
            "Content-Type": "application/json",
          },
          data,
          validateStatus: () => true,
        });

        // 🧩 Read rate-limit headers (if CORS exposes them)
        const limit =
          res.headers["x-rate-limit-limit"] || res.headers["x-ratelimit-limit"];
        const remaining =
          res.headers["x-rate-limit-remaining"] ||
          res.headers["x-ratelimit-remaining"];
        const reset =
          res.headers["x-rate-limit-reset"] || res.headers["x-ratelimit-reset"];

        if (limit && remaining) {
          console.log(
            `%c📊 Rate limit → Limit: ${limit}, Remaining: ${remaining}, Reset: ${reset}`,
            "color: orange"
          );
        } else {
          console.log("ℹ️ Rate-limit headers not visible (check CORS exposeHeaders).");
        }

        // ✅ Success
        if (res.status >= 200 && res.status < 300) {
          console.log(`✅ Success with Key [${currentKeyIndex.current + 1}]`);
          return res.data;
        }

        // ⚠️ Rate-limit or quota exceeded
        if ([403, 429].includes(res.status)) {
          console.warn(
            `⚠️ Key [${currentKeyIndex.current + 1}] got ${res.status}. Rotating key...`
          );
          currentKeyIndex.current =
            (currentKeyIndex.current + 1) % GRAVITEE_KEYS.length;
          continue;
        }

        lastError = res.data || res.statusText;
        break;
      } catch (err) {
        console.error(
          `💥 Request failed with key [${currentKeyIndex.current + 1}]: ${err.message}`
        );
        lastError = err.message;
        currentKeyIndex.current =
          (currentKeyIndex.current + 1) % GRAVITEE_KEYS.length;
      }
    }

    throw new Error(lastError || "All Gravitee keys failed");
  };

  // 🔹 Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await callWithRotation("get", "/students");
      setStudents(data);
      setLoading(false);
    } catch (err) {
      setError("❌ Failed to fetch students: " + err.message);
      setLoading(false);
    }
  };

  // 🔹 Prevent React strict mode double-call
  useEffect(() => {
    let called = false;
    if (!called) {
      fetchStudents();
      called = true;
    }
  }, []);

  // 🔹 Add student
  const addStudent = async (e) => {
    e.preventDefault();
    if (!name || !age) return;

    try {
      setLoading(true);
      await callWithRotation("post", "/students", { name, age: Number(age) });
      setName("");
      setAge("");
      fetchStudents();
    } catch (err) {
      setError("❌ Failed to add student: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "30px" }}>
      <h1>🎓 Student Management (with Gravitee Rate-Limiting)</h1>

      <form onSubmit={addStudent} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button type="submit" style={{ padding: "5px 10px" }}>
          ➕ Add Student
        </button>
      </form>

      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
