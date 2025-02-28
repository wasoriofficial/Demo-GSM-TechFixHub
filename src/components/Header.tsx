import { useState } from 'react';
import { Search, User } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-6">
        <NotificationsDropdown />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
