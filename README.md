# Student Management API Gateway Setup (Gravitee + Node + React)

This guide documents the complete setup of a simple backend (Node.js + Express) and frontend (React), managed via **Gravitee.io API Management** with policies such as **Rate Limiting** and **CORS**.  
It includes all issues encountered and their solutions.

---

## 🧩 Project Structure

```
student-app/
│
├── backend/
│   └── server.js
│
├── frontend/
│   └── src/App.jsx
│
└── gravitee/
    └── student-api.json
```

---

## ⚙️ 1. Backend Setup (Express API)

### Code
```js
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let students = [
  { id: 1, name: "Alice", age: 21 },
  { id: 2, name: "Bob", age: 22 },
];

app.get("/students", (req, res) => res.json(students));

app.post("/students", (req, res) => {
  const newStudent = { id: Date.now(), ...req.body };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
```

### Test
```bash
curl http://localhost:5000/students
```

Expected output:
```json
[{"id":1,"name":"Alice","age":21},{"id":2,"name":"Bob","age":22}]
```

---

## 🏗️ 2. Gravitee Setup (Docker)

### Docker Compose
```yaml
version: '3'
services:
  mongo:
    image: mongo:4.2
    ports: ["27017:27017"]
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.3
    environment:
      - discovery.type=single-node
    ports: ["9200:9200"]
  gateway:
    image: graviteeio/apim-gateway:latest
    ports: ["8082:8082"]
  management_api:
    image: graviteeio/apim-management-api:latest
    ports: ["8083:8083"]
  management_ui:
    image: graviteeio/apim-management-ui:latest
    ports: ["8084:80"]
```

Run:
```bash
docker-compose up -d
```

Access:
- Management Console → [http://localhost:8084](http://localhost:8084)
- Gateway → [http://localhost:8082](http://localhost:8082)

---

## 🧱 3. API Creation in Gravitee

1. Log in to the console → **APIs → + Create API → Manual**
2. Name: `Student API`
3. Context Path: `/students`
4. Backend target: `http://host.docker.internal:5000`
5. Save → **Deploy API**

---

## 🔐 4. Create Plan with API Key and Rate Limiting

1. Go to **Plans → + Add Plan**
2. Type: **API Key**
3. Name: `Standard Plan`
4. Add Policy:
   - **Rate Limit:** 5 requests per minute
5. Publish the plan.
6. Create an **Application** → Subscribe → get an API key.

---

## 🔑 5. Test via Gateway

```bash
(Invoke-WebRequest -Uri "http://localhost:8082/students/students" -Headers @{ "X-Gravitee-Api-Key" = "6ed4cb1f-4d11-497c-9542-73c53a42c0b6" }).Content
```

Should return the student list.

If you exceed the limit:
```json
{"message":"Rate limit exceeded"}
```

---

## 🌐 6. CORS Policy Configuration (Critical)

**Problem:**  
Browser console showed:
```
Access to XMLHttpRequest ... has been blocked by CORS policy
Request header field x-gravitee-api-key is not allowed...
```

### Root Cause
Gravitee didn’t send the `Access-Control-Allow-Headers` response for preflight requests.

### ✅ Resolution
Modify the API definition file (`student-api.json`) or via UI:

```json
"cors": {
  "enabled": true,
  "allowCredentials": false,
  "allowOrigin": ["*"],
  "allowHeaders": ["content-type", "x-gravitee-api-key"],
  "allowMethods": ["DELETE", "POST", "GET", "OPTIONS", "PUT"],
  "exposeHeaders": ["x-gravitee-api-key"],
  "maxAge": 3600,
  "runPolicies": true
}
```

Then import the file via:
**APIs → Import → Import API Definition** → Deploy again.

---

## 🧪 7. Verify CORS Fix

### Command

curl.exe -i -X OPTIONS "http://localhost:8082/students/students" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type, x-gravitee-api-key"                                                              
HTTP/1.1 200 OK                                                                                                                                                         X-Gravitee-Transaction-Id: 6b821133-11e0-4103-8211-3311e0b10363                                                                                                         X-Gravitee-Request-Id: 6b821133-11e0-4103-8211-3311e0b10363                                                                                                             Access-Control-Allow-Credentials: true                                                                                                                                  
Access-Control-Allow-Origin: http://localhost:5173                                                                                                                      Access-Control-Expose-Headers: x-gravitee-api-key                                                                                                                       content-length: 0                                                                                                                                                                                        

```bash
curl.exe -i -X OPTIONS "http://localhost:8082/students/students" `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type, x-gravitee-api-key"
```

### Expected Response
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: content-type,x-gravitee-api-key
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

Once this appears, React can POST successfully.

---

## ⚛️ 8. React Frontend Setup

### `App.jsx`
```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const API_KEY = "<your Gravitee API key>";
  const API_BASE = "http://localhost:8082/students";

  const headers = {
    "X-Gravitee-Api-Key": API_KEY,
    "Content-Type": "application/json",
  };

  const fetchStudents = async () => {
    const res = await axios.get(`${API_BASE}/students`, { headers });
    setStudents(res.data);
  };

  const addStudent = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/students`, { name, age: Number(age) }, { headers });
    fetchStudents();
  };

  useEffect(() => { fetchStudents(); }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>🎓 Student Management</h1>
      <form onSubmit={addStudent}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <button type="submit">Add Student</button>
      </form>
      <table border="1" cellPadding="5">
        <thead><tr><th>ID</th><th>Name</th><th>Age</th></tr></thead>
        <tbody>{students.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.age}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default App;
```

---

## 🧩 9. Common Issues & Resolutions

| Issue | Cause | Fix |
|-------|--------|-----|
| **502 Bad Gateway** | Gateway couldn’t reach backend | Use `http://host.docker.internal:5000` in endpoint |
| **CORS error** | Missing `Access-Control-Allow-Headers` | Add `content-type,x-gravitee-api-key` in CORS |
| **429 Too Many Requests** | Rate limit exceeded | Increase limits or wait for reset |
| **401 Unauthorized** | Invalid/missing API key | Use valid `X-Gravitee-Api-Key` header |
| **OpenAPI error (“getInfo() is null”)** | Imported wrong file type | Use “Import API Definition”, not “OpenAPI” |

---

## ✅ Final Working Flow

1. React sends `POST /students` →  
2. Gravitee validates API key, applies rate limit, handles CORS →  
3. Gateway forwards to `Express backend` →  
4. Response returns through Gravitee to browser.

---

**Result:**  
- ✅ Backend works directly on `:5000`  
- ✅ Gravitee gateway enforces keys, limits, and CORS  
- ✅ React frontend communicates smoothly with gateway.

---

**Author:** Keerthika B  
**Environment:** Gravitee APIM (Docker), Node.js 18+, React 18+  
**Last updated:** November 2025
