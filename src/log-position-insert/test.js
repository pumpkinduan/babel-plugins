const { transformFileSync } = require('@babel/core');
const logPositionInsertPlugin = require('.');
const path = require('path');

const { code } = transformFileSync(path.join(__dirname, '../../src/demo.tsx'), {
    plugins: [logPositionInsertPlugin],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript']
    }
});

// console.log(code);