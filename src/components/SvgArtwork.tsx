import React, { useId } from 'react';

interface ImageFlagProps {
  className?: string;
}

export const OfficialSamasthaFlagImg: React.FC<ImageFlagProps> = ({
  className = 'w-full max-w-[240px] mx-auto',
}) => (
  <img
    src="./assets/official/flag_111154.jpg"
    alt="സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ (SKJU) ഔദ്യോഗിക പതാക"
    className={`object-contain rounded-lg ${className}`}
    referrerPolicy="no-referrer"
  />
);

export const OfficialSkssfFlagImg: React.FC<ImageFlagProps> = ({
  className = 'w-full max-w-[240px] mx-auto',
}) => (
  <img
    src="./assets/official/flag_111138.jpg"
    alt="SKSSF ഔദ്യോഗിക പതാക"
    className={`object-contain rounded-lg ${className}`}
    referrerPolicy="no-referrer"
  />
);

export const OfficialSksbvFlagImg: React.FC<ImageFlagProps> = ({
  className = 'w-full max-w-[240px] mx-auto',
}) => (
  <img
    src="./assets/official/flag_111134.jpg"
    alt="SKSBV ഔദ്യോഗിക പതാക"
    className={`object-contain rounded-lg ${className}`}
    referrerPolicy="no-referrer"
  />
);

export const OfficialSkimvbLogoImg: React.FC<ImageFlagProps> = ({
  className = 'w-28 h-28 mx-auto',
}) => (
  <img
    src="./assets/aistudio/image_e03981e1.png"
    alt="SKIMVB ഔദ്യോഗിക ലോഗോ"
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);

/* Exact Authentic Vector Flag Builder SVG (Matches real SKJU / SKSSF / SKSBV flags) */
export type FlagSlotId = 'canton' | 'mosque' | 'green';

interface AuthenticVectorFlagProps {
  variant: 'skju' | 'skssf' | 'sksbv';
  hasCanton?: boolean;
  hasMosqueField?: boolean;
  hasGreenStrip?: boolean;
  animated?: boolean;
  className?: string;
  selectedPiece?: FlagSlotId | null;
  onSlotClick?: (slot: FlagSlotId) => void;
  onSlotDrop?: (slot: FlagSlotId) => void;
}

