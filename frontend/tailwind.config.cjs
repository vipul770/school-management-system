module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        vibrant: {
          50: '#fff5f7',
          100: '#ffe3ec',
          200: '#ffb3cf',
          300: '#ff80b0',
          400: '#ff4d92',
          500: '#ff1a73',
          600: '#e6005f',
          700: '#b40049',
          800: '#820033',
          900: '#4f001f'
        },
        sunset: {
          400: '#ff9a8b',
          500: '#ff6b6b',
          600: '#ff4c4c'
        },
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    }
  },
  plugins: [],
}
