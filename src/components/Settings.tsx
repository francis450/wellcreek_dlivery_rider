import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Server, Key, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

interface ERPNextSettings {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  useProxy: boolean;
  proxyUrl: string;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<ERPNextSettings>({
    baseUrl: 'https://wellcreek.boraerp.co.ke',
    apiKey: '',
    apiSecret: '',
    useProxy: false,
    proxyUrl: ''
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('erpnext-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('erpnext-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const url = settings.useProxy 
        ? `${settings.proxyUrl}/api/resource/Sales Order?limit_page_length=1`
        : `${settings.baseUrl}/api/resource/Sales Order?limit_page_length=1`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (settings.apiKey && settings.apiSecret) {
        headers['Authorization'] = `token ${settings.apiKey}:${settings.apiSecret}`;
      }

      const response = await fetch(url, { headers });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful! ERPNext API is accessible.');
      } else {
        setTestStatus('error');
        setTestMessage(`Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button 
            onClick={onBack}
            className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Configure ERPNext Integration</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* ERPNext Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-emerald-600" />
            ERPNext Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ERPNext Base URL
              </label>
              <input
                type="url"
                value={settings.baseUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://your-site.erpnext.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Your ERPNext API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={settings.apiSecret}
                onChange={(e) => setSettings(prev => ({ ...prev, apiSecret: e.target.value }))}
                placeholder="Your ERPNext API Secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* CORS Proxy Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            CORS Configuration
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useProxy"
                checked={settings.useProxy}
                onChange={(e) => setSettings(prev => ({ ...prev, useProxy: e.target.checked }))}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="useProxy" className="ml-2 block text-sm text-gray-900">
                Use CORS Proxy
              </label>
            </div>

            {settings.useProxy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proxy URL
                </label>
                <input
                  type="url"
                  value={settings.proxyUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, proxyUrl: e.target.value }))}
                  placeholder="https://cors-anywhere.herokuapp.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Popular options: cors-anywhere.herokuapp.com, allorigins.win
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">CORS Solutions:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Enable CORS in ERPNext site config</li>
                <li>• Use a CORS proxy service</li>
                <li>• Deploy a custom proxy server</li>
                <li>• Configure nginx/apache for CORS headers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Connection</h2>
          
          <button
            onClick={testConnection}
            disabled={testStatus === 'testing' || !settings.baseUrl}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {testStatus === 'testing' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          {testStatus !== 'idle' && (
            <div className={`mt-3 p-3 rounded-lg flex items-start ${
              testStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {testStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                testStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testMessage}
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pb-6">
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors shadow-sm flex items-center justify-center ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2">Setup Instructions:</h3>
          <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
            <li>Create API Key & Secret in ERPNext (User → API Access)</li>
            <li>Enable CORS in ERPNext site_config.json or use proxy</li>
            <li>Test the connection to verify settings</li>
            <li>Save settings and return to orders</li>
          </ol>
        </div>
      </div>
    </div>
  );
};