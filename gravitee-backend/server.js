const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let students = [
  { id: 1, name: "Alice", age: 21 },
  { id: 2, name: "Bob", age: 22 },
];

// Get all students
app.get("/students", (req, res) => {
  res.json(students);
});

// Add new student
app.post("/students", (req, res) => {
  const newStudent = { id: Date.now(), ...req.body };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.get("/health", (req, res) => res.send("Server is healthy ✅"));

// Test root
app.get("/", (req, res) => res.send("Student API running..."));

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));


// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");

// const app = express();
// app.use(cors());
// // 🩹 Prevent Express from parsing null or empty JSON bodies
// app.use((req, res, next) => {
//   if (
//     req.headers["content-length"] === "0" ||
//     req.headers["content-type"] !== "application/json"
//   ) {
//     return next();
//   }
//   next();
// });

// // ✅ Allow lenient parsing (ignore "null" bodies)
// app.use(express.json({ strict: false }));



// //app.use(express.json());

// // 🔐 Gravitee configuration
// // The keys you got from your different Gravitee applications or plans
// const graviteeKeys = [
//   "9bdf6a92-2543-4fea-a7c4-fd4c33f12847", // replace with your actual keys
//   "5f1e2f20-9fa0-4082-8ef6-ba586e39de24",
//   "4d7750bd-cec1-4f72-8198-1789f68d0b33",
//   "1657e906-c03e-4d2e-976c-7cad48cd1a01"
// ];

// // The base URL of your Gravitee Gateway API
// const GRAVITEE_API_BASE = "http://localhost:8082/students1/students";

// // Track current key in use
// let currentKeyIndex = 0;

// // In-memory student data (for testing)
// let students = [
//   { id: 1, name: "Alice", age: 21 },
//   { id: 2, name: "Bob", age: 22 },
// ];

// // 🧠 Function to call Gravitee Gateway with key rotation
// // 🧠 Function to call Gravitee Gateway with key rotation
// async function callThroughGravitee(method, data = null) {
//   let lastError = null;

//   for (let i = 0; i < graviteeKeys.length; i++) {
//     const key = graviteeKeys[currentKeyIndex];
//     console.log(`➡️ [${new Date().toISOString()}] Using Gravitee Key [${currentKeyIndex + 1}]: ${key}`);

//     try {
//       const res = await axios({
//         method,
//         url: GRAVITEE_API_BASE,
//         headers: {
//           "X-Gravitee-Api-Key": key,
//           "Content-Type": "application/json",
//         },
//         data,
//         validateStatus: () => true, // don't throw automatically
//       });

//       // ✅ Success (200–299)
//       if (res.status >= 200 && res.status < 300) {
//         console.log(`✅ Request succeeded with key [${currentKeyIndex + 1}]`);
//         return res.data;
//       }

//       // ⚠️ Quota / Forbidden → Rotate key
//       if ([429, 403].includes(res.status)) {
//         console.warn(`⚠️ Key [${currentKeyIndex + 1}] (${key}) failed with status ${res.status}`);
//         currentKeyIndex = (currentKeyIndex + 1) % graviteeKeys.length;
//         console.log(`🔁 Rotating to key [${currentKeyIndex + 1}]`);
//         continue;
//       }

//       // ❌ Other errors
//       console.error(`❌ Unexpected status ${res.status} - ${res.statusText}`);
//       lastError = res.data || res.statusText;
//     } catch (err) {
//       console.error(`💥 Request failed for key [${currentKeyIndex + 1}]: ${err.message}`);
//       lastError = err.message;
//     }
//   }

//   console.error("🚫 All keys exhausted. No successful response.");
//   throw new Error(lastError || "All keys failed");
// }


// // 🧠 Direct endpoint (local test, no Gravitee)
// app.get("/students-direct", (req, res) => {
//   res.json([
//     { id: 1, name: "Alice", age: 21 },
//     { id: 2, name: "Bob", age: 22 },
//   ]);
// });

// // 🔹 Endpoint that uses Gravitee
// app.get("/api/students", async (req, res) => {
//   try {
//     const data = await callThroughGravitee("get");
//     res.json(data);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });


// // 🔹 Endpoint for frontend to add a student (through Gravitee)
// app.post("/api/students", async (req, res) => {
//   try {
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({ error: "Request body is empty or invalid" });
//     }

//     const data = await callThroughGravitee("post", req.body);
//     res.status(201).json(data);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Local health check (bypasses Gravitee)
// app.get("/health", (req, res) => res.send("✅ Backend healthy"));

// app.use((req, res, next) => {
//   console.log(`🛰️ ${req.method} ${req.originalUrl}`, req.body);
//   next();
// });

// // Run server
// app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
