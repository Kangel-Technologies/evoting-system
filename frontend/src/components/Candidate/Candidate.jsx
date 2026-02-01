import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';

const Candidate = () => {
  // const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    party: '',
    biography: '',
    election_id: '',
    candidate_picture: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch logged-in user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const fetchElections = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/elections');
      setElections(response.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  }, []);

  const fetchParties = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/parties');
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchCandidateById(id);
    }

    fetchElections();
    fetchParties();
  }, [id, fetchElections, fetchParties]);

  const logAuditAction = async (action, description) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      candidate_picture: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form submission starts

    const data = new FormData();
    data.append('name', formData.name);
    data.append('party', formData.party);
    data.append('biography', formData.biography);
    data.append('election_id', formData.election_id);
    if (formData.candidate_picture) {
      data.append('candidate_picture', formData.candidate_picture);
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/api/candidates/${formData.id}`, data);
        await logAuditAction('Update Candidate', `Updated candidate: ${formData.name}`);
      } else {
        await axios.post('http://localhost:8000/api/candidates', data);
        await logAuditAction('Add Candidate', `Added candidate: ${formData.name}`);
      }
      resetForm();
    } catch (error) {
      console.error('Error submitting candidate:', error);
    } finally {
      setLoading(false); // Set loading back to false when form submission is complete
    }
  };

  const fetchCandidateById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/candidates`);
      const candidate = response.data.find(c => c.id === parseInt(id));

      if (candidate) {
        setFormData({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          biography: candidate.biography,
          election_id: candidate.election_id,
          candidate_picture: null,
        });
      }
    } catch (error) {
      console.error("Error loading candidate:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      party: '',
      biography: '',
      election_id: '',
      candidate_picture: null,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Candidate' : 'Add Candidate'}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {/* Candidate Name */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="p-2 border mb-2 w-full"
            required
          />
        </div>

        {/* Candidate Picture */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="candidate_picture">
            Candidate Picture
          </label>
          <input
            type="file"
            name="candidate_picture"
            onChange={handleFileChange}
            className="p-2 border mb-2 w-full"
          />
        </div>

        {/* Candidate Party */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="party">
            Party
          </label>
          <select
            name="party"
            value={formData.party}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border"
            required
          >
            <option value="">Select a Party</option>
            {parties.map((party) => (
              <option key={party.id} value={party.name}>
                {party.name}
              </option>
            ))}
          </select>
        </div>

        {/* Candidate Biography */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="biography">
            Biography
          </label>
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleInputChange}
            placeholder="Biography"
            className="p-2 border mb-2 w-full"
          />
        </div>

        {/* Select Election */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="election_id">
            Election
          </label>
          <select
            name="election_id"
            value={formData.election_id}
            onChange={handleInputChange}
            className="p-2 border mb-2 w-full"
            required
          >
            <option value="">Select an Election</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mt-2"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Processing...' : isEditing ? 'Update Candidate' : 'Add Candidate'}
        </button>
        {isEditing && (
          <button type="button" onClick={resetForm} className="bg-gray-500 text-white p-2 rounded mt-2 ml-2">
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default Candidate;
