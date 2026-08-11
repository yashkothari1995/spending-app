import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[name] || Icons.MoreHorizontal;
  return <IconComponent className={className} />;
};
