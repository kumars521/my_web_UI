import React from 'react';
import useLoading from '../hooks/useLoading';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000,
};

const spinnerStyle = {
  width: 64,
  height: 64,
  border: '6px solid rgba(255,255,255,0.85)',
  borderTop: '6px solid #e80120',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div style={overlayStyle} aria-hidden>
      <div style={spinnerStyle} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
