import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser } from '../../utils/dataService';
import UserLayout from './UserLayout';
import { Camera, Save, User } from 'lucide-react';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
      });
      setProfileImage(user.profileImage || null);
      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (user) {
      const updatedUser = {
        ...formData,
        profileImage: previewImage
      };
      
      updateUser(user.id, updatedUser);
      refreshUser();
      setIsEditing(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-48">
            {isEditing ? (
              <div className="absolute bottom-0 right-0 p-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="absolute bottom-0 right-0 p-4">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg"
                >
                  Edit Profile
                </button>
              </div>
            )}
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt={user?.name} 
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-white text-3xl">
                    {user?.name?.charAt(0) || <User size={36} />}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleImageChange} 
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 pt-16">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-gray-700">
                      {user?.bio || "No bio information provided yet."}
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
                    <div className="space-y-2">
                      <p className="flex items-center text-gray-700">
                        <span className="font-medium mr-2">Email:</span> {user?.email}
                      </p>
                      <p className="flex items-center text-gray-700">
                        <span className="font-medium mr-2">Phone:</span> {user?.phone || "Not provided"}
                      </p>
                      <p className="flex items-center text-gray-700">
                        <span className="font-medium mr-2">Location:</span> {user?.location || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Account Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{user?.role}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Credits</p>
                      <p className="font-medium">${user?.credits}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;
