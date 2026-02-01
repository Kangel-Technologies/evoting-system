import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
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

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/candidates/${id}`);
      await logAuditAction('Delete Candidate', `Deleted candidate with ID: ${id}`);
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Candidate List</h1>
        <button
          onClick={() => navigate('/candidates/add')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Candidate
        </button>
      </div>

      <p>Total Registered Candidates: {candidates.length}</p>

      <ul className="space-y-4 mt-4">
        {candidates.map(candidate => (
          <li key={candidate.id} className="bg-white shadow p-4 rounded flex items-center">
            {candidate.candidate_picture && (
              <img
                src={`http://localhost:8000/storage/${candidate.candidate_picture}`}
                className="w-24 h-24 object-cover mr-4"
                alt=""
              />
            )}

            <div className="flex-1">
              <h3 className="font-bold">{candidate.name}</h3>
              <p className="text-sm">Party: {candidate.party}</p>
              <p className="line-clamp-2">{candidate.biography}</p>
            </div>

            <div className="space-x-2">
              <button
                onClick={() => navigate('/candidates/edit', { state: { candidate } })}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(candidate.id)}
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

export default CandidateList;
