import { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser, addCredits } from '../utils/dataService';
import { CreditCard, Key, Pencil, Plus, Trash2, UserCog } from 'lucide-react';

// Get roles from localStorage or use defaults
const getAvailableRoles = () => {
  const roles = localStorage.getItem('availableRoles');
  return roles ? JSON.parse(roles) : ['user', 'premium', 'vip', 'admin'];
};

// Save roles to localStorage
const saveAvailableRoles = (roles: string[]) => {
  localStorage.setItem('availableRoles', JSON.stringify(roles));
};

const UsersPage = () => {
  const [users, setUsers] = useState(getUsers());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isRoleManagementModalOpen, setIsRoleManagementModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    credits: 0,
    password: '',
  });
  const [creditAmount, setCreditAmount] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [availableRoles, setAvailableRoles] = useState<string[]>(getAvailableRoles());
  const [newRoleName, setNewRoleName] = useState('');
  const [roleToDelete, setRoleToDelete] = useState('');

  useEffect(() => {
    // Load available roles from localStorage on component mount
    setAvailableRoles(getAvailableRoles());
  }, []);

  const handleAddUser = () => {
    addUser(newUser);
    setUsers(getUsers());
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'user', credits: 0, password: '' });
  };

  const handleUpdateUser = () => {
    if (currentUser) {
      updateUser(currentUser.id, currentUser);
      setUsers(getUsers());
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      deleteUser(currentUser.id);
      setUsers(getUsers());
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateRole = () => {
    if (currentUser) {
      updateUser(currentUser.id, { role: currentUser.role });
      setUsers(getUsers());
      setIsRoleModalOpen(false);
    }
  };

  const handleUpdatePassword = () => {
    if (currentUser && newPassword) {
      updateUser(currentUser.id, { password: newPassword });
      setUsers(getUsers());
      setIsPasswordModalOpen(false);
      setNewPassword('');
    }
  };

  const handleAddCredits = () => {
    if (currentUser && creditAmount > 0) {
      addCredits(currentUser.id, creditAmount);
      setUsers(getUsers());
      setIsCreditModalOpen(false);
      setCreditAmount(0);
    }
  };

  const openEditModal = (user: any) => {
    setCurrentUser({ ...user });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setCurrentUser({ ...user });
    setIsDeleteModalOpen(true);
  };

  const openRoleModal = (user: any) => {
    setCurrentUser({ ...user });
    setIsRoleModalOpen(true);
  };

  const openPasswordModal = (user: any) => {
    setCurrentUser({ ...user });
    setIsPasswordModalOpen(true);
  };

  const openCreditModal = (user: any) => {
    setCurrentUser({ ...user });
    setIsCreditModalOpen(true);
  };

  const handleAddRole = () => {
    if (newRoleName && !availableRoles.includes(newRoleName)) {
      const updatedRoles = [...availableRoles, newRoleName];
      setAvailableRoles(updatedRoles);
      saveAvailableRoles(updatedRoles);
      setNewRoleName('');
    }
  };

  const handleDeleteRole = () => {
    if (roleToDelete && availableRoles.includes(roleToDelete)) {
      // Check if any user has this role
      const usersWithRole = users.filter(user => user.role === roleToDelete);
      
      if (usersWithRole.length > 0) {
        alert(`Cannot delete role "${roleToDelete}" because it's being used by ${usersWithRole.length} user(s).`);
        return;
      }
      
      const updatedRoles = availableRoles.filter(role => role !== roleToDelete);
      setAvailableRoles(updatedRoles);
      saveAvailableRoles(updatedRoles);
      setRoleToDelete('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRoleManagementModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <UserCog size={16} />
            Manage Roles
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'premium' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'vip' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${user.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openCreditModal(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Add Credits"
                    >
                      <CreditCard size={18} />
                    </button>
                    <button 
                      onClick={() => openRoleModal(user)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Edit Role"
                    >
                      <UserCog size={18} />
                    </button>
                    <button 
                      onClick={() => openPasswordModal(user)}
                      className="text-amber-600 hover:text-amber-900"
                      title="Change Password"
                    >
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit User"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(user)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Credits</label>
                <input
                  type="number"
                  value={newUser.credits}
                  onChange={(e) => setNewUser({ ...newUser, credits: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="mb-4">Are you sure you want to delete user "{currentUser.name}"? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isRoleModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User Role</h2>
            <p className="text-sm text-gray-600 mb-4">Update membership role for {currentUser.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={currentUser.role}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleManagementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Role Management</h2>
            
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Available Roles</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableRoles.map(role => (
                    <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{role}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="text-lg font-medium mb-2">Add New Role</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter role name"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <button
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="text-lg font-medium mb-2">Delete Role</h3>
                <div className="flex space-x-2">
                  <select
                    value={roleToDelete}
                    onChange={(e) => setRoleToDelete(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select role to delete</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleDeleteRole}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={!roleToDelete}
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Note: You cannot delete roles that are currently assigned to users.
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsRoleManagementModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other modals remain unchanged */}
      {isPasswordModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <p className="text-sm text-gray-600 mb-4">Update password for {currentUser.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {isCreditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Credits</h2>
            <p className="mb-4">Current balance: ${currentUser.credits}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount to Add</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredits}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
