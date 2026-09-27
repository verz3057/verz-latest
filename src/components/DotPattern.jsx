import React, { useId } from 'react';

const DotPattern = ({ className = '' }) => {
  const id = useId();
  const patternId = `${id}-pattern`;
  const maskId = `${id}-mask`;
  const glowId = `${id}-glow`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={patternId} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.22" fill="currentColor" />
        </pattern>
        <radialGradient id={glowId} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="45%" stopColor="white" stopOpacity="0.75" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="100" height="100" fill="black" />
          <rect width="100" height="100" fill={`url(#${glowId})`} />
        </mask>
      </defs>
      <rect width="100" height="100" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
    </svg>
  );
};

export default DotPattern;
