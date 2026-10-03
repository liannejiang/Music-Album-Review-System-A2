import StarSelector from './StarSelector';

export const MAX_COMMENT_LENGTH = 250;

export const validateReviewStars = (stars) => (stars ? null : 'Please select a rating.');

const ReviewFields = ({ stars, onStarsChange, comment, onCommentChange, disabled = false }) => (
  <>
    <StarSelector value={stars} onChange={onStarsChange} disabled={disabled} />

    <textarea
      value={comment}
      onChange={(e) => onCommentChange(e.target.value)}
      maxLength={MAX_COMMENT_LENGTH}
      placeholder="Share your thoughts (optional)"
      disabled={disabled}
      className="w-full mt-3 p-2 border rounded resize-none"
      rows={3}
    />
    <div className="text-xs text-gray-400 text-right mt-1">
      {comment.length}/{MAX_COMMENT_LENGTH}
    </div>
  </>
);

export default ReviewFields;
