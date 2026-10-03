import { Link } from 'react-router-dom';

const AddAlbumCard = () => (
  <Link
    to="/admin/albums/new"
    className="bg-white shadow-md rounded overflow-hidden block border-2 border-dashed border-gray-300 hover:border-blue-400"
  >
    <div className="aspect-square bg-gray-50 flex items-center justify-center">
      <span className="text-4xl text-gray-400">+</span>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-blue-600">Add album</h3>
      <p className="text-sm text-gray-400">Create a new entry</p>
      <p className="text-sm text-gray-400 mt-1">&nbsp;</p>
    </div>
  </Link>
);

export default AddAlbumCard;
