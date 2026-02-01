import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Constituency = () => {
  // State variables
  const [name, setName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState({}); // User data for audit log

  // Fetch constituencies and districts when the component is mounted
  useEffect(() => {
    fetchDistricts();
    fetchUser();
  }, []);

  // Fetch user data from localStorage for audit log purposes
  const fetchUser = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  };

  // Function to fetch districts
  const fetchDistricts = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/districts');
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Function to log the "Add Constituency" action in the audit log
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

  // Function to handle adding a new constituency
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/constituencies', {
        name,
        district_id: districtId,
      });
      setMessage('Polling Division added successfully!');
      setName('');
      setDistrictId('');

      // Log the constituency addition to the audit log
      await logAuditAction('Add Polling Division', `Added polling division: ${name} to district ID: ${districtId}`);

      // Clear the message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      setMessage('Error adding constituency. Make sure the name is unique and district exists.');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center space-y-8">
      {/* Add Constituency Card */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-4/5 lg:w-3/4 xl:w-3/4">
        <h1 className="text-2xl font-bold mb-4">Add Polling Division</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col space-y-4">
            {/* Polling Division Name */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter polling division name"
                className="p-2 border rounded w-full"
                required
              />
            </div>

            {/* Select District */}
            <div className="mb-4">
              <label className="block mb-1 text-sm text-left text-gray-700" htmlFor="districtId">
                District
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="p-2 border rounded w-full"
                required
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Polling Division
            </button>
          </div>
          {message && <p className="mt-4 text-green-500">{message}</p>}
        </form>
      </div>
    </div>
  );  
};

export default Constituency;
