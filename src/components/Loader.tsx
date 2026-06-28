import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

export default function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  const [show, setShow] = useState(true);

  // Smooth out the disappearance so it doesn't just flash out
  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!show) return null;

  return (
    <div
      className={`loader-overlay ${!active && progress === 100 ? 'loader-fade-out' : ''}`}
    >
      <div className="loader-card">
        <Loader2 className="loader-spinner" size={48} />
        <h2 className="loader-title">Loading Room VSA</h2>

        <div className="loader-bar-container">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="loader-text">{progress.toFixed(0)}%</p>
        <p className="loader-detail">
          {item
            ? `Loading: ${item.split('/').pop()}`
            : 'Initializing Engine...'}
        </p>
      </div>
    </div>
  );
}
