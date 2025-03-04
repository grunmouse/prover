module.exports = {
  entry: './wp-entry.js', // Точка входа для сборки проекта
  devtool: 'source-map',
  mode: 'production',
  optimization: {
   minimize: false
  },
  output: {
	library: {
      name: 'prover',
	  type: 'window'
    },
	   
    filename: 'prover.js',
	iife: true
  },
  target: "web"
}