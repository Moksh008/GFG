import React from 'react';

interface SkinSurfaceProps {
  variant?: 'hero' | 'ridge' | 'valley' | 'subtle';
  className?: string;
  accentGlow?: boolean;
}

export const SkinSurface: React.FC<SkinSurfaceProps> = ({
  variant = 'hero',
  className = '',
  accentGlow = true,
}) => {
  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Soft Beige & Pale Peach Dermal Gradient (No heavy dark brown!) */}
          <linearGradient id="delicateSkinGrad" x1="0%" y1="0%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#FFF9F5" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#FAF1E8" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#F5E8DC" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#EFE0D2" stopOpacity="0.5" />
          </linearGradient>

          {/* Underlayer Soft Diffuse Blend into Soft Ivory background */}
          <linearGradient id="softUnderlayerGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F5E6D8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#FAF8F4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FAF8F4" stopOpacity="0" />
          </linearGradient>

          {/* Elegant White Crest Boundary Highlight */}
          <linearGradient id="waveBoundaryHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>

          {/* Diffuse cellular glow filter */}
          <filter id="waveSoftBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {variant === 'hero' ? (
          /* Low-profile elegant organic wave for hero */
          <g id="hero-delicate-wave">
            {/* Background secondary wave for gentle depth */}
            <path
              d="M0 60 C340 35, 640 25, 960 48 C1180 62, 1340 45, 1440 35 L1440 120 L0 120 Z"
              fill="url(#softUnderlayerGrad)"
            />

            {/* Main foreground thin wave */}
            <path
              d="M0 45
                 C260 58, 520 68, 760 52
                 C1000 36, 1240 50, 1440 28
                 L1440 120 L0 120 Z"
              fill="url(#delicateSkinGrad)"
            />

            {/* Very subtle white highlight along wave boundary */}
            <path
              d="M0 45
                 C260 58, 520 68, 760 52
                 C1000 36, 1240 50, 1440 28"
              stroke="url(#waveBoundaryHighlight)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* Subtle soft subsurface radiance */}
            {accentGlow && (
              <ellipse
                cx="820"
                cy="56"
                rx="240"
                ry="18"
                fill="#FFF8F2"
                opacity="0.65"
                filter="url(#waveSoftBlur)"
              />
            )}
          </g>
        ) : (
          /* Subtle undulating low-profile ridge wave */
          <g id="ridge-delicate-wave">
            <path
              d="M0 50 C360 30, 720 60, 1080 35 C1280 20, 1380 40, 1440 32 L1440 120 L0 120 Z"
              fill="url(#softUnderlayerGrad)"
            />

            <path
              d="M0 42
                 C320 22, 680 50, 1020 30
                 C1220 18, 1360 38, 1440 30
                 L1440 120 L0 120 Z"
              fill="url(#delicateSkinGrad)"
            />

            {/* Thin White Boundary Highlight */}
            <path
              d="M0 42
                 C320 22, 680 50, 1020 30
                 C1220 18, 1360 38, 1440 30"
              stroke="url(#waveBoundaryHighlight)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
