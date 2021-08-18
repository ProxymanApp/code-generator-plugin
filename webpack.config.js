const path = require('path');

const config = {
    entry: './index.js',
    output: {
    	path: path.resolve(__dirname, 'dist'),
    	filename: './code-gen.js'
    },
    mode: 'production',
};

module.exports = config;