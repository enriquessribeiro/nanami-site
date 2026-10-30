export function BearMark({ size = 40, ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M17.5 12.5c-4.7 0-7.5 3.4-7.5 7 0 2.9 1.8 4.7 3.8 5.5-1.1 2.6-1.8 5.3-1.8 7.8C12 44 20.6 52 32 52s20-8 20-19.2c0-2.5-.7-5.2-1.8-7.8 2-.8 3.8-2.6 3.8-5.5 0-3.6-2.8-7-7.5-7-2.8 0-5.3 1.1-7.2 2.9a26 26 0 0 0-14.6 0c-1.9-1.8-4.4-2.9-7.2-2.9Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="25.5" cy="34" r="1.9" fill="currentColor" />
      <circle cx="38.5" cy="34" r="1.9" fill="currentColor" />
      <path d="M29.5 39h5l-2.5 3.2z" fill="currentColor" />
      <path
        d="M32 42.2v2.3M32 44.5c-1.3 1.9-3.4 1.9-4.7.5M32 44.5c1.3 1.9 3.4 1.9 4.7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ compact = false, light = false }) {
  return (
    <span className="inline-flex items-center gap-[9px]">
      <BearMark size={compact ? 30 : 38} className="shrink-0 text-ouro" />
      <span className="flex flex-col gap-px">
        <span
          className={[
            'font-display font-semibold leading-none tracking-[0.14em]',
            compact ? 'text-xl' : 'text-[25px]',
            light ? 'text-creme' : 'text-ink',
          ].join(' ')}
        >
          NANAMI
        </span>
        <span
          className={[
            'font-body text-[8px] leading-tight font-extrabold tracking-[0.32em] uppercase',
            light ? 'text-creme/60' : 'text-muted',
          ].join(' ')}
        >
          Atacado &amp; Varejo
        </span>
      </span>
    </span>
  );
}

const tones = {
  rosa: { fur: '#F9C9D2', ear: '#F29CB0' },
  creme: { fur: '#F8D2B6', ear: '#F0B295' },
  azul: { fur: '#C9D8F2', ear: '#AEC4E8' },
  verde: { fur: '#C9E5D6', ear: '#A8D3BB' },
  laranja: { fur: '#F2A054', ear: '#E2833B' },
  lilas: { fur: '#DCCBEE', ear: '#C5AFE0' },
  amarelo: { fur: '#FCE6A0', ear: '#F5D274' },
};

export function CatFace({ tone = 'rosa', size = 64, className = '', blink = false }) {
  const { fur, ear } = tones[tone] ?? tones.rosa;
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={size * 0.84}
      className={[blink ? 'catface--blink' : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <path d="M20 40 23 12l23 17Z" fill={fur} stroke="#5B4034" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M100 40 97 12 74 29Z" fill={fur} stroke="#5B4034" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M27 33.5 28.5 20l12 9Z" fill={ear} />
      <path d="M93 33.5 91.5 20l-12 9Z" fill={ear} />
      <path
        d="M60 22c22.6 0 41 13.6 41 31.5C101 73 82.6 84 60 84S19 73 19 53.5C19 35.6 37.4 22 60 22Z"
        fill={fur}
        stroke="#5B4034"
        strokeWidth="2.4"
      />
      <ellipse className="cat-eye" cx="43" cy="50" rx="3.1" ry="3.8" fill="#5B4034" />
      <ellipse className="cat-eye" cx="77" cy="50" rx="3.1" ry="3.8" fill="#5B4034" />
      <circle cx="44.1" cy="48.7" r="0.9" fill="#FFF6EC" />
      <circle cx="78.1" cy="48.7" r="0.9" fill="#FFF6EC" />
      <path d="M56 58h8l-4 4.4z" fill="#5B4034" />
      <path
        d="M60 62.4v2.2M60 64.6c-1.5 2.2-4 2.1-5.2.5M60 64.6c1.5 2.2 4 2.1 5.2.5"
        stroke="#5B4034"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="30" cy="61" rx="7" ry="4" fill="#F58BA1" opacity="0.6" />
      <ellipse cx="90" cy="61" rx="7" ry="4" fill="#F58BA1" opacity="0.6" />
      <path d="M13 58h12M13 64l12-2M107 58H95M107 64l-12-2" stroke="#5B4034" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m103 26 1.6 3.6 3.9.4-2.9 2.7.8 3.8-3.4-2-3.4 2 .8-3.8-2.9-2.7 3.9-.4Z" fill="#FFD64A" />
    </svg>
  );
}
