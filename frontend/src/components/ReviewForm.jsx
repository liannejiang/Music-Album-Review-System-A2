import { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ReviewFields, { validateReviewStars } from './ReviewFields';

const ReviewForm = ({ albumId, onCreated }) => {
  const { user } = useAuth();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateReviewStars(stars);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        '/api/reviews',
        { albumId, stars, comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setStars(0);
      setComment('');
      onCreated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 mb-4">
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      <ReviewFields
        stars={stars}
        onStarsChange={setStars}
        comment={comment}
        onCommentChange={setComment}
        disabled={submitting}
      />

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
