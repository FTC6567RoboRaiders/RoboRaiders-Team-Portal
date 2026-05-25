import React from 'react';

interface RoboraidersLogoProps {
  className?: string;
}

export default function RoboraidersLogo({ className = "w-10 h-10" }: RoboraidersLogoProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} select-none shrink-0`}
      id="roboraiders-logo-badge"
    >
      <defs>
        {/* Top Text Path (Left to Right along the outer perimeter) */}
        <path id="logo-top-path" d="M 24 100 A 76 76 0 0 1 176 100" fill="none" />
        
        {/* Bottom Text Path (Right to Left along the lower perimeter to keep text upright and readable) */}
        <path id="logo-bottom-path" d="M 176 100 A 76 76 0 0 1 24 100" fill="none" />
      </defs>

      {/* Ring Backing */}
      <circle cx="100" cy="100" r="94" fill="#52525b" stroke="#3f3f46" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="80" fill="#18181b" stroke="#27272a" strokeWidth="2" />
      
      {/* Curved Text: ROBORAIDERS 6567 */}
      <text fill="#ffffff" fontSize="12" fontWeight="900" fontFamily='"Space Grotesk", "Inter", sans-serif' letterSpacing="2.5" dy="-3">
        <textPath href="#logo-top-path" startOffset="50%" textAnchor="middle">
          ROBORAIDERS 6567
        </textPath>
      </text>

      {/* Curved Text: FIRST TECH CHALLENGE */}
      <text fill="#a1a1aa" fontSize="7.8" fontWeight="800" fontFamily='"Space Grotesk", "Inter", sans-serif' letterSpacing="2" dy="9">
        <textPath href="#logo-bottom-path" startOffset="50%" textAnchor="middle">
          FIRST TECH CHALLENGE
        </textPath>
      </text>

      {/* Icon markers on the left/right of the ring */}
      <g transform="translate(19, 100)">
        <polygon points="-3,0 0,-3 3,0 0,3" fill="#ef4444" />
      </g>
      <g transform="translate(181, 100)">
        <polygon points="-3,0 0,-3 3,0 0,3" fill="#ef4444" />
      </g>

      {/* Inner graphic circle */}
      <circle cx="100" cy="100" r="59" fill="#2d2d30" stroke="#3f3f46" strokeWidth="1.5" />
      
      {/* Stylized Knight Logo Graphic */}
      <g id="knight-helm-and-plume">
        {/* Big sweeping red plume behind the helm */}
        <path 
          d="M 100,56 C 70,55 46,75 42,98 C 40,110 45,124 55,132 C 48,118 51,104 62,94 C 74,84 92,80 110,88 C 104,78 95,72 84,70 C 72,68 64,74 58,80 C 65,68 78,61 95,61 C 108,61 122,68 128,78 C 132,84 133,92 128,95 C 133,90 134,80 128,72 C 122,62 112,57 100,56 Z" 
          fill="#ef4444" 
        />
        
        {/* Additional dynamic plume tail curves */}
        <path 
          d="M 50,110 C 45,125 50,140 62,148 C 55,138 53,124 60,114 C 67,104 78,100 90,102 C 80,95 70,95 62,100 C 54,105 50,102 50,110 Z" 
          fill="#dc2626" 
        />
        
        <path 
          d="M 115,85 C 110,95 100,105 100,118 C 100,132 110,144 125,148 C 135,150 142,143 145,135 C 135,142 122,142 115,132 C 108,122 108,110 115,100 Q 118,92 115,85 Z" 
          fill="#b91c1c" 
        />

        {/* Knight Helmet - Shadow backing */}
        <path 
          d="M 115,82 C 124,78 138,82 144,92 C 148,98 148,110 142,120 C 136,128 122,135 110,128 C 104,122 104,112 108,102 C 112,92 110,85 115,82 Z" 
          fill="#18181b" 
        />

        {/* Knight Helmet - Main Grey/Silver Structure */}
        <path 
          d="M 118,84 C 126,80 137,84 142,94 C 146,101 146,111 141,118 C 135,125 123,131 112,125 C 107,119 107,110 110,101 C 113,92 113,87 118,84 Z" 
          fill="#a1a1aa" 
          stroke="#52525b"
          strokeWidth="1"
        />

        {/* Helmet Highlights */}
        <path 
          d="M 120,86 C 125,83 132,85 136,92 C 138,96 138,102 136,106" 
          fill="none" 
          stroke="#f4f4f5" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />

        {/* Visor Area Shadow (Dark charcoal) */}
        <path 
          d="M 120,95 C 124,94 130,95 133,99 C 135,103 133,108 128,110 C 124,111 122,108 119,103 Z" 
          fill="#27272a" 
        />

        {/* Grille/Vent Slits on Helmet Faceplate */}
        <line x1="124" y1="104" x2="124" y2="114" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="128" y1="105" x2="128" y2="115" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="132" y1="106" x2="132" y2="114" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="136" y1="108" x2="136" y2="112" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Glowing Red Knight Eye */}
        <path 
          d="M 121,97 Q 126,96 128,100" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <circle cx="127" cy="99" r="1" fill="#fca5a5" />
      </g>
    </svg>
  );
}
