import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConstituencyList = () => {
  const [constituencies, setConstituencies] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logAuditAction = async (action, description) => {
    if (!user) return;

    try {
      await axios.post('http://localhost:8000/api/audit-logs', {
        user_id: user.id,
        action,
        description,
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const fetchConstituencies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/constituencies');
      setConstituencies(response.data);
    } catch (error) {
      console.error('Error fetching constituencies:', error);
    }
  };

  useEffect(() => {
    fetchConstituencies();const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/constituencies/${id}`);
      await logAuditAction('Delete Polling Division', `Deleted polling division with ID: ${id}`);
      fetchConstituencies();
    } catch (error) {
      console.error('Error deleting polling division:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Polling Division List</h1>
        <button
          onClick={() => navigate('/constituencies/add')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Division
        </button>
      </div>

      <p>Total Polling Divisions: {constituencies.length}</p>

      <ul className="space-y-4 mt-4">
        {constituencies.map(constituency => (
          <li key={constituency.id} className="bg-white shadow p-4 rounded flex items-center">
            {constituency.name} | {constituency.district.name}

            <div className="space-x-2">
              <button
                onClick={() => navigate('/constituencies/edit', { state: { constituency } })}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(constituency.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConstituencyList;
