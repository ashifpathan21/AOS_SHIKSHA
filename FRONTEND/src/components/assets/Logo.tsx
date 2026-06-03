const Logo = ({
  className = "",
  ...props
}: {
  className?: string;
}) => {
  return (
    <svg
      viewBox="0 0 680 260"
      role="img"
      aria-label="AOS-Shiksha Edtech"
      className={[
        "text-inverse",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/*
          Clip path punches genuine transparent holes for:
            - left leg of A
            - right leg of A
            - crossbar
          The outer rectangle keeps everything outside the spade visible.
          fill-rule="evenodd" makes the sub-paths cut holes.
        */}
        <clipPath id="aoss-spade-clip">
          <path
            fillRule="evenodd"
            d="
              M 0,0 L 680,0 L 680,260 L 0,260 Z
              M 130,85 C 126,95 120,105 112,113
                C 100,123 93,137 92,152
                L 114,152
                C 114,140 120,130 129,122 Z
              M 130,85 C 134,95 140,105 148,113
                C 160,123 167,137 168,152
                L 146,152
                C 146,140 140,130 131,122 Z
              M 96,152 L 164,152 L 164,163 L 96,163 Z
            "
          />
        </clipPath>
      </defs>

      {/* ── Spade / A mark ────────────────────────────────── */}
      <g clipPath="url(#aoss-spade-clip)">
        <path
          fill="currentColor"
          d="
            M 110,195
            C 92,195 76,178 76,155
            C 76,134 89,115 107,102
            C 119,93 127,83 130,68
            C 133,83 141,93 153,102
            C 171,115 184,134 184,155
            C 184,178 168,195 150,195
            C 141,195 133,190 128,182
            C 126,188 125,193 124,199
            L 138,199 C 142,199 144,202 144,205
            C 144,208 142,210 138,210
            L 112,210 C 108,210 106,208 106,205
            C 106,202 108,199 112,199
            L 126,199 C 125,193 124,188 122,182
            C 117,190 109,195 110,195 Z
          "
        />
      </g>

      {/* Open book in the A counter */}
      <line
        className="stroke-teal-500 dark:stroke-[#7fd4e0]"
        x1="130"
        y1="122"
        x2="130"
        y2="150"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        d="M 130,125 C 122,127 116,132 115,140 C 114,146 116,150 120,151"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        d="M 130,125 C 138,127 144,132 145,140 C 146,146 144,150 140,151"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        d="M 115,151 L 130,153 L 145,151"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Teal shoulder arcs */}
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        d="M 115,100 C 108,92 104,82 104,74 C 104,70 107,67 110,68"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        d="M 145,100 C 152,92 156,82 156,74 C 156,70 153,67 150,68"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Knowledge flame */}
      <path
        className="fill-amber-400 dark:fill-[#f5c87a]"
        d="M 130,58 C 129,62 127,66 127,70 C 128,66 129,63 130,61
           C 131,63 132,66 133,70 C 133,66 131,62 130,58 Z"
      />
      <path
        className="stroke-amber-400 dark:stroke-[#f5c87a]"
        d="M 130,58 C 130,55 130,52 130,50"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── O ─────────────────────────────────────────────── */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="
          M 236,82 C 215,82 200,104 200,135
            C 200,166 215,188 236,188
            C 257,188 272,166 272,135
            C 272,104 257,82 236,82 Z
          M 236,96 C 248,96 258,113 258,135
            C 258,157 248,174 236,174
            C 224,174 214,157 214,135
            C 214,113 224,96 236,96 Z
        "
      />

      {/* ── S ─────────────────────────────────────────────── */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 316,98 C 307,91 293,89 282,95
           C 268,102 263,118 268,132
           C 273,145 286,151 300,157
           C 314,163 326,170 328,185
           C 330,198 319,209 304,210
           C 290,211 275,204 267,193"
      />
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        d="M 312,93 C 318,88 322,84 322,82"
      />

      {/* ── Separator pill ────────────────────────────────── */}
      <rect
        className="fill-teal-400 dark:fill-[#7fd4e0]"
        x="340"
        y="132"
        width="22"
        height="3.5"
        rx="1.75"
      />
      <circle
        className="fill-teal-400 dark:fill-[#7fd4e0]"
        cx="340"
        cy="133.75"
        r="4"
      />

      {/* ── Shiksha ───────────────────────────────────────── */}
      {/* S lead-in flourish */}
      <path
        className="stroke-amber-400 dark:stroke-[#f5c87a]"
        d="M 388,96 C 393,90 398,87 400,84"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* S body */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 397,100 C 386,94 371,97 364,108
           C 356,120 360,136 372,143
           C 383,150 396,155 397,169
           C 398,181 388,190 376,191
           C 365,192 353,186 347,177"
      />
      {/* h */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 408,88 L 408,188
           M 408,138 C 414,126 424,120 436,120
             C 447,120 453,128 453,141 L 453,188"
      />
      {/* i stem */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        d="M 465,120 L 465,188"
      />
      {/* i dot */}
      <rect
        className="fill-teal-400 dark:fill-[#7fd4e0]"
        x="461"
        y="100"
        width="8"
        height="8"
        rx="1.5"
      />
      {/* k */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 477,88 L 477,188
           M 500,120 L 477,148
           M 485,141 L 503,188"
      />
      {/* s */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 525,125 C 517,120 506,122 503,132
           C 500,142 508,149 518,153
           C 528,157 536,163 533,173
           C 530,182 519,187 508,185
           C 500,183 495,178 493,172"
      />
      {/* h2 */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 540,88 L 540,188
           M 540,138 C 546,126 556,120 568,120
             C 579,120 585,128 585,141 L 585,188"
      />
      {/* a */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 613,120 C 604,116 593,120 588,131
           C 582,144 585,163 593,174
           C 598,182 607,188 616,188
           C 625,188 631,181 632,170 L 632,120"
      />
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="8.5"
        strokeLinecap="round"
        d="M 632,170 L 632,188"
      />

      {/* ── Underline ─────────────────────────────────────── */}
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        d="M 344,204 C 420,213 510,215 632,207
           C 648,206 656,203 660,200"
      />
      <path
        className="stroke-teal-400 dark:stroke-[#7fd4e0]"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M 348,208 C 422,217 511,219 632,211
           C 646,210 653,207 657,204"
      />
      <path
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        d="M 658,200 C 666,196 672,195 674,198
           C 676,201 670,207 660,210"
      />
      {/* amber terminal dot */}
      <circle
        className="fill-amber-400 dark:fill-[#f5c87a]"
        cx="659"
        cy="211"
        r="3.5"
      />

      {/* ── Tagline ───────────────────────────────────────── */}
      <text
        className="fill-text-secondary"
        x="344"
        y="235"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="25"
        letterSpacing="4"
        fontStyle="italic"
        opacity="0.85"
      >
        Learn · Lead · Excel
      </text>
    </svg>
  );
};

export default Logo;
