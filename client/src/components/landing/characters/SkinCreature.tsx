import React from 'react';
import { SkinCellCreature } from './SkinCellCreature';
import type { CreatureSize } from './SkinCellCreature';

export type CreatureVariant = 'tiny' | 'small' | 'medium' | 'large' | 'boss';

interface SkinCreatureProps {
  className?: string;
  variant?: CreatureVariant;
  size?: number;
  glow?: boolean;
  agitated?: boolean;
  showExclamation?: boolean;
  concerned?: boolean;
}

export const SkinCreature: React.FC<SkinCreatureProps> = ({
  className = '',
  variant = 'small',
  size,
  showExclamation = false,
  concerned = false,
  agitated = false,
}) => {
  // Map variant to canonical size
  const sizeMap: Record<CreatureVariant, CreatureSize> = {
    tiny: 'small',
    small: 'small',
    medium: 'medium',
    large: 'large',
    boss: 'large',
  };

  const creatureSize: CreatureSize = sizeMap[variant] || 'small';

  return (
    <SkinCellCreature
      className={className}
      size={size || creatureSize}
      concerned={concerned || agitated}
      mischievous={variant === 'medium'}
      showExclamation={showExclamation}
    />
  );
};

export default SkinCreature;
