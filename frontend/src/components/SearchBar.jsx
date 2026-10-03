import { useState } from 'react';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [term, setTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6" role="search">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search by title, artist or track..."
        aria-label="Search albums"
        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
