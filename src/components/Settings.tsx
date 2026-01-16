import { useState, useEffect } from 'react';
import { getAvailableThemes, getSelectedTheme, saveSelectedTheme, applyThemeToBody } from '../utils/themeManager';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(getSelectedTheme());
  const [availableThemes] = useState<string[]>(getAvailableThemes());

  useEffect(() => {
    // Apply theme when component mounts
    applyThemeToBody(selectedTheme);
  }, []);

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    // Don't save yet - wait for Save button
  };

  const handleSave = () => {
    saveSelectedTheme(selectedTheme);
    applyThemeToBody(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Theme</h3>
            <div className="space-y-2">
              {availableThemes.map((theme) => (
                <label
                  key={theme}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedTheme === theme
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={selectedTheme === theme}
                    onChange={() => handleThemeChange(theme)}
                    className="mr-3"
                  />
                  <span className="font-medium text-gray-700">{theme}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
