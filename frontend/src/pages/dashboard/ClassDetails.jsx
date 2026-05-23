import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ClassDetails() {
  const { classId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      // Fetch classroom details
      const classroomResponse = await fetch(`/api/classrooms/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (classroomResponse.ok) {
        const classroomData = await classroomResponse.json();
        setClassroom(classroomData);
      }

      // Fetch students in this classroom
      const studentsResponse = await fetch(`/api/students/?classroom_id=${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }

      // Fetch timetable for this classroom
      const timetableResponse = await fetch(`/api/timetable/?classroom_id=${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (timetableResponse.ok) {
        const timetableData = await timetableResponse.json();
        setTimetable(timetableData);

        // Extract unique teachers and subjects from timetable
        const uniqueTeachers = [...new Set(timetableData.map(entry => entry.teacher_id))];
        const uniqueSubjects = [...new Set(timetableData.map(entry => entry.subject))];

        // Fetch teacher details
        const teacherPromises = uniqueTeachers.map(teacherId =>
          fetch(`/api/users/${teacherId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }).then(res => res.ok ? res.json() : null)
        );
        const teacherData = await Promise.all(teacherPromises);
        setTeachers(teacherData.filter(t => t));

        setSubjects(uniqueSubjects);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading class details...</div>;
  }

  if (!classroom) {
    return <div>Classroom not found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Class Details: {classroom.name}</h1>
      <div style={{ marginTop: "20px" }}>
        <h2>Overview</h2>
        <p><strong>Grade:</strong> {classroom.grade}</p>
        <p><strong>Section:</strong> {classroom.section}</p>
        <p><strong>Capacity:</strong> {classroom.capacity}</p>
        <p><strong>Room Number:</strong> {classroom.room_number}</p>
        <p><strong>Student Count:</strong> {students.length}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Teachers</h2>
        <ul>
          {teachers.map((teacher) => (
            <li key={teacher.id}>{teacher.full_name || teacher.username}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Subjects</h2>
        <ul>
          {subjects.map((subject, index) => (
            <li key={index}>{subject}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Timetable</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Day</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Subject</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Teacher</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Start Time</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>End Time</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((entry) => (
              <tr key={entry.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.day_of_week}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.subject}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {teachers.find(t => t.id === entry.teacher_id)?.full_name || entry.teacher_id}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.start_time}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.end_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}