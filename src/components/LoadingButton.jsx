import React, { useState } from 'react';
import useLoading from '../hooks/useLoading';
import { startLoading, stopLoading } from '../api/loadingService';

export default function LoadingButton({ children, className = '', onClick, disabled = false, type = 'button', asyncAction = null, loadingKey = null }) {
  const { isLoading: globalLoading } = useLoading();
  const { isLoading: keyLoading } = useLoading(loadingKey);
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = loadingKey ? keyLoading || localLoading : globalLoading || localLoading;

  const handleClick = async (e) => {
    if (asyncAction) {
      try {
        startLoading(loadingKey);
        setLocalLoading(true);
        await asyncAction(e);
      } catch (err) {
        throw err;
      } finally {
        setLocalLoading(false);
        stopLoading(loadingKey);
      }
    } else if (onClick) {
      return onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={className}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {isLoading && (
        <span style={{
          width: 16,
          height: 16,
          border: '2px solid rgba(255,255,255,0.4)',
          borderTop: '2px solid #e80120',
          borderRadius: '50%',
          marginRight: 8,
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }} />
      )}
      {children}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
