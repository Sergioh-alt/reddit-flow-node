/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hud: ['Orbitron', 'monospace'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        neon: {
          cyan: '#00f5ff',
          green: '#39ff14',
          orange: '#ff6b00',
          purple: '#bf00ff',
          red: '#ff0044',
        },
        dark: {
          950: '#050810',
          900: '#0a0f1e',
          800: '#0f1629',
          700: '#162040',
          600: '#1e2d54',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 12px #00f5ff, 0 0 24px rgba(0,245,255,0.3)',
        'neon-green': '0 0 12px #39ff14, 0 0 24px rgba(57,255,20,0.3)',
        'neon-orange': '0 0 12px #ff6b00, 0 0 24px rgba(255,107,0,0.3)',
        'neon-purple': '0 0 12px #bf00ff, 0 0 24px rgba(191,0,255,0.3)',
        'node': '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan-line': 'scanLine 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f5ff, 0 0 10px rgba(0,245,255,0.3)' },
          '100%': { boxShadow: '0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.5)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
