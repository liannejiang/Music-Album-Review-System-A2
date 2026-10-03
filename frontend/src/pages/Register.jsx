import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle | error | success
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required.';
    if (!EMAIL_REGEX.test(formData.email)) return 'Please enter a valid email address.';
    if (!PASSWORD_REGEX.test(formData.password)) {
      return 'Password must be at least 8 characters and include a letter and a digit.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus('error');
      setMessage(validationError);
      return;
    }

    try {
      await axiosInstance.post('/api/auth/register', formData);
      setStatus('success');
      setMessage('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 409) {
        setMessage('This email is already registered.');
      } else {
        setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        {status === 'error' && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {message}
          </p>
        )}
        {status === 'success' && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={status === 'success'}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={status === 'success'}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
