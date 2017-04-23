var path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{ test: /\.js$/, include: [path.resolve(__dirname, 'src')], exclude: /node_modules/, loader: 'babel-loader' }
		]
	},
	resolve: {
	    // options for resolving module requests
	    // (does not apply to resolving to loaders)

	    modules: [
	      "node_modules",
	      __dirname
	    ],
	    // directories where to look for modules

	    extensions: [".js", ".json", ".jsx", ".css"],
	    // extensions that are used

	    alias: {

	      "addons": path.resolve(__dirname, 'node_modules/.79.0.0@three-js/addons')
	      // alias "module" -> "./app/third/module.js" and "module/file" results in error
	      // modules aliases are imported relative to the current context
	    },
	    /* alternative alias syntax (click to show) */

	    /* Advanced resolve configuration (click to show) */
   },
};
