// // import { useState, useEffect, useRef } from "react";
// // import axios from "axios";

// // const GATEWAY_URL = "http://localhost:8082";

// // // 🔑 Multiple keys per domain
// // const DOMAIN_KEYS = {
// //   students: ["a60ceb3e-2b29-499a-8254-8bb4b7039772", "fb04451a-2311-40c2-bf01-d027a007a1aa"],
// //   courses: ["7a4e543b-3d14-4c7c-9b22-9d29f6c8d664", "494b1659-eab4-47f1-85d1-b9f9db41844d"],
// //   enroll: ["fa5b5f87-4930-413c-bee3-0d6a07b0ec40", "ec8cd376-23e4-4aea-afbb-dee96e9d2540"],
// // };

// // // 🧠 Helper function with rotation
// // async function callAPI(domain, endpoint, method = "get", data = null) {
// //   const keys = DOMAIN_KEYS[domain];
// //   let currentKeyIndex = 0;
// //   let lastError = null;

// //   for (let i = 0; i < keys.length; i++) {
// //     const key = keys[currentKeyIndex];
// //     const url = `${GATEWAY_URL}/${domain}${endpoint}`;
// //     console.log(`➡️ ${domain.toUpperCase()} using key [${currentKeyIndex + 1}] ${key}`);

// //     try {
// //       const res = await axios({
// //         method,
// //         url,
// //         data,
// //         headers: {
// //           "X-Gravitee-Api-Key": key,
// //           "Content-Type": "application/json",
// //         },
// //         validateStatus: () => true, // handle manually
// //       });

// //       // Log rate limit headers
// //       const limit = res.headers["x-rate-limit-limit"] || res.headers["x-ratelimit-limit"];
// //       const remaining = res.headers["x-rate-limit-remaining"] || res.headers["x-ratelimit-remaining"];
// //       const reset = res.headers["x-rate-limit-reset"] || res.headers["x-ratelimit-reset"];
// //       if (limit && remaining) {
// //         console.log(
// //           `%c${domain.toUpperCase()} Limit:${limit} Remaining:${remaining} Reset:${reset}`,
// //           "color: orange"
// //         );
// //       }

// //       // ✅ Success
// //       if (res.status >= 200 && res.status < 300) {
// //         console.log(`✅ ${domain} success with key [${currentKeyIndex + 1}]`);
// //         return res.data;
// //       }

// //       // ⚠️ Rotate key on rate-limit or forbidden
// //       if ([403, 429].includes(res.status)) {
// //         console.warn(
// //           `⚠️ ${domain} key [${currentKeyIndex + 1}] failed (${res.status}), rotating key...`
// //         );
// //         currentKeyIndex = (currentKeyIndex + 1) % keys.length;
// //         continue;
// //       }

// //       lastError = res.statusText || res.data;
// //       break;
// //     } catch (err) {
// //       console.error(`💥 ${domain} key [${currentKeyIndex + 1}] failed: ${err.message}`);
// //       lastError = err.message;
// //       currentKeyIndex = (currentKeyIndex + 1) % keys.length;
// //     }
// //   }

// //   throw new Error(lastError || `All keys for ${domain} failed`);
// // }

// // export default function App() {
// //   const [students, setStudents] = useState([]);
// //   const [courses, setCourses] = useState([]);
// //   const [enrollments, setEnrollments] = useState([]);
// //   const [name, setName] = useState("");
// //   const [title, setTitle] = useState("");
// //   const [msg, setMsg] = useState("");
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   // 🔹 Load initial data
// //   const loadAll = async () => {
// //     try {
// //       setLoading(true);
// //       const [s, c, e] = await Promise.all([
// //         callAPI("students", "/students/list"),
// //         callAPI("courses", "/courses/list"),
// //         callAPI("enroll", "/enroll/list"),
// //       ]);
// //       setStudents(s);
// //       setCourses(c);
// //       setEnrollments(e);
// //       setLoading(false);
// //     } catch (err) {
// //       setError("Failed to fetch data: " + err.message);
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadAll();
// //   }, []);

// //   // 🔸 Add student
// //   const addStudent = async () => {
// //     if (!name) return;
// //     await callAPI("students", "/students/add", "post", { name, age: 22 });
// //     setName("");
// //     loadAll();
// //   };

// //   // 🔸 Add course
// //   const addCourse = async () => {
// //     if (!title) return;
// //     await callAPI("courses", "/courses/add", "post", { title });
// //     setTitle("");
// //     loadAll();
// //   };

// //   // 🔸 Enroll demo
// //   const enrollStudent = async () => {
// //     await callAPI("enroll", "/enroll/add", "post", { studentId: 1, courseId: 1 });
// //     setMsg("✅ Student 1 enrolled in Course 1");
// //     loadAll();
// //   };

