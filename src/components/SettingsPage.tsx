import { useState } from 'react';
import { BellOff, BellRing, Clock, Globe, Moon, PaintBucket, Save, Shield, SlidersVertical, Sun, Type } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteTitle: 'ServiceSphere',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    notifications: {
      orderUpdates: true,
      userSignups: true,
      productUpdates: false,
      marketing: false,
      emailDigest: 'weekly'
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      sidebarExpanded: true,
      highContrast: false
    }
  });

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: value
      }
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked } = e.target;
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [name]: type === 'checkbox' ? checked : e.target.value
      }
    });
  };

  const handleThemeChange = (theme: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme
      }
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuration Center</h1>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-700">Settings Menu</h2>
            </div>
            <div className="p-2">
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'general' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <SlidersVertical size={18} />
                <span>General Settings</span>
              </button>
              
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'notifications' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <BellRing size={18} />
                <span>Notification Preferences</span>
              </button>
              
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'appearance' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('appearance')}
              >
                <PaintBucket size={18} />
                <span>Appearance & Display</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <SlidersVertical size={20} className="text-emerald-600" />
                    General Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure the basic settings for your service platform.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Type size={18} className="text-emerald-600" />
                      <label className="block text-sm font-medium text-gray-700">Site Title</label>
                    </div>
                    <input
                      type="text"
                      name="siteTitle"
                      value={settings.general.siteTitle}
                      onChange={handleGeneralChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe size={18} className="text-emerald-600" />
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                    </div>
                    <select
                      name="language"
                      value={settings.general.language}
                      onChange={handleGeneralChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-emerald-600" />
                      <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    </div>
                    <select
                      name="dateFormat"
                      value={settings.general.dateFormat}
                      onChange={handleGeneralChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-emerald-600" />
                      <label className="block text-sm font-medium text-gray-700">Time Format</label>
                    </div>
                    <select
                      name="timeFormat"
                      value={settings.general.timeFormat}
                      onChange={handleGeneralChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <BellRing size={20} className="text-emerald-600" />
                    Notification Preferences
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Decide which notifications you want to receive.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Order Updates</h4>
                        <p className="text-sm text-gray-500">Receive notifications when order status changes</p>
                      </div>
                      <div className="flex items-center">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="orderUpdates"
                            checked={settings.notifications.orderUpdates}
                            onChange={handleNotificationChange}
                          />
                          <span className="ml-2">{settings.notifications.orderUpdates ? <BellRing size={20} className="text-emerald-600" /> : <BellOff size={20} className="text-gray-400" />}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">User Signups</h4>
                        <p className="text-sm text-gray-500">Get notified when new users register</p>
                      </div>
                      <div className="flex items-center">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="userSignups"
                            checked={settings.notifications.userSignups}
                            onChange={handleNotificationChange}
                          />
                          <span className="ml-2">{settings.notifications.userSignups ? <BellRing size={20} className="text-emerald-600" /> : <BellOff size={20} className="text-gray-400" />}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Product Updates</h4>
                        <p className="text-sm text-gray-500">Receive notifications about product changes</p>
                      </div>
                      <div className="flex items-center">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="productUpdates"
                            checked={settings.notifications.productUpdates}
                            onChange={handleNotificationChange}
                          />
                          <span className="ml-2">{settings.notifications.productUpdates ? <BellRing size={20} className="text-emerald-600" /> : <BellOff size={20} className="text-gray-400" />}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Digest Frequency</label>
                    <select
                      name="emailDigest"
                      value={settings.notifications.emailDigest}
                      onChange={handleNotificationChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <PaintBucket size={20} className="text-emerald-600" />
                    Display Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize how the application appears to you.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Theme</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 rounded-lg flex flex-col items-center ${
                        settings.appearance.theme === 'light' 
                          ? 'bg-emerald-50 border-2 border-emerald-500' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Sun size={24} className={settings.appearance.theme === 'light' ? 'text-emerald-600' : 'text-gray-500'} />
                      <span className="mt-2 text-sm">Light Mode</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 rounded-lg flex flex-col items-center ${
                        settings.appearance.theme === 'dark' 
                          ? 'bg-emerald-50 border-2 border-emerald-500' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Moon size={24} className={settings.appearance.theme === 'dark' ? 'text-emerald-600' : 'text-gray-500'} />
                      <span className="mt-2 text-sm">Dark Mode</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`p-4 rounded-lg flex flex-col items-center ${
                        settings.appearance.theme === 'system' 
                          ? 'bg-emerald-50 border-2 border-emerald-500' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <Shield size={24} className={settings.appearance.theme === 'system' ? 'text-emerald-600' : 'text-gray-500'} />
                      <span className="mt-2 text-sm">System Default</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Interface Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
                        <p className="text-sm text-gray-500">Use less space in UI elements</p>
                      </div>
                      <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="compactMode"
                            checked={settings.appearance.compactMode}
                            onChange={handleAppearanceChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Sidebar Expanded</h4>
                        <p className="text-sm text-gray-500">Always show sidebar labels</p>
                      </div>
                      <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="sidebarExpanded"
                            checked={settings.appearance.sidebarExpanded}
                            onChange={handleAppearanceChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">High Contrast</h4>
                        <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                      </div>
                      <div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="highContrast"
                            checked={settings.appearance.highContrast}
                            onChange={handleAppearanceChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
