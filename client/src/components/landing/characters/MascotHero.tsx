import React from 'react';
import { DermoraCellMascot } from './DermoraCellMascot';

interface MascotHeroProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const MascotHero: React.FC<MascotHeroProps> = (props) => {
  return <DermoraCellMascot {...props} />;
};

export default MascotHero;
