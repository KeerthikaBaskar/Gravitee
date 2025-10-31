import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔑 Replace this with your actual Gravitee API Key
  const API_KEY = "fc5d7732-516d-4528-8574-d7711f191d8f";
  const API_BASE = "http://localhost:8082/students";

  const headers = {
    "X-Gravitee-Api-Key": API_KEY,
    "Content-Type": "application/json",
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/students`, { headers });
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch students. Check API Gateway or Key.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add student
  const addStudent = async (e) => {
    e.preventDefault();
    if (!name || !age) return;

    try {
      await axios.post(`${API_BASE}/students`, { name, age: Number(age) }, { headers });
      setName("");
      setAge("");
      fetchStudents();
    } catch (err) {
      setError("Failed to add student. Check API Gateway or Key.");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "30px" }}>
      <h1>🎓 Student Management</h1>
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
