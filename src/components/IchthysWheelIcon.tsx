import React from 'react';

interface IchthysWheelIconProps {
  className?: string;
  size?: number;
}

/**
 * Ichthys Wheel (The Christian Wheel of Ephesus).
 * An ancient early Christian monogram created by superimposing
 * the Greek letters Ι-Χ-Θ-Υ-Σ (Iesous Christos Theou Yios Soter:
 * Jesus Christ, Son of God, Savior) within a circle, forming an
 * eight-spoke wheel emblem used as a symbol of faith and safe haven.
 */
export const IchthysWheelIcon: React.FC<IchthysWheelIconProps> = ({
  className = 'w-5 h-5',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Ichthys Wheel (Ephesus Christian Monogram)"
    >
      {/* Outer Circle (representing Theta Θ and the wheel rim) */}
      <circle cx="12" cy="12" r="9.25" strokeWidth="1.7" />

      {/* Vertical spoke (Iota Ι) */}
      <line x1="12" y1="2.75" x2="12" y2="21.25" strokeWidth="1.7" />

      {/* Horizontal spoke (Theta Θ crossbar) */}
      <line x1="2.75" y1="12" x2="21.25" y2="12" strokeWidth="1.7" />

      {/* Diagonal spokes (Chi Χ) */}
      <line x1="5.46" y1="5.46" x2="18.54" y2="18.54" strokeWidth="1.7" />
      <line x1="18.54" y1="5.46" x2="5.46" y2="18.54" strokeWidth="1.7" />

      {/* Central hub / pivot */}
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
};