// //   return (
// //     <div style={{ fontFamily: "Arial", padding: 30 }}>
// //       <h1>🎓 Gravitee Multi-Key Demo</h1>
// //       <p style={{ color: "gray" }}>
// //         Each domain (Students, Courses, Enroll) has 2 API keys — rotation enabled.
// //       </p>

// //       {error && <p style={{ color: "red" }}>{error}</p>}
// //       {msg && <p style={{ color: "green" }}>{msg}</p>}
// //       {loading && <p>Loading data...</p>}

// //       <div style={{ marginBottom: 20 }}>
// //         <input
// //           placeholder="Student name"
// //           value={name}
// //           onChange={(e) => setName(e.target.value)}
// //           style={{ marginRight: 10, padding: 5 }}
// //         />
// //         <button onClick={addStudent}>➕ Add Student</button>
// //       </div>

// //       <div style={{ marginBottom: 20 }}>
// //         <input
// //           placeholder="Course title"
// //           value={title}
// //           onChange={(e) => setTitle(e.target.value)}
// //           style={{ marginRight: 10, padding: 5 }}
// //         />
// //         <button onClick={addCourse}>➕ Add Course</button>
// //       </div>

// //       <div style={{ marginBottom: 20 }}>
// //         <button onClick={enrollStudent}>📘 Enroll Student 1 → Course 1</button>
// //       </div>

// //       <div style={{ display: "flex", gap: "40px" }}>
// //         <div>
// //           <h2>Students</h2>
// //           <ul>{students.map((s) => <li key={s.id}>{s.name}</li>)}</ul>
// //         </div>

// //         <div>
// //           <h2>Courses</h2>
// //           <ul>{courses.map((c) => <li key={c.id}>{c.title}</li>)}</ul>
// //         </div>

// //         <div>
// //           <h2>Enrollments</h2>
// //           <ul>
// //             {enrollments.map((e) => (
// //               <li key={e.id}>Student {e.studentId} → Course {e.courseId}</li>
// //             ))}
// //           </ul>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useEffect } from "react";
// import axios from "axios";

// // 🌐 Gravitee Gateway Base URL
// const GATEWAY_URL = "http://localhost:8082";

// // 🔑 Domain-wise API keys (two per API)
// const DOMAIN_KEYS = {
//   student: [
//     "a60ceb3e-2b29-499a-8254-8bb4b7039772",
//     "fb04451a-2311-40c2-bf01-d027a007a1aa",
//   ],
//   course: [
//     "7a4e543b-3d14-4c7c-9b22-9d29f6c8d664",
//     "494b1659-eab4-47f1-85d1-b9f9db41844d",
//   ],
//   enroll: [
//     "fa5b5f87-4930-413c-bee3-0d6a07b0ec40",
//     "ec8cd376-23e4-4aea-afbb-dee96e9d2540",
//   ],
// };

// // 🧩 Context paths in Gravitee
// const CONTEXT_PATHS = {
//   student: "/student-api",
//   course: "/courses-api",
//   enroll: "/enroll-api",
// };

// // 🔧 Universal call function with key rotation
// async function callAPI(domain, endpoint, method = "get", data = null) {
//   const keys = DOMAIN_KEYS[domain];
//   let currentKeyIndex = 0;
//   let lastError = null;

//   for (let i = 0; i < keys.length; i++) {
//     const key = keys[currentKeyIndex];
//     const url = `${GATEWAY_URL}${CONTEXT_PATHS[domain]}${endpoint}`;
//     console.log(`➡️ ${domain.toUpperCase()} using key [${currentKeyIndex + 1}] ${key}`);

//     try {
//       const res = await axios({
//         method,
//         url,
//         data,
//         headers: {
//           "X-Gravitee-Api-Key": key,
//           "Content-Type": "application/json",
//         },
//         validateStatus: () => true,
//       });

//       // 🧠 Rate-limit info
//       const limit = res.headers["x-rate-limit-limit"] || res.headers["x-ratelimit-limit"];
//       const remaining =
//         res.headers["x-rate-limit-remaining"] || res.headers["x-ratelimit-remaining"];
//       const reset = res.headers["x-rate-limit-reset"] || res.headers["x-ratelimit-reset"];

//       if (limit && remaining) {
//         console.log(
//           `%c${domain.toUpperCase()} → Limit: ${limit}, Remaining: ${remaining}, Reset: ${reset}`,
//           "color: orange"
//         );
//       }

//       if (res.status >= 200 && res.status < 300) {
//         console.log(`✅ ${domain} success with key [${currentKeyIndex + 1}]`);
//         return res.data;
//       }

