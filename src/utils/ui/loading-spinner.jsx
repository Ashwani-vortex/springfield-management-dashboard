import React, { useState, useEffect } from 'react';

export const LoadingSpinner = ({ 
  type = 'pulse', 
  size = 'medium', 
  color = '#3b82f6',
  text = 'Loading',
  fullScreen = false 
}) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(timer);
  }, []);
  
  // Inline styles for different sizes
  const sizeStyles = {
    small: { width: '32px', height: '32px' },
    medium: { width: '64px', height: '64px' },
    large: { width: '96px', height: '96px' }
  };
  
  // Container style
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...(fullScreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 50
    } : {
      padding: '2rem',
      minHeight: '300px'
    })
  };
  
  // Text style
  const textStyle = {
    marginTop: '1rem',
    fontWeight: 500,
    color: color
  };
  
  // Animation keyframes as inline styles
  const animationStyles = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.7; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.7; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    
    @keyframes flip {
      0% { transform: perspective(200px) rotateY(0deg); }
      50% { transform: perspective(200px) rotateY(180deg); }
      100% { transform: perspective(200px) rotateY(360deg); }
    }
    
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes ping {
      0% { transform: scale(1); opacity: 1; }
      75%, 100% { transform: scale(2); opacity: 0; }
    }
  `;
  
  const renderSpinner = () => {
    switch(type) {
      case 'pulse':
        return (
          <div style={{
            ...sizeStyles[size],
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.7,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{
              width: '75%',
              height: '75%',
              margin: '12.5%',
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.5,
              animation: 'ping 1.5s ease-in-out infinite'
            }}></div>
          </div>
        );
        
      case 'bounce':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map(i => (
              <div 
                key={i}
                style={{
                  ...sizeStyles[size],
                  width: size === 'large' ? '32px' : size === 'medium' ? '24px' : '16px',
                  height: size === 'large' ? '32px' : size === 'medium' ? '24px' : '16px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  animation: `bounce 0.8s infinite`,
                  animationDelay: `${i * 0.16}s`
                }}
              ></div>
            ))}
          </div>
        );
        
      case 'flip':
        return (
          <div style={{
            ...sizeStyles[size],
            animation: 'flip 1.2s infinite',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              border: `4px solid ${color}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1.2s linear infinite'
            }}></div>
          </div>
        );
        
      case 'progress':
        return (
          <div style={{ width: '192px', maxWidth: '100%' }}>
            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '30%',
                backgroundColor: color,
                animation: 'progress 1.5s ease-in-out infinite',
                backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`,
                backgroundSize: '16px 16px'
              }}></div>
            </div>
          </div>
        );
        
      default: // Default spinner
        return (
          <div style={{
            ...sizeStyles[size],
            border: `4px dashed ${color}`,
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite'
          }}></div>
        );
    }
  };
  
  return (
    <>
      <style>{animationStyles}</style>
      <div style={containerStyle}>
        {renderSpinner()}
        <p style={textStyle}>
          {text}{dots}
        </p>
      </div>
    </>
  );
};

 