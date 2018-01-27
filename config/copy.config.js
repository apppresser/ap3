// New copy task for font files
module.exports = {
  copyFontAwesomeFonts: {
    src: ['{{ROOT}}/node_modules/font-awesome/fonts/**/*'],
    dest: '{{WWW}}/fonts'
  },
  copyFontAwesomeCss: {
    src: ['{{ROOT}}/node_modules/font-awesome/css/font-awesome.min.css'],
    dest: '{{WWW}}/assets/css'
  },
  copyVideogular2Fonts: {
    src: ['{{ROOT}}/node_modules/videogular2/fonts/*'],
    dest: '{{WWW}}/assets/css'
  },
  copyVideogular2Js: {
    src: ["{{ROOT}}/node_modules/dashjs/dist/dash.all.min.js","{{ROOT}}/node_modules/hls.js/dist/hls.min.js"],
    dest: '{{WWW}}/assets/js'
  }
};