//       if ([403, 429].includes(res.status)) {
//         console.warn(
//           `⚠️ ${domain} key [${currentKeyIndex + 1}] failed (${res.status}), rotating...`
//         );
//         currentKeyIndex = (currentKeyIndex + 1) % keys.length;
//         continue;
//       }

//       lastError = res.statusText || res.data;
//       break;
//     } catch (err) {
//       console.error(`💥 ${domain} key [${currentKeyIndex + 1}] failed: ${err.message}`);
//       lastError = err.message;
//       currentKeyIndex = (currentKeyIndex + 1) % keys.length;
//     }
//   }

//   throw new Error(lastError || `All keys for ${domain} failed`);
// }

// export default function App() {
//   const [students, setStudents] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [studentName, setStudentName] = useState("");
//   const [courseTitle, setCourseTitle] = useState("");
//   const [msg, setMsg] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // 🔹 Load everything at start
//   const loadAll = async () => {
//     try {
//       setLoading(true);
//       const [s, c, e] = await Promise.all([
//         callAPI("student", "/student/list"),
//         callAPI("course", "/courses/list"),
//         callAPI("enroll", "/enroll/list"),
//       ]);
//       setStudents(s);
//       setCourses(c);
//       setEnrollments(e);
//       setLoading(false);
//     } catch (err) {
//       setError("❌ " + err.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAll();
//   }, []);

//   // 🔸 Add Student
//   const addStudent = async () => {
//     if (!studentName) return;
//     await callAPI("student", "/student/add", "post", { name: studentName, age: 21 });
//     setStudentName("");
//     loadAll();
//   };

//   // 🔸 Add Course
//   const addCourse = async () => {
//     if (!courseTitle) return;
//     await callAPI("course", "/course/add", "post", { title: courseTitle });
//     setCourseTitle("");
//     loadAll();
//   };

//   // 🔸 Enroll
//   const enrollStudent = async () => {
//     await callAPI("enroll", "/enroll/add", "post", { studentId: 1, courseId: 1 });
//     setMsg("✅ Student 1 enrolled in Course 1");
//     loadAll();
//   };

//   return (
//     <div style={{ fontFamily: "Arial", padding: 30 }}>
//       <h1>🎓 Gravitee Multi-Domain Demo</h1>
//       <p style={{ color: "gray" }}>
//         APIs: <b>/student-api</b>, <b>/course-api</b>, <b>/enroll-api</b> (each with key rotation)
//       </p>

//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {msg && <p style={{ color: "green" }}>{msg}</p>}
//       {loading && <p>Loading data...</p>}

//       <div style={{ marginBottom: 20 }}>
//         <input
//           placeholder="Student name"
//           value={studentName}
//           onChange={(e) => setStudentName(e.target.value)}
//           style={{ marginRight: 10, padding: 5 }}
//         />
//         <button onClick={addStudent}>➕ Add Student</button>
//       </div>

//       <div style={{ marginBottom: 20 }}>
//         <input
//           placeholder="Course title"
//           value={courseTitle}
//           onChange={(e) => setCourseTitle(e.target.value)}
//           style={{ marginRight: 10, padding: 5 }}
//         />
//         <button onClick={addCourse}>➕ Add Course</button>
//       </div>

//       <div style={{ marginBottom: 20 }}>
//         <button onClick={enrollStudent}>📘 Enroll Student 1 → Course 1</button>
//       </div>

//       <div style={{ display: "flex", gap: "40px" }}>
//         <div>
//           <h2>Students</h2>
//           <ul>{students.map((s) => <li key={s.id}>{s.name}</li>)}</ul>
//         </div>

//         <div>
//           <h2>Courses</h2>
//           <ul>{courses.map((c) => <li key={c.id}>{c.title}</li>)}</ul>
//         </div>

//         <div>
//           <h2>Enrollments</h2>
//           <ul>
//             {enrollments.map((e) => (
//               <li key={e.id}>Student {e.studentId} → Course {e.courseId}</li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }


import React from "react";

export default function MainDashboard() {
  return (
    <div style={{ fontFamily: "Arial", padding: 30, textAlign: "center" }}>
      <h1>🎓 Gravitee Multi-Domain System</h1>
      <p>Select a dashboard below:</p>

      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40 }}>
        <a href="http://localhost:5174" target="_blank" style={linkStyle}>Student Dashboard</a>
        <a href="http://localhost:5175" target="_blank" style={linkStyle}>Course Dashboard</a>
        <a href="http://localhost:5176" target="_blank" style={linkStyle}>Enrollment Dashboard</a>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: "15px 30px",
  border: "1px solid #333",
  borderRadius: 10,
  textDecoration: "none",
  color: "white",
  backgroundColor: "#007bff",
};
