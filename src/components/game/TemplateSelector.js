'use client';

import { useState } from 'react';
import { Gamepad, Target, PuzzleIcon, Globe, Car } from 'lucide-react';

export default function TemplateSelector({ onSelectTemplate, onUpdateAssets }) {
  const [selectedTemplate, setSelectedTemplate] = useState('rpg');
  const [showCustomization, setShowCustomization] = useState(false);
  const [assetSettings, setAssetSettings] = useState({
    // Character settings
    characterColor: '#00ff00',
    moveSpeed: 0.1,
    
    // Environment settings
    skyColor: '#87CEEB',
    groundColor: '#7CFC00',
    worldSize: 100,
    
    // Features
    hasTrees: true,
    hasWater: true,
    hasMountains: false,
    
    // Special features
    specialFeatures: []
  });

  const templates = [
    { id: 'rpg', name: 'RPG Adventure', icon: <Gamepad size={24} />, description: 'An explorable 3D world with character movement and NPCs' },
    { id: 'shooter', name: 'Space Shooter', icon: <Target size={24} />, description: 'A space-themed shooter with enemies and projectiles' },
    { id: 'platformer', name: 'Platformer', icon: <PuzzleIcon size={24} />, description: 'A platform jumping game with obstacles' },
    { id: 'racing', name: 'Racing Game', icon: <Car size={24} />, description: 'A track-based racing game' },
    { id: 'open-world', name: 'Open World', icon: <Globe size={24} />, description: 'A vast explorable landscape' }
  ];

  const specialFeatureOptions = [
    { id: 'magic', name: 'Magic Effects' },
    { id: 'weather', name: 'Weather System' },
    { id: 'airplanes', name: 'Flying Vehicles' },
    { id: 'day-night', name: 'Day/Night Cycle' }
  ];

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);
    
    // Show customization panel after template selection
    setShowCustomization(true);
  };

  const handleAssetChange = (key, value) => {
    const newSettings = { ...assetSettings, [key]: value };
    setAssetSettings(newSettings);
    onUpdateAssets(newSettings);
  };

  const handleSpecialFeatureToggle = (featureId) => {
    const features = [...assetSettings.specialFeatures];
    
    if (features.includes(featureId)) {
      // Remove feature if already selected
      const index = features.indexOf(featureId);
      features.splice(index, 1);
    } else {
      // Add feature if not selected
      features.push(featureId);
    }
    
    handleAssetChange('specialFeatures', features);
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      {/* Template Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-white">Select Game Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                selectedTemplate === template.id 
                  ? 'bg-indigo-600 border-indigo-500' 
                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
              } transition-colors duration-200`}
            >
              <div className="mb-2">{template.icon}</div>
              <div className="text-sm font-medium">{template.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Asset Customization */}
      {showCustomization && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">Customize Assets</h2>
            <button 
              onClick={() => onUpdateAssets(assetSettings)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm"
            >
              Apply Changes
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Character Settings */}
            <div className="bg-zinc-800 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-3 border-b border-zinc-700 pb-2">Character</h3>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Character Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={assetSettings.characterColor}
                    onChange={(e) => handleAssetChange('characterColor', e.target.value)}
                    className="w-10 h-10 rounded mr-2 cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={assetSettings.characterColor}
                    onChange={(e) => handleAssetChange('characterColor', e.target.value)}
                    className="bg-zinc-900 px-2 py-1 rounded w-20 text-xs font-mono"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">
                  Movement Speed: {assetSettings.moveSpeed.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={assetSettings.moveSpeed}
                  onChange={(e) => handleAssetChange('moveSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Environment Settings */}
            <div className="bg-zinc-800 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-3 border-b border-zinc-700 pb-2">Environment</h3>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Sky Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={assetSettings.skyColor}
                    onChange={(e) => handleAssetChange('skyColor', e.target.value)}
                    className="w-10 h-10 rounded mr-2 cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={assetSettings.skyColor}
                    onChange={(e) => handleAssetChange('skyColor', e.target.value)}
                    className="bg-zinc-900 px-2 py-1 rounded w-20 text-xs font-mono"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">Ground Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={assetSettings.groundColor}
                    onChange={(e) => handleAssetChange('groundColor', e.target.value)}
                    className="w-10 h-10 rounded mr-2 cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={assetSettings.groundColor}
                    onChange={(e) => handleAssetChange('groundColor', e.target.value)}
                    className="bg-zinc-900 px-2 py-1 rounded w-20 text-xs font-mono"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1">
                  World Size: {assetSettings.worldSize}
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={assetSettings.worldSize}
                  onChange={(e) => handleAssetChange('worldSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="mt-4 bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3 border-b border-zinc-700 pb-2">Features</h3>
            
            <div className="flex flex-wrap gap-3 mb-3">
              <label className="inline-flex items-center bg-zinc-900 p-2 rounded">
                <input
                  type="checkbox"
                  checked={assetSettings.hasTrees}
                  onChange={(e) => handleAssetChange('hasTrees', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Trees</span>
              </label>
              
              <label className="inline-flex items-center bg-zinc-900 p-2 rounded">
                <input
                  type="checkbox"
                  checked={assetSettings.hasWater}
                  onChange={(e) => handleAssetChange('hasWater', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Water</span>
              </label>
              
              <label className="inline-flex items-center bg-zinc-900 p-2 rounded">
                <input
                  type="checkbox"
                  checked={assetSettings.hasMountains}
                  onChange={(e) => handleAssetChange('hasMountains', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Mountains</span>
              </label>
            </div>
            
            <h4 className="text-sm font-medium mb-2 mt-4">Special Features</h4>
            <div className="flex flex-wrap gap-3">
              {specialFeatureOptions.map(feature => (
                <label 
                  key={feature.id}
                  className={`inline-flex items-center p-2 rounded cursor-pointer ${
                    assetSettings.specialFeatures.includes(feature.id)
                      ? 'bg-indigo-600 border-indigo-500'
                      : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={assetSettings.specialFeatures.includes(feature.id)}
                    onChange={() => handleSpecialFeatureToggle(feature.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{feature.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}