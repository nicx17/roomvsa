import React, { useState } from 'react';
import { Palette, Maximize2, Box, Plus, Settings, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';
import type { FurnitureItem, ItemType } from '../types';
import { configSchema } from '../schema';
import { useRoomStore } from '../store';


export default function ControlPanel() {
  const dimensions = useRoomStore((state) => state.dimensions);
  const setDimensions = useRoomStore((state) => state.setDimensions);
  const theme = useRoomStore((state) => state.theme);
  const setTheme = useRoomStore((state) => state.setTheme);
  const wallColor = useRoomStore((state) => state.wallColor);
  const setWallColor = useRoomStore((state) => state.setWallColor);
  const floorColor = useRoomStore((state) => state.floorColor);
  const setFloorColor = useRoomStore((state) => state.setFloorColor);
  const lightColor = useRoomStore((state) => state.lightColor);
  const setLightColor = useRoomStore((state) => state.setLightColor);
  const envLightIntensity = useRoomStore((state) => state.envLightIntensity);
  const setEnvLightIntensity = useRoomStore((state) => state.setEnvLightIntensity);
  const ceilingLightIntensity = useRoomStore((state) => state.ceilingLightIntensity);
  const setCeilingLightIntensity = useRoomStore((state) => state.setCeilingLightIntensity);
  const windowTint = useRoomStore((state) => state.windowTint);
  const setWindowTint = useRoomStore((state) => state.setWindowTint);
  const windowOpacity = useRoomStore((state) => state.windowOpacity);
  const setWindowOpacity = useRoomStore((state) => state.setWindowOpacity);
  const items = useRoomStore((state) => state.items);
  const setItems = useRoomStore((state) => state.setItems);
  const selectedId = useRoomStore((state) => state.selectedId);
  const updateItem = useRoomStore((state) => state.updateItem);
  const addItem = useRoomStore((state) => state.addItem);
  const removeItem = useRoomStore((state) => state.removeItem);
  const loadConfig = useRoomStore((state) => state.loadConfig);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    setDimensions((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }));
  };

  const handleSaveConfig = () => {
    const config = {
      dimensions,
      theme,
      wallColor,
      floorColor,
      lightColor,
      envLightIntensity,
      ceilingLightIntensity,
      windowTint,
      windowOpacity,
      items,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'room_config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = configSchema.safeParse(parsed);
        if (!result.success) {
          alert('Security Alert: The uploaded config file is invalid or corrupted.');
          return;
        }
        
        loadConfig(result.data);
      } catch (err) {
        alert('Invalid config file format');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again if needed
    e.target.value = '';
  };

  const selectedItem = items.find((i) => i.id === selectedId);

  const themes = [
    { id: 'warm', name: 'Warm & Earthy', colors: ['#e6c287', '#cc7752'] },
    { id: 'crisp', name: 'Crisp Modern', colors: ['#f1f5f9', '#1e3a8a'] },
    { id: 'natural', name: 'Natural Oasis', colors: ['#b4c5b0', '#a3a3a3'] },
    { id: 'jewel', name: 'Jewel Tones', colors: ['#064e3b', '#a21caf'] },
    { id: 'sunset', name: 'Sunset Vibes', colors: ['#fecdd3', '#c084fc'] },
  ];

  const themeBtnStyle = (t: string, colorObj: string[]) => ({
    padding: '0.75rem',
    borderRadius: '8px',
    border: theme === t ? `2px solid ${colorObj[1]}` : '1px solid transparent',
    background: '#ffffff',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontWeight: theme === t ? '600' : '400',
    transition: 'all 0.2s ease',
    boxShadow: theme === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  return (
    <div className="glass-panel text-sm" style={{ color: '#1e293b' }}>
      <div
        className="mb-6 flex"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            gap: '0.5rem',
            alignItems: 'center',
            display: 'flex',
            margin: 0,
          }}
        >
          <Palette width={24} height={24} />
          Room VSA
        </h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          {isCollapsed ? <ChevronDown width={20} height={20} /> : <ChevronUp width={20} height={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={handleSaveConfig}
          className="modern-btn-primary" style={{ flex: 1 }}
        >
          <Download width={16} height={16} />
          Save Config
        </button>
        <label
          className="modern-btn-success" style={{ flex: 1 }}
        >
          <Upload width={16} height={16} />
          Load Config
          <input
            type="file"
            accept=".json"
            onChange={handleLoadConfig}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2
            className="modern-section-title"
          >
            <Maximize2 width={20} height={20} />
            Room Dimensions (m)
          </h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div>
              <label
                className="control-label"
              >
                Width: {dimensions.width}m
              </label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange(e, 'width')}
                className="modern-slider"
              />
            </div>
            <div>
              <label
                className="control-label"
              >
                Length: {dimensions.length}m
              </label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={dimensions.length}
                onChange={(e) => handleDimensionChange(e, 'length')}
                className="modern-slider"
              />
            </div>
            <div>
              <label
                className="control-label"
              >
                Height: {dimensions.height}m
              </label>
              <input
                type="range"
                min="2"
                max="5"
                step="0.1"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange(e, 'height')}
                className="modern-slider"
              />
            </div>
          </div>
        </section>

        <section>
          <h2
            className="modern-section-title"
          >
            <Box width={20} height={20} />
            Add Furniture
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            {[
              'wardrobe',
              'table',
              'pot',
              'poster',
              'bed',
              'door',
              'ac',
              'window',
              'tv',
              'tubelight',
              'chair',
            ].map((type) => (
              <button
                key={type}
                onClick={() => addItem(type as ItemType)}
                className="modern-btn-secondary"
              >
                <Plus width={16} height={16} />
                <span style={{ textTransform: 'capitalize' }}>{type}</span>
              </button>
            ))}
          </div>
        </section>

        {selectedItem && (
          <section
            className="modern-panel"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  textTransform: 'capitalize',
                }}
              >
                <Settings width={18} height={18} />
                {selectedItem.type}
              </h2>
              <button
                onClick={() => removeItem(selectedItem.id)}
                className="modern-btn-danger"
              >
                Delete
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="control-label">
                    Wood Grain
                  </label>
                  <select
                    value={selectedItem.woodType || 'oak'}
                    onChange={(e) => updateItem(selectedItem.id, { woodType: e.target.value })}
                    className="modern-select"
                  >
                    <button type="button"><selectedcontent></selectedcontent></button>
                    <option value="oak">Light Oak</option>
                    <option value="walnut">Dark Walnut</option>
                    <option value="white">White Painted</option>
                  </select>
                </div>
                <div>
                  <label className="control-label">
                    Object Color (Tint)
                  </label>
                  <input
                    type="color"
                    value={selectedItem.color || '#ffffff'}
                    onChange={(e) => updateItem(selectedItem.id, { color: e.target.value })}
                    className="modern-color-picker"
                  />
                </div>
              </div>


              {selectedItem.type === 'bed' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '-0.25rem' }}>
                  <div>
                    <label className="control-label">
                      Blanket Color
                    </label>
                    <input
                      type="color"
                      value={selectedItem.secondaryColor || '#a0522d'}
                      onChange={(e) => updateItem(selectedItem.id, { secondaryColor: e.target.value })}
                      className="modern-color-picker"
                    />
                  </div>
                  <div>
                    <label className="control-label">
                      Pillow Color
                    </label>
                    <input
                      type="color"
                      value={selectedItem.tertiaryColor || '#f8fafc'}
                      onChange={(e) => updateItem(selectedItem.id, { tertiaryColor: e.target.value })}
                      className="modern-color-picker"
                    />
                  </div>
                </div>
              )}

              {selectedItem.type === 'door' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.25rem' }}>
                  <input
                    type="checkbox"
                    id="flipDoor"
                    checked={selectedItem.flipX || false}
                    onChange={(e) => updateItem(selectedItem.id, { flipX: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="flipDoor" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                    Flip Hinge Side
                  </label>
                </div>
              )}

              {(selectedItem.type === 'tubelight' || selectedItem.type === 'table') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.25rem' }}>
                  <input
                    type="checkbox"
                    id="toggleLight"
                    checked={selectedItem.isOn !== false}
                    onChange={(e) => updateItem(selectedItem.id, { isOn: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="toggleLight" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                    Light Enabled
                  </label>
                </div>
              )}


              {selectedItem.type !== 'window' && (
                <>
                  <div>
                    <label
                      className="control-label"
                    >
                      Width: {selectedItem.size[0].toFixed(2)}m
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="4"
                      step="0.05"
                      value={selectedItem.size[0]}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          size: [
                            parseFloat(e.target.value),
                            selectedItem.size[1],
                            selectedItem.size[2],
                          ],
                        })
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label
                      className="control-label"
                    >
                      Height: {selectedItem.size[1].toFixed(2)}m
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="4"
                      step="0.05"
                      value={selectedItem.size[1]}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          size: [
                            selectedItem.size[0],
                            parseFloat(e.target.value),
                            selectedItem.size[2],
                          ],
                        })
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label
                      className="control-label"
                    >
                      Depth/Length: {selectedItem.size[2].toFixed(2)}m
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="4"
                      step="0.05"
                      value={selectedItem.size[2]}
                      onChange={(e) =>
                        updateItem(selectedItem.id, {
                          size: [
                            selectedItem.size[0],
                            selectedItem.size[1],
                            parseFloat(e.target.value),
                          ],
                        })
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                </>
              )}
              <div
                style={{
                  marginTop: '0.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem',
                  }}
                >
                  <label
                    className="control-label"
                  >
                    Rotation:{' '}
                    {(selectedItem.rotation[1] * (180 / Math.PI)).toFixed(0)}°
                  </label>
                  <button
                    onClick={() =>
                      updateItem(selectedItem.id, {
                        rotation: [
                          selectedItem.rotation[0],
                          selectedItem.rotation[1] + Math.PI / 2,
                          selectedItem.rotation[2],
                        ],
                      })
                    }
                    style={{
                      padding: '0.15rem 0.4rem',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      background: '#e2e8f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    +90°
                  </button>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={selectedItem.rotation[1] * (180 / Math.PI)}
                  onChange={(e) =>
                    updateItem(selectedItem.id, {
                      rotation: [
                        selectedItem.rotation[0],
                        parseFloat(e.target.value) * (Math.PI / 180),
                        selectedItem.rotation[2],
                      ],
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </section>
        )}

        <section>
          <h2
            className="modern-section-title"
          >
            Color Palette
          </h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={themeBtnStyle(t.id, t.colors)}
              >
                <span>{t.name}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: t.colors[0],
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title="Wardrobe color"
                  />
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: t.colors[1],
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title="Pot color"
                  />
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                marginBottom: '0.5rem',
              }}
            >
              Colors
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Wall
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    type="color"
                    value={wallColor}
                    onChange={(e) => setWallColor(e.target.value)}
                    className="modern-color-picker"
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                    }}
                  >
                    {wallColor}
                  </span>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  Floor Color
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    type="color"
                    value={floorColor}
                    onChange={(e) => setFloorColor(e.target.value)}
                    className="modern-color-picker"
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                    }}
                  >
                    {floorColor}
                  </span>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Light
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="modern-color-picker"
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                    }}
                  >
                    {lightColor}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  className="control-label">
                  Environment Light
                </label>
                <input
                  type="range"
                min="0"
                max="2"
                step="0.1"
                value={envLightIntensity}
                onChange={(e) =>
                    setEnvLightIntensity(parseFloat(e.target.value))
                  }
                className="modern-slider"
                />
              </div>
              <span
                style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(envLightIntensity * 100)}%
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  className="control-label">
                  Ceiling Light
                </label>
                <input
                  type="range"
                min="0"
                max="5"
                step="0.1"
                value={ceilingLightIntensity}
                onChange={(e) =>
                    setCeilingLightIntensity(parseFloat(e.target.value))
                  }
                className="modern-slider"
                />
              </div>
              <span
                style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round((ceilingLightIntensity / 5) * 100)}%
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  className="control-label">
                  Window Tint Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={windowTint}
                    onChange={(e) => setWindowTint(e.target.value)}
                    className="modern-color-picker"
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  className="control-label">
                  Window Transparency
                </label>
                <input
                  type="range"
                min="0"
                max="1"
                step="0.05"
                value={1 - windowOpacity}
                onChange={(e) =>
                    setWindowOpacity(1 - parseFloat(e.target.value))
                  }
                className="modern-slider"
                />
              </div>
              <span
                style={{
                  minWidth: '40px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round((1 - windowOpacity) * 100)}%
              </span>
            </div>
          </div>
        </section>
      </div>
      </>
      )}
    </div>
  );
}
