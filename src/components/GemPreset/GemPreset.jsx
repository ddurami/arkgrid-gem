import { useState } from 'react';
import './GemPreset.css';

export function GemPreset({ gems, onLoadPreset }) {
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('gemPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePreset, setActivePreset] = useState(() => {
    return localStorage.getItem('activePreset') || null;
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('프리셋 이름을 입력해주세요.');
      return;
    }

    if (gems.length === 0) {
      alert('저장할 젬이 없습니다.');
      return;
    }

    const newPreset = {
      id: Date.now(),
      name: presetName.trim(),
      gems: gems,
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('gemPresets', JSON.stringify(updatedPresets));
    setPresetName('');
  };

  const handleLoadPreset = (preset) => {
    onLoadPreset(preset.gems);
    setActivePreset(preset.id);
    localStorage.setItem('activePreset', preset.id);
  };

  const handleDeletePreset = (presetId) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem('gemPresets', JSON.stringify(updatedPresets));

    if (activePreset === presetId) {
      setActivePreset(null);
      localStorage.removeItem('activePreset');
    }
  };

  return (
    <div className="gem-preset">
      <h2 className="gem-preset__title">보유 젬 프리셋</h2>

      <div className="gem-preset__save-section">
        <input
          type="text"
          className="gem-preset__input"
          placeholder="프리셋 이름 입력"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSavePreset();
            }
          }}
        />
        <button className="gem-preset__save-btn" onClick={handleSavePreset}>
          현재 젬 저장
        </button>
      </div>

      {presets.length > 0 && (
        <div className="gem-preset__list">
          <h3 className="gem-preset__list-title">저장된 프리셋 ({presets.length}개)</h3>
          <div className="gem-preset__cards">
            {presets.map(preset => (
              <div
                key={preset.id}
                className={`gem-preset__card ${activePreset === preset.id ? 'gem-preset__card--active' : ''}`}
              >
                <div className="gem-preset__card-header">
                  <span className="gem-preset__card-name">{preset.name}</span>
                  <span className="gem-preset__card-count">{preset.gems.length}개</span>
                </div>
                <div className="gem-preset__card-actions">
                  <button
                    className="gem-preset__card-btn gem-preset__card-btn--load"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    불러오기
                  </button>
                  <button
                    className="gem-preset__card-btn gem-preset__card-btn--delete"
                    onClick={() => handleDeletePreset(preset.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

