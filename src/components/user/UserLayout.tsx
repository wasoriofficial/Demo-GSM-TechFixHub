import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, FileText, LayoutDashboard, LogOut, Package, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Services', path: '/user/products', icon: <Package size={20} /> },
    { name: 'My Orders', path: '/user/orders', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/user/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/user/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">GSM-TechFixHub</h1>
            </div>
            <nav>
              <ul className="flex space-x-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard size={16} className="text-emerald-600" />
                <span>${user?.credits}</span>
              </div>
              <Link to="/user/profile" className="flex items-center gap-2">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
