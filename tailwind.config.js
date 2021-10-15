module.exports = {
  mode: "jit",
  purge: ["index.html", "./src/**/*.html", "./src/**/*.ts"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'sans': ['Bitter', 'ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['ui-monospace', 'SFMono-Regular'],
      'display': ['Oswald'],
      'body': ['"Bitter"']
     }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
