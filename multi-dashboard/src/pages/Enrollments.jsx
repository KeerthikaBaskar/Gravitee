import { useState, useEffect } from "react";
import axios from "axios";

const STUDENT_API = "http://localhost:8082/student-api";
const COURSE_API = "http://localhost:8082/courses-api";
const ENROLL_API = "http://localhost:8082/enroll-api";

const STUDENT_KEYS = ["a60ceb3e-2b29-499a-8254-8bb4b7039772","fb04451a-2311-40c2-bf01-d027a007a1aa"];
const COURSE_KEYS = ["7a4e543b-3d14-4c7c-9b22-9d29f6c8d664","494b1659-eab4-47f1-85d1-b9f9db41844d"];
const ENROLL_KEYS = ["fa5b5f87-4930-413c-bee3-0d6a07b0ec40","ec8cd376-23e4-4aea-afbb-dee96e9d2540"];

const cardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

export default function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const callAPI = async (method, base, endpoint, keys, data = null) => {
    let keyIndex = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[keyIndex];
      try {
        const res = await axios({
          method,
          url: `${base}${endpoint}`,
          headers: {
            "X-Gravitee-Api-Key": key,
            "Content-Type": "application/json",
          },
          data,
          validateStatus: () => true,
        });

        if (res.headers["x-rate-limit-limit"]) {
          console.log(
            `%c[${base}] Limit:${res.headers["x-rate-limit-limit"]} | Remaining:${res.headers["x-rate-limit-remaining"]}`,
            "color:orange;font-weight:bold;"
          );
        }

        if (res.status >= 200 && res.status < 300) {
          console.log(`✅ Success with key [${keyIndex + 1}] for ${base}`);
          return res.data;
        }

        if ([401, 403, 429].includes(res.status)) {
          console.warn(
            `%c⚠️ Key [${keyIndex + 1}] unauthorized or limited (${res.status}) — rotating...`,
            "color:red;font-weight:bold;"
          );
          keyIndex = (keyIndex + 1) % keys.length;
          continue;
        }

        throw new Error(res.statusText || "Request failed");
      } catch (err) {
        console.error(`💥 Key [${keyIndex + 1}] failed: ${err.message}`);
        keyIndex = (keyIndex + 1) % keys.length;
      }
    }
    throw new Error("All keys failed for " + base);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes, enrollRes] = await Promise.all([
        callAPI("get", STUDENT_API, "/student/list", STUDENT_KEYS),
        callAPI("get", COURSE_API, "/courses/list", COURSE_KEYS),
        callAPI("get", ENROLL_API, "/enroll/list", ENROLL_KEYS),
      ]);

      setStudents(
        (studentsRes || []).map((s) => ({
          id: s.id || s.studentId,
          name: s.name || s.studentName,
        }))
      );

      setCourses(
        (coursesRes || []).map((c) => ({
          id: c.id || c.courseId,
          title: c.title || c.courseName,
        }))
      );

      setEnrollments(
        (enrollRes || []).map((e) => ({
          id: e.id || e.enrollId,
          studentId: String(e.studentId || e.student_id),
          courseId: String(e.courseId || e.course_id),
        }))
      );
    } catch (e) {
      setError("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addEnrollment = async () => {
    setMessage("");
    if (!selectedStudent || !selectedCourse) {
      setMessage("⚠️ Please select both student and course");
      return;
    }

    const duplicate = enrollments.find(
      (e) =>
        e.studentId === selectedStudent && e.courseId === selectedCourse
    );
    if (duplicate) {
      setMessage("❗ Student already enrolled in this course");
      return;
    }

    try {
      await callAPI("post", ENROLL_API, "/enroll/add", ENROLL_KEYS, {
        studentId: selectedStudent,
        courseId: selectedCourse,
      });
      setMessage("✅ Enrollment added successfully!");
      fetchData();
    } catch (e) {
      setMessage("❌ Failed to add enrollment: " + e.message);
    }
  };

  const deleteEnrollment = async (id) => {
    try {
      await callAPI("delete", ENROLL_API, `/enroll/delete/${id}`, ENROLL_KEYS);
      setMessage("🗑️ Enrollment deleted");
      fetchData();
    } catch (e) {
      setMessage("❌ Failed to delete enrollment: " + e.message);
    }
  };

  const getStudentName = (id) => {
    const s = students.find((x) => String(x.id) === String(id));
    return s ? s.name : "⚠️ Unknown Student";
  };

  const getCourseName = (id) => {
    const c = courses.find((x) => String(x.id) === String(id));
    return c ? c.title : "⚠️ Unknown Course";
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={cardStyle}>
        <h2 style={{ color: "#667eea", fontSize: "28px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          🧾 Enrollments
        </h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>Connect students with courses</p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(String(e.target.value))}
            style={{
              flex: "1 1 200px",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              transition: "border 0.3s",
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={`s-${s.id}`} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(String(e.target.value))}
            style={{
              flex: "1 1 200px",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              transition: "border 0.3s",
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={`c-${c.id}`} value={String(c.id)}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={addEnrollment}
            style={{
              background: "linear-gradient(135deg, #38b000, #2d8000)",
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
              e.target.style.boxShadow = "0 4px 12px rgba(56, 176, 0, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ➕ Enroll
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

        {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading data...</p>}
        {error && <p style={{ color: "#c62828", textAlign: "center" }}>{error}</p>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ color: "#666", fontSize: "14px", fontWeight: "600" }}>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>#</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Student</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Course</th>
                <th style={{ textAlign: "center", padding: "12px 16px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e, i) => (
                <tr
                  key={`${e.id}-${i}`}
                  style={{
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e3f2fd"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                >
                  <td style={{ padding: "16px", borderRadius: "12px 0 0 12px", fontWeight: "500" }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}>
                        {getStudentName(e.studentId).charAt(0).toUpperCase()}
                      </div>
                      {getStudentName(e.studentId)}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>📖</span>
                      {getCourseName(e.courseId)}
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", borderRadius: "0 12px 12px 0" }}>
                    <button
                      onClick={() => deleteEnrollment(e.id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}