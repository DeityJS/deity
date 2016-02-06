//import uglify from 'rollup-plugin-uglify';

export default {
	entry: 'src/index.js',
	dest: 'dist/deity.min.js',
	sourceMap: true,
	//plugins: [ uglify() ],
	format: 'umd',
	moduleName: 'deity'
};
