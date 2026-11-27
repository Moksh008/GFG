import React from 'react';
import { SkinCellCreature } from './SkinCellCreature';

interface CreatureGroupProps {
  progress?: number; // 0 to 1 multiplication progress
  className?: string;
}

export const CreatureGroup: React.FC<CreatureGroupProps> = ({
  progress = 0,
  className = '',
}) => {
  // Clamp progress helper
  const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);
  const range = (v: number, start: number, end: number) => clamp((v - start) / (end - start));

  const centerScale = 1 + range(progress, 0, 0.5) * 0.45;
  const side1Visible = progress > 0.15;
  const side2Visible = progress > 0.35;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Left Flank 1 (Medium-Small, pops in at > 0.15) */}
      {side1Visible && (
        <div className="absolute -left-16 sm:-left-24 bottom-2 z-10">
          <SkinCellCreature
            size="small"
            concerned={progress > 0.6}
            delay={0.1}
          />
        </div>
      )}

      {/* Far Left Flank 2 (Tiny, pops in at > 0.35) */}
      {side2Visible && (
        <div className="absolute -left-28 sm:-left-40 bottom-8 z-10">
          <SkinCellCreature
            size={46}
            concerned={progress > 0.6}
            delay={0.2}
          />
        </div>
      )}

      {/* Center Dominant Cell */}
      <div
        className="relative z-20 transition-transform duration-300"
        style={{ transform: `scale(${centerScale})` }}
      >
        <SkinCellCreature
          size={progress > 0.5 ? 'large' : progress > 0.2 ? 'medium' : 'small'}
          concerned={progress > 0.4}
          showExclamation={progress < 0.2}
        />
      </div>

      {/* Right Flank 1 (Medium-Small, pops in at > 0.15) */}
      {side1Visible && (
        <div className="absolute -right-16 sm:-right-24 bottom-2 z-10">
          <SkinCellCreature
            size="small"
            concerned={progress > 0.6}
            delay={0.15}
          />
        </div>
      )}

      {/* Far Right Flank 2 (Tiny, pops in at > 0.35) */}
      {side2Visible && (
        <div className="absolute -right-28 sm:-right-40 bottom-8 z-10">
          <SkinCellCreature
            size={48}
            concerned={progress > 0.6}
            delay={0.25}
          />
        </div>
      )}
    </div>
  );
};

export default CreatureGroup;
