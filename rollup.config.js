import uglify from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/index.js',
	dest: 'dist/deity.min.js',
	sourceMap: true,
	plugins: [
		babel({
			presets: ['es2015-rollup'],
			babelrc: false
		}),
		uglify()
	],
	format: 'umd',
	moduleName: 'deity'
};
