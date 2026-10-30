const stroke = '#5B4034';

const base = {
  fill: 'none',
  stroke,
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Face({ x = 80, y = 100, spread = 16, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx={-spread} cy="0" r="2.8" fill={stroke} />
      <circle cx={spread} cy="0" r="2.8" fill={stroke} />
      <path d={`M-5 7c2 3 8 3 10 0`} {...base} strokeWidth="2.4" />
      <ellipse cx={-spread - 9} cy="7" rx="5" ry="3" fill="#F5A3B5" opacity="0.55" />
      <ellipse cx={spread + 9} cy="7" rx="5" ry="3" fill="#F5A3B5" opacity="0.55" />
    </g>
  );
}

function Shadow() {
  return <ellipse cx="80" cy="146" rx="42" ry="5" fill="#5B4034" opacity="0.12" />;
}

function Bag({ deep, light }) {
  return (
    <>
      <Shadow />
      <path d="M52 62v-9c0-17 12-27 28-27s28 10 28 27v9" {...base} strokeWidth="3.6" />
      <rect x="28" y="62" width="104" height="72" rx="22" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M28 82c16 12 88 12 104 0v-2c0-10-8-18-18-18H46c-10 0-18 8-18 18Z" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="80" cy="92" r="5" fill={deep} stroke={stroke} strokeWidth="2.4" />
      <Face x={80} y={110} spread={17} scale={0.95} />
      <path d="M40 116c4 3 8 3 12 0M108 116c4 3 8 3 12 0" stroke={stroke} strokeWidth="2" opacity="0.35" fill="none" />
    </>
  );
}

function Backpack({ deep, light }) {
  return (
    <>
      <Shadow />
      <path d="M64 48v-5c0-9 32-9 32 0v5" {...base} strokeWidth="3.4" />
      <rect x="34" y="50" width="92" height="88" rx="26" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M34 84c14 10 78 10 92 0" fill="none" stroke={stroke} strokeWidth="2.4" opacity="0.35" />
      <rect x="52" y="94" width="56" height="34" rx="14" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="80" cy="88" r="4" fill={deep} stroke={stroke} strokeWidth="2" />
      <Face x={80} y={70} spread={16} scale={0.9} />
      <path d="M34 102h-6c-3 0-5 3-5 6v10M126 102h6c3 0 5 3 5 6v10" {...base} strokeWidth="2.6" />
    </>
  );
}

function Bottle({ deep, light }) {
  return (
    <>
      <Shadow />
      <rect x="64" y="22" width="32" height="18" rx="7" fill={deep} stroke={stroke} strokeWidth="3" />
      <path d="M68 40h24v10H68z" fill={light} stroke={stroke} strokeWidth="3" />
      <path d="M63 50h34c6 0 11 5 11 11v61c0 11-9 20-20 20H72c-11 0-20-9-20-20V61c0-6 5-11 11-11Z" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M52 70h56" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <path d="M52 108h56" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <Face x={80} y={92} spread={15} scale={1} />
      <path d="m112 116 6 6 6-6" fill="none" stroke={deep} strokeWidth="3.4" strokeLinecap="round" />
    </>
  );
}

function Teddy({ deep, light }) {
  return (
    <>
      <Shadow />
      <circle cx="50" cy="50" r="17" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="50" r="8" fill={deep} opacity="0.55" />
      <circle cx="110" cy="50" r="17" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="110" cy="50" r="8" fill={deep} opacity="0.55" />
      <ellipse cx="80" cy="124" rx="30" ry="25" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="80" cy="74" r="35" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <ellipse cx="80" cy="86" rx="15" ry="11" fill={light} stroke={stroke} strokeWidth="2.4" />
      <circle cx="68" cy="68" r="3" fill={stroke} />
      <circle cx="92" cy="68" r="3" fill={stroke} />
      <path d="M76 82h8l-4 5z" fill={stroke} />
      <path d="M80 87v3M80 90c-2 3-5 3-7 1M80 90c2 3 5 3 7 1" {...base} strokeWidth="2.2" />
      <ellipse cx="54" cy="80" rx="6" ry="4" fill="#F5A3B5" opacity="0.55" />
      <ellipse cx="106" cy="80" rx="6" ry="4" fill="#F5A3B5" opacity="0.55" />
      <path d="M80 108c-6-6-14-2-14 4 0 5 8 9 14 13 6-4 14-8 14-13 0-6-8-10-14-4Z" fill={deep} opacity="0.45" stroke={stroke} strokeWidth="2" />
    </>
  );
}

function Bow({ deep, light }) {
  return (
    <>
      <Shadow />
      <path d="M74 76C58 54 32 54 30 72c-2 18 26 26 44 8Z" fill={light} stroke={stroke} strokeWidth="3" />
      <path d="M86 76c16-22 42-22 44-4 2 18-26 26-44 8Z" fill={light} stroke={stroke} strokeWidth="3" />
      <path d="M70 84 62 128l14-9 6 11 8-36Z" fill={light} stroke={stroke} strokeWidth="3" />
      <path d="M90 84l8 44-14-9-6 11-8-36Z" fill={light} stroke={stroke} strokeWidth="3" />
      <circle cx="80" cy="78" r="13" fill={deep} stroke={stroke} strokeWidth="3" />
      <path d="m80 72 2 4 4 .5-3 2.8.7 4.2-3.7-2-3.7 2 .7-4.2-3-2.8 4-.5Z" fill="#FFFDF8" />
      <path d="m42 44 2 4.4 4.8.5-3.6 3.3.9 4.8-4.1-2.3-4.1 2.3.9-4.8-3.6-3.3 4.8-.5Z" fill="#FFD64A" />
      <path d="m122 120 1.5 3.4 3.7.4-2.8 2.5.7 3.7-3.1-1.8-3.1 1.8.7-3.7-2.8-2.5 3.7-.4Z" fill="#FFD64A" />
      <circle cx="124" cy="44" r="4" fill="#F5A3B5" />
      <circle cx="36" cy="112" r="3" fill="#F5A3B5" />
    </>
  );
}

function Baby({ deep, light }) {
  return (
    <>
      <Shadow />
      <path
        d="M62 38h36l16 13-9 15-7-5v44c0 7-5 12-12 12H74c-7 0-12-5-12-12V61l-7 5-9-15Z"
        fill="#FFFDF8"
        stroke={stroke}
        strokeWidth="3"
      />
      <path d="M66 38c3 9 25 9 28 0" fill="none" stroke={stroke} strokeWidth="3" />
      <path d="M62 74h36" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <circle cx="72" cy="112" r="2.6" fill={stroke} />
      <circle cx="80" cy="112" r="2.6" fill={stroke} />
      <circle cx="88" cy="112" r="2.6" fill={stroke} />
      <path d="M80 84c-6-6-14-2-14 4 0 5 8 9 14 13 6-4 14-8 14-13 0-6-8-10-14-4Z" fill={deep} opacity="0.5" stroke={stroke} strokeWidth="2" />
      <Face x={80} y={64} spread={12} scale={0.75} />
      <path d="M34 92h-8v18h8M126 92h8v18h-8" {...base} strokeWidth="2.6" fill={light} />
    </>
  );
}

function Pet({ deep, light }) {
  return (
    <>
      <Shadow />
      <ellipse cx="42" cy="58" rx="15" ry="23" fill={deep} stroke={stroke} strokeWidth="3" transform="rotate(-18 42 58)" />
      <ellipse cx="118" cy="58" rx="15" ry="23" fill={deep} stroke={stroke} strokeWidth="3" transform="rotate(18 118 58)" />
      <circle cx="80" cy="76" r="40" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <ellipse cx="80" cy="94" rx="19" ry="14" fill={light} stroke={stroke} strokeWidth="2.4" />
      <circle cx="66" cy="70" r="3.2" fill={stroke} />
      <circle cx="94" cy="70" r="3.2" fill={stroke} />
      <path d="M75 84h10l-5 6z" fill={stroke} />
      <path d="M80 90v3M80 93c-2 3-5 3-7 1M80 93c2 3 5 3 7 1" {...base} strokeWidth="2.2" />
      <ellipse cx="53" cy="84" rx="6" ry="4" fill="#F5A3B5" opacity="0.55" />
      <ellipse cx="107" cy="84" rx="6" ry="4" fill="#F5A3B5" opacity="0.55" />
      <path d="M56 114c8 10 40 10 48 0" fill="none" stroke={deep} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
      <circle cx="80" cy="121" r="5" fill="#FFD64A" stroke={stroke} strokeWidth="2" />
    </>
  );
}

function Blocks({ deep, light }) {
  return (
    <>
      <Shadow />
      <rect x="28" y="88" width="44" height="44" rx="11" fill={light} stroke={stroke} strokeWidth="3" />
      <rect x="80" y="88" width="44" height="44" rx="11" fill={deep} stroke={stroke} strokeWidth="3" />
      <rect x="54" y="38" width="52" height="52" rx="13" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="m80 52 4 8 9 1-6.5 6 1.5 8.5-8-4.2-8 4.2 1.5-8.5-6.5-6 9-1Z" fill="#FFD64A" />
      <circle cx="50" cy="110" r="6" fill="#FFFDF8" opacity="0.85" />
      <path d="M102 104h8v8h-8z" fill="#FFFDF8" opacity="0.9" />
      <path d="m113 118 2 4 4.5.5-3.3 3 .8 4.5-4-2.2-4 2.2.8-4.5-3.3-3 4.5-.5Z" fill="#F5A3B5" />
      <path d="m38 120 1.6 3.4 3.7.4-2.8 2.5.7 3.7-3.2-1.8-3.2 1.8.7-3.7-2.8-2.5 3.7-.4Z" fill="#FFFDF8" opacity="0.9" />
    </>
  );
}

function Tote({ deep }) {
  return (
    <>
      <Shadow />
      <path d="M58 64V52c0-10 8-18 18-18s18 8 18 18v12" {...base} strokeWidth="3.4" />
      <path d="M46 58h68l7 72c.4 5-3.4 9-8.4 9H47.4c-5 0-8.8-4-8.4-9Z" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M46 78h68" stroke={stroke} strokeWidth="2.4" opacity="0.35" />
      <path d="m80 92 4.4 8.8 9.6 1.4-7 6.8 1.7 9.6L80 114l-8.7 4.6 1.7-9.6-7-6.8 9.6-1.4Z" fill={deep} opacity="0.55" stroke={stroke} strokeWidth="1.8" />
      <path d="M62 124c4 3 8 3 12 0M106 124c4 3 8 3 12 0" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <circle cx="118" cy="70" r="3" fill="#F5A3B5" />
    </>
  );
}

function House({ deep, light }) {
  return (
    <>
      <Shadow />
      <path d="M30 78 80 34l50 44Z" fill={light} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <path d="M38 78h84v58c0 5-4 9-9 9H47c-5 0-9-4-9-9Z" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M68 145v-27c0-7 5-12 12-12s12 5 12 12v27Z" fill={deep} opacity="0.35" stroke={stroke} strokeWidth="2.6" />
      <circle cx="80" cy="94" r="11" fill="#FFD64A" stroke={stroke} strokeWidth="2.4" />
      <circle cx="80" cy="91" r="2" fill={stroke} />
      <circle cx="76" cy="88" r="1.5" fill={stroke} />
      <circle cx="84" cy="88" r="1.5" fill={stroke} />
      <path d="M38 78h84" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <circle cx="118" cy="112" r="4" fill={deep} opacity="0.4" />
      <path d="m32 110 1.6 3.4 3.7.4-2.8 2.5.7 3.7-3.2-1.8-3.2 1.8.7-3.7-2.8-2.5 3.7-.4Z" fill="#F5A3B5" />
    </>
  );
}

function Car({ light }) {
  return (
    <>
      <Shadow />
      <path
        d="M32 100c0-8 6-14 14-14h9l11-15h28l11 15h9c8 0 14 6 14 14v15c0 5-4 9-9 9H41c-5 0-9-4-9-9Z"
        fill="#FFFDF8"
        stroke={stroke}
        strokeWidth="3"
      />
      <path d="M66 86h10l7-10h8v10H66ZM92 86h14l-7-10h-7Z" fill={light} stroke={stroke} strokeWidth="2.2" />
      <circle cx="57" cy="127" r="12" fill="#4A3329" stroke={stroke} strokeWidth="3" />
      <circle cx="57" cy="127" r="4" fill={light} />
      <circle cx="105" cy="127" r="12" fill="#4A3329" stroke={stroke} strokeWidth="3" />
      <circle cx="105" cy="127" r="4" fill={light} />
      <circle cx="123" cy="100" r="4" fill="#FFD64A" stroke={stroke} strokeWidth="2" />
      <Face x={64} y={106} spread={9} scale={0.55} />
      <path d="M140 110h6" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </>
  );
}

function Cup({ deep }) {
  return (
    <>
      <Shadow />
      <path d="M96 30 86 54" stroke={deep} strokeWidth="7" strokeLinecap="round" />
      <rect x="52" y="52" width="56" height="14" rx="7" fill={deep} stroke={stroke} strokeWidth="3" />
      <path d="M56 66h48l-7 64c-.6 6-5.4 10-11.4 10H74.4c-6 0-10.8-4-11.4-10Z" fill="#FFFDF8" stroke={stroke} strokeWidth="3" />
      <path d="M60 84h40" stroke={stroke} strokeWidth="2" opacity="0.3" />
      <Face x={80} y={96} spread={12} scale={0.9} />
      <path d="m112 72 6 6 6-6" fill="none" stroke={deep} strokeWidth="3" strokeLinecap="round" />
      <path d="m36 108 1.6 3.4 3.7.4-2.8 2.5.7 3.7-3.2-1.8-3.2 1.8.7-3.7-2.8-2.5 3.7-.4Z" fill="#F5A3B5" />
    </>
  );
}

const artByCategory = {
  acessorios: Bow,
  bolsas: Bag,
  mochilas: Backpack,
  copos: Bottle,
  pelucias: Teddy,
  bebe: Baby,
  pet: Pet,
  brinquedos: Blocks,
};

const artByProduct = {
  'ecobag-mokamaki': Tote,
  'casinha-pet': House,
  'carrinho-controle': Car,
  'copo-termico-canudo': Cup,
};

export function ProductArt({ category, variant, colors = ['#FFF6EC', '#F5A3B5'], className = '' }) {
  const [light, deep] = colors;
  const Art = artByProduct[variant] ?? artByCategory[category] ?? Bag;

  return (
    <svg
      viewBox="0 0 160 160"
      className={`product-art ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <Art deep={deep} light={light} />
    </svg>
  );
}