export const AuthenticFlagCanvas: React.FC<AuthenticVectorFlagProps> = ({
  variant,
  hasCanton = true,
  hasMosqueField = true,
  hasGreenStrip = true,
  animated = true,
  className = 'w-full max-w-md mx-auto',
  selectedPiece = null,
  onSlotClick,
  onSlotDrop,
}) => {
  const uid = useId();
  const maskId = `crescent-mask-${variant}-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const cantonColor = variant === 'skju' ? '#8C1D40' : '#0EA5E9';
  const mosqueStroke = variant === 'skju' ? '#1E3A8A' : '#0F172A';
  const bottomText =
    variant === 'skssf' ? 'S K S S F' : variant === 'sksbv' ? 'S K S B V' : '';

  const isInteractive = Boolean(onSlotClick || onSlotDrop);

  const handleZoneClick = (slot: FlagSlotId, e: React.MouseEvent) => {
    if (!onSlotClick) return;
    e.stopPropagation();
    onSlotClick(slot);
  };

  const handleZoneDrop = (slot: FlagSlotId, e: React.DragEvent) => {
    if (!onSlotDrop) return;
    e.preventDefault();
    e.stopPropagation();
    onSlotDrop(slot);
  };

  return (
    <svg
      viewBox="0 0 360 220"
      className={`${className} ${animated ? 'flag-wave' : ''} ${
        isInteractive ? 'select-none' : ''
      }`}
      role="img"
      aria-label={`${variant.toUpperCase()} പതാക ക്യാൻവാസ്`}
    >
      {/* Flag Pole */}
      <rect x="12" y="10" width="7" height="202" rx="3.5" fill="#78350F" />
      <circle cx="15.5" cy="10" r="5.5" fill="#D97706" />

      <g transform="translate(19, 18)">
        {/* Base dashed blueprint slots when empty */}
        <rect
          x="0"
          y="0"
          width="320"
          height="182"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />

        {/* Right White Field + Mosque Dome & Left Minaret */}
        {hasMosqueField ? (
          <g>
            <rect
              x="118"
              y="0"
              width="202"
              height="126"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <g
              transform="translate(166, 20)"
              fill="none"
              stroke={mosqueStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Left Tall Minaret (exact match to official Samastha/SKSSF flag) */}
              <rect x="6" y="18" width="9" height="72" fill="#FFFFFF" />
              <line x1="6" y1="34" x2="15" y2="34" />
              <line x1="6" y1="50" x2="15" y2="50" />
              <line x1="6" y1="66" x2="15" y2="66" />
              <path d="M 5,18 C 5,10 16,10 16,18 Z" fill={mosqueStroke} />
              <line x1="10.5" y1="5" x2="10.5" y2="11" />
              {/* Ribbed Onion Mosque Dome */}
              <path d="M 20,76 C 22,42 52,32 58,20 C 64,32 94,42 96,76 Z" fill="#FFFFFF" />
              <path d="M 58,20 C 48,40 46,56 46,76" />
              <path d="M 58,20 C 68,40 70,56 70,76" />
              <path d="M 58,20 L 58,76" />
              <path d="M 32,48 Q 58,54 84,48" />
              <path d="M 24,62 Q 58,68 92,62" />
              {/* Crescent atop Dome */}
              <path d="M 58,9 L 58,20" />
              <path d="M 55,6 A 5,5 0 1,0 61,6 A 3.8,3.8 0 1,1 55,6 Z" fill={mosqueStroke} />
              {/* Base */}
              <path d="M 16,76 L 98,76 L 102,90 L 12,90 Z" fill="#FFFFFF" />
              <line x1="22" y1="84" x2="94" y2="84" />
            </g>
          </g>
        ) : (
          <g
            onClick={(e) => handleZoneClick('mosque', e)}
            onDragOver={(e) => {
              if (onSlotDrop) e.preventDefault();
            }}
            onDrop={(e) => handleZoneDrop('mosque', e)}
            className={isInteractive ? 'cursor-pointer' : undefined}
          >
            <rect
              x="119"
              y="1"
              width="200"
              height="124"
              fill={
                selectedPiece === 'mosque'
                  ? '#FEF3C7'
                  : selectedPiece
                  ? '#F1F5F9'
                  : '#F8FAFC'
              }
              stroke={selectedPiece === 'mosque' ? '#D97706' : '#CBD5E1'}
              strokeWidth={selectedPiece === 'mosque' ? '2.5' : '1.2'}
              strokeDasharray="5 4"
            />
            <text
              x="219"
              y="60"
              textAnchor="middle"
              fontSize="12"
              fontWeight="800"
              fill={selectedPiece === 'mosque' ? '#B45309' : '#475569'}
            >
              + മസ്ജിദ് &amp; വെള്ള ഭാഗം
            </text>
            {isInteractive && (
              <text
                x="219"
                y="79"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill={selectedPiece === 'mosque' ? '#92400E' : '#64748B'}
              >
                {selectedPiece === 'mosque'
                  ? 'ഇവിടെ തൊടുക — ഉറപ്പിക്കാം'
                  : 'തൊട്ട് ഘടിപ്പിക്കുക'}
              </text>
            )}
          </g>
        )}

        {/* Top-Left Canton (Maroon for SKJU, Sky Blue for SKSSF/SKSBV) */}
        {hasCanton ? (
          <g>
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="-32" y="-32" width="64" height="64">
                <rect x="-40" y="-40" width="80" height="80" fill="black" />
                <circle cx="0" cy="0" r="28" fill="white" />
                <circle cx="-10" cy="-9" r="22" fill="black" />
              </mask>
            </defs>
            <rect x="0" y="0" width="118" height="126" fill={cantonColor} />
            <g transform="translate(61, 65)">
              {/* Bold Crescent Moon opening toward upper-left with bright yellow-gold edge & crisp white fill */}
              <circle
                cx="0"
                cy="0"
                r="28"
                fill="#FFFFFF"
                mask={`url(#${maskId})`}
              />
              <circle
                cx="0"
                cy="0"
                r="28"
                fill="none"
                stroke="#FDE047"
                strokeWidth="1.2"
                mask={`url(#${maskId})`}
              />
              {/* 5-Pointed Star nestled cleanly inside the crescent */}
              <polygon
                points="-11,-21 -8,-13 0,-13 -6,-8 -4,0 -11,-5 -18,0 -16,-8 -22,-13 -14,-13"
                fill="#FFFFFF"
                stroke="#FDE047"
                strokeWidth="0.9"
              />
            </g>
          </g>
        ) : (
          <g
            onClick={(e) => handleZoneClick('canton', e)}
            onDragOver={(e) => {
              if (onSlotDrop) e.preventDefault();
            }}
            onDrop={(e) => handleZoneDrop('canton', e)}
            className={isInteractive ? 'cursor-pointer' : undefined}
          >
            <rect
              x="1"
              y="1"
              width="116"
              height="124"
              fill={
                selectedPiece === 'canton'
                  ? '#FEF3C7'
                  : selectedPiece
                  ? '#F1F5F9'
                  : '#F8FAFC'
              }
              stroke={selectedPiece === 'canton' ? '#D97706' : '#CBD5E1'}
              strokeWidth={selectedPiece === 'canton' ? '2.5' : '1.2'}
              strokeDasharray="5 4"
            />
            <text
              x="59"
              y="59"
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={selectedPiece === 'canton' ? '#B45309' : '#475569'}
            >
              + ചന്ദ്രക്കല
            </text>
            <text
              x="59"
              y="76"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill={selectedPiece === 'canton' ? '#92400E' : '#64748B'}
            >
              {selectedPiece === 'canton' ? 'ഇവിടെ തൊടുക' : 'തൊട്ട് വെക്കുക'}
            </text>
          </g>
        )}

        {/* Bottom Green Strip */}
        {hasGreenStrip ? (
          <g>
            <rect x="0" y="126" width="320" height="56" fill="#16A34A" />
            {bottomText && (
              <text
                x="160"
                y="165"
                textAnchor="middle"
                fontSize="30"
                fontWeight="900"
                fill="#FFFFFF"
                letterSpacing="5"
                fontFamily="Georgia, serif"
              >
                {bottomText}
              </text>
            )}
          </g>
        ) : (
          <g
            onClick={(e) => handleZoneClick('green', e)}
            onDragOver={(e) => {
              if (onSlotDrop) e.preventDefault();
            }}
            onDrop={(e) => handleZoneDrop('green', e)}
            className={isInteractive ? 'cursor-pointer' : undefined}
          >
            <rect
              x="1"
              y="127"
              width="318"
              height="54"
              fill={
                selectedPiece === 'green'
                  ? '#DCFCE7'
                  : selectedPiece
                  ? '#F1F5F9'
                  : '#F8FAFC'
              }
              stroke={selectedPiece === 'green' ? '#15803D' : '#CBD5E1'}
              strokeWidth={selectedPiece === 'green' ? '2.5' : '1.2'}
              strokeDasharray="5 4"
            />
            <text
              x="160"
              y="153"
              textAnchor="middle"
              fontSize="12"
              fontWeight="800"
              fill={selectedPiece === 'green' ? '#166534' : '#475569'}
            >
              + പച്ച വരമ്പ് {selectedPiece === 'green' ? '(ഇവിടെ തൊടുക)' : '(തൊട്ട് ഘടിപ്പിക്കുക)'}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};
