import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface AuraCoreLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const AuraCoreLogo: React.FC<AuraCoreLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  animated = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-lg',
      sparkle: 'w-2 h-2'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-2xl',
      sparkle: 'w-3 h-3'
    },
    lg: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-3xl',
      sparkle: 'w-4 h-4'
    },
    xl: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      text: 'text-4xl',
      sparkle: 'w-5 h-5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        {/* Main container with gradient background */}
        <div className={`
          ${currentSize.container} 
          rounded-2xl 
          bg-gradient-to-br from-purple-glow via-blue-glow to-purple-glow 
          flex items-center justify-center 
          relative overflow-hidden
          ${animated ? 'animate-float' : ''}
        `}>
          {/* Animated background glow */}
          <div className={`
            absolute inset-0 
            bg-gradient-to-br from-purple-glow/50 via-transparent to-blue-glow/50 
            ${animated ? 'animate-pulse-slow' : ''}
          `}></div>
          
          {/* Inner glow effect */}
          <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
          
          {/* Search icon */}
          <Search className={`${currentSize.icon} text-white relative z-10`} />
          
          {/* Floating sparkles */}
          {animated && (
            <>
              <Sparkles 
                className={`
                  ${currentSize.sparkle} 
                  text-white/80 
                  absolute -top-1 -right-1 
                  animate-pulse
                `} 
                style={{ animationDelay: '0.5s' }}
              />
              <Sparkles 
                className={`
                  ${currentSize.sparkle} 
                  text-white/60 
                  absolute -bottom-1 -left-1 
                  animate-pulse
                `} 
                style={{ animationDelay: '1.5s' }}
              />
            </>
          )}
        </div>
        
        {/* Outer glow effect */}
        {animated && (
          <div className={`
            absolute inset-0 
            ${currentSize.container} 
            rounded-2xl 
            bg-gradient-to-br from-purple-glow/30 to-blue-glow/30 
            blur-lg 
            animate-glow
            -z-10
          `}></div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`
            ${currentSize.text} 
            font-bold 
            bg-gradient-to-r from-purple-glow via-blue-glow to-purple-glow 
            bg-clip-text text-transparent
            leading-none
          `}>
            AuraCore
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-xs text-gray-400 mt-1">Discord User Discovery</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AuraCoreLogo;