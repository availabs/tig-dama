module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', //'media',
  theme: {
       
    extend: {
      colors: {
          tigGray: {
            '25': '#F9F9F9',
            '50': '#EEEEEE',
            '100': '#E6E6E6',
            '200': '#D2D2D2'
          },
          tigGreen: {
            '50': '#bcd3cb',
            '100': '#679d89'
          }
      },
      boxShadow: {
           tigShadow: '0 0px 5px 1px rgba(38, 146, 248, 0.1)'
      },
      fontFamily: {
        sans: ['"Proxima Nova W01"','ui-sans-serif', 'system-ui', '-apple-system'],
      },
    },
  },
  plugins: [],
}