// src/components/Logo.jsx

/**
 * Logo CareMate — 2 người (đầu tròn) có thân uốn thành trái tim + trái tim nhỏ ở giữa
 * @param {string} variant - 'default' | 'white'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function Logo({ variant = 'default', size = 'md' }) {
  const sizes = {
    sm: { icon: 32, text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 40, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 52, text: 'text-2xl', gap: 'gap-2.5' },
  };
  const s = sizes[size] || sizes.md;
  const isWhite = variant === 'white';

  const tealColor = isWhite ? '#5EEAD4' : '#0D9488';
  const roseColor = isWhite ? '#FDA4AF' : '#F43F5E';

  return (
    <div className={`flex items-center ${s.gap} select-none`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* ===== NGƯỜI BÊN TRÁI (TEAL) ===== */}
        <circle cx="30" cy="14" r="9" fill={tealColor} />
        {/* Hình đặc: đầu nét hẹp (cong vào giữa) -> bụng rộng -> đuôi nhọn ở đáy tim */}
        <path
          d="
            M 49 38
            C 43 28, 22 24, 12 40
            C 4 54, 14 78, 50 95
            C 26 76, 22 58, 27 47
            C 31 38, 43 37, 49 43
            Z
          "
          fill={tealColor}
          stroke={tealColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ===== NGƯỜI BÊN PHẢI (ROSE) ===== */}
        <circle cx="70" cy="14" r="9" fill={roseColor} />
        {/* Đối xứng với bên trái */}
        <path
          d="
            M 51 38
            C 57 28, 78 24, 88 40
            C 96 54, 86 78, 50 95
            C 74 76, 78 58, 73 47
            C 69 38, 57 37, 51 43
            Z
          "
          fill={roseColor}
          stroke={roseColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* ===== TRÁI TIM NHỎ Ở GIỮA (ROSE) ===== */}
        <path
          d="
            M 50 76
            C 42 70, 38 65, 38 60
            C 38 56, 41 53, 44.5 53
            C 47 53, 49 54.5, 50 56.5
            C 51 54.5, 53 53, 55.5 53
            C 59 53, 62 56, 62 60
            C 62 65, 58 70, 50 76
            Z
          "
          fill={roseColor}
        />
      </svg>

      {/* ===== CHỮ "CareMate" ===== */}
      <span className={`font-extrabold ${s.text} leading-none tracking-tight`}>
        <span className={isWhite ? 'text-white' : 'text-teal-600'}>Care</span>
        <span className={isWhite ? 'text-rose-300' : 'text-rose-500'}>
          Mate
        </span>
      </span>
    </div>
  );
}