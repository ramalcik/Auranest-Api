import React from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityNoticeProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  showIcon?: boolean;
}

const SecurityNotice: React.FC<SecurityNoticeProps> = ({ 
  type = 'info', 
  title, 
  message, 
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className={`border rounded-xl p-4 ${getStyles()}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
        )}
        <div>
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice; 