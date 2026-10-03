const STARS = [1, 2, 3, 4, 5];

const StarSelector = ({ value, onChange, disabled = false }) => (
  <div role="radiogroup" aria-label="Rating" className="flex gap-1">
    {STARS.map((star) => (
      <button
        key={star}
        type="button"
        role="radio"
        aria-checked={value === star}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
        disabled={disabled}
        onClick={() => onChange(star)}
        className={`text-2xl leading-none disabled:opacity-50 ${
          value && star <= value ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

export default StarSelector;
