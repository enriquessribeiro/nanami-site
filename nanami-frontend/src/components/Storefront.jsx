export function Storefront({ className }) {
  return (
    <svg
      viewBox="0 0 560 430"
      className={className}
      role="img"
      aria-label="Ilustração da fachada da Nanami, com placa marrom, ursinho e gatinhos pastéis"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8EBDD" />
          <stop offset="1" stopColor="#EFDDC9" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4C3A30" />
          <stop offset="1" stopColor="#2F221C" />
        </linearGradient>
      </defs>

      <rect width="560" height="430" fill="url(#wall)" />
      {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="430" stroke="#E8D3BE" strokeWidth="1" opacity="0.7" />
      ))}

      <g>
        <rect x="56" y="34" width="448" height="214" rx="18" fill="#FFFDF8" stroke="#E7D3BD" strokeWidth="3" />
        <rect x="56" y="34" width="448" height="16" rx="8" fill="#FADCC4" />

        <g transform="translate(262 44) scale(0.62)" fill="none" stroke="#B89A78" strokeWidth="3.4" strokeLinejoin="round">
          <path d="M17.5 12.5c-4.7 0-7.5 3.4-7.5 7 0 2.9 1.8 4.7 3.8 5.5-1.1 2.6-1.8 5.3-1.8 7.8C12 44 20.6 52 32 52s20-8 20-19.2c0-2.5-.7-5.2-1.8-7.8 2-.8 3.8-2.6 3.8-5.5 0-3.6-2.8-7-7.5-7-2.8 0-5.3 1.1-7.2 2.9a26 26 0 0 0-14.6 0c-1.9-1.8-4.4-2.9-7.2-2.9Z" />
          <circle cx="25.5" cy="34" r="1.9" fill="#B89A78" stroke="none" />
          <circle cx="38.5" cy="34" r="1.9" fill="#B89A78" stroke="none" />
          <path d="M29.5 39h5l-2.5 3.2z" fill="#B89A78" stroke="none" />
        </g>

        <text
          x="280"
          y="164"
          textAnchor="middle"
          fill="#5B4034"
          fontFamily="Fredoka, sans-serif"
          fontSize="62"
          fontWeight="600"
          letterSpacing="9"
        >
          NANAMI
        </text>
        <text
          x="280"
          y="190"
          textAnchor="middle"
          fill="#8A6F60"
          fontFamily="Nunito, sans-serif"
          fontSize="12.5"
          fontWeight="700"
          letterSpacing="5.5"
        >
          ATACADO &amp; VAREJO
        </text>

        <g transform="translate(90 196)">
          {[
            { x: 0, fur: '#F9C9D2', ear: '#F29CB0' },
            { x: 66, fur: '#F2A054', ear: '#E2833B' },
            { x: 132, fur: '#F8D2B6', ear: '#F0B295' },
            { x: 198, fur: '#FCE6A0', ear: '#F5D274' },
            { x: 264, fur: '#C9D8F2', ear: '#AEC4E8' },
            { x: 330, fur: '#DCCBEE', ear: '#C5AFE0' },
          ].map((cat) => (
            <g key={cat.x} transform={`translate(${cat.x} 0)`}>
              <path d="M8 26 10 6l16 12Z" fill={cat.fur} stroke="#5B4034" strokeWidth="1.4" />
              <path d="M52 26 50 6 34 18Z" fill={cat.fur} stroke="#5B4034" strokeWidth="1.4" />
              <path d="M30 21c11 0 20 6.6 20 15.2C50 44 41 50 30 50S10 44 10 36.2C10 27.6 19 21 30 21Z" fill={cat.fur} stroke="#5B4034" strokeWidth="1.4" />
              <circle cx="23" cy="34" r="1.6" fill="#5B4034" />
              <circle cx="37" cy="34" r="1.6" fill="#5B4034" />
              <path d="M27 39h6l-3 3z" fill="#5B4034" />
              <ellipse cx="16" cy="40" rx="3.4" ry="2" fill="#F58BA1" opacity="0.65" />
              <ellipse cx="44" cy="40" rx="3.4" ry="2" fill="#F58BA1" opacity="0.65" />
            </g>
          ))}
        </g>
      </g>

      <g>
        <rect x="84" y="266" width="292" height="130" rx="8" fill="url(#glass)" stroke="#5B4034" strokeWidth="3" />
        <rect x="96" y="278" width="268" height="106" rx="4" fill="#3B2C24" opacity="0.55" />
        <g stroke="#E9D2BC" strokeWidth="2" opacity="0.55">
          <line x1="100" y1="316" x2="360" y2="316" />
          <line x1="100" y1="352" x2="360" y2="352" />
        </g>
        <g>
          {[
            [112, 292, '#F9C9D2'], [142, 292, '#FFD64A'], [172, 292, '#C9D8F2'], [202, 292, '#F2A054'],
            [232, 292, '#DCCBEE'], [262, 292, '#C9E5D6'], [292, 292, '#F5A3B5'], [322, 292, '#FADCC4'],
            [112, 330, '#FADCC4'], [142, 330, '#F5A3B5'], [172, 330, '#FCE6A0'], [202, 330, '#C9E5D6'],
            [232, 330, '#F2A054'], [262, 330, '#F9C9D2'], [292, 330, '#C9D8F2'], [322, 330, '#DCCBEE'],
          ].map(([x, y, fill], index) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="20" height="20" rx={index % 3 === 0 ? 9 : 5} fill={fill} opacity="0.92" />
          ))}
        </g>
        <path d="M96 396h268" stroke="#F8DCC5" strokeWidth="6" opacity="0.35" />
        <rect x="96" y="396" width="268" height="4" fill="#E9D2BC" opacity="0.5" />
      </g>

      <g>
        <rect x="398" y="266" width="94" height="130" rx="8" fill="#6B4B3A" stroke="#4A3329" strokeWidth="3" />
        <rect x="410" y="278" width="70" height="76" rx="4" fill="#3B2C24" opacity="0.6" />
        <rect x="410" y="362" width="70" height="22" rx="4" fill="#3B2C24" opacity="0.4" />
        <circle cx="470" cy="332" r="3.2" fill="#FFD64A" />
      </g>

      <g fill="#F5A3B5">
        <path d="m40 100 5 11 12 1.4-8.8 8.2 2.4 11.8L40 126.2l-10.3 6.2 2.4-11.8-8.8-8.2 12-1.4Z" opacity="0.75" />
        <circle cx="524" cy="120" r="5" opacity="0.7" />
        <circle cx="512" cy="90" r="3" opacity="0.55" />
      </g>
      <g fill="#FFD64A">
        <path d="m520 200 3.4 7.4 8.1.9-6 5.5 1.7 8-7-4.2-7 4.2 1.7-8-6-5.5 8.1-.9Z" />
        <circle cx="36" cy="230" r="4" />
      </g>
    </svg>
  );
}
