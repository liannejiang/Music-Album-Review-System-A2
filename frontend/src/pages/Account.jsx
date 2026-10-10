import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Account = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setStatus('loading');
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(response.data);
        setStatus('loaded');
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load account information.');
        setStatus('error');
      }
    };

    loadProfile();
  }, [user.token]);

  const detailRows = [
    ['Name', profile?.name],
    ['Email', profile?.email],
    ['University', profile?.university],
    ['Address', profile?.address],
  ];

  const displayValue = (value) => value || 'Not provided';

  return (
    <main className="max-w-2xl mx-auto mt-10 mb-20 px-4">
      <Link to="/" className="text-sm text-blue-600 mb-4 inline-block">
        ← Back to catalogue
      </Link>

      <section className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-2">My Account</h1>
        <p className="text-sm text-gray-500 mb-6">View your account details.</p>

        {status === 'loading' && <p className="text-gray-500">Loading account information...</p>}
        {status === 'error' && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {message}
          </p>
        )}

        {status === 'loaded' && (
          <dl className="divide-y">
            {detailRows.map(([label, value]) => (
              <div key={label} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-600">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {displayValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </main>
  );
};

export default Account;
