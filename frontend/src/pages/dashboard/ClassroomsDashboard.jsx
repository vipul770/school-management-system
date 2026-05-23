import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ClassroomsDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      } else {
        console.error('Failed to fetch classrooms');
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading classrooms...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Classrooms Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              cursor: "pointer",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onClick={() => navigate(`/class-details/${classroom.id}`)}
          >
            <h3>{classroom.name}</h3>
            <p>Grade: {classroom.grade}</p>
            <p>Section: {classroom.section}</p>
            <p>Capacity: {classroom.capacity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}