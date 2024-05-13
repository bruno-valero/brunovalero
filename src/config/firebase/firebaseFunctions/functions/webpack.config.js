const path = require('path');


module.exports = {
    mode:'production',
    entry:'./src/index.ts',
    target:'node',
    module:{
        rules:[
            {
                test:/\.ts$/,
                use:'ts-loader',
                exclude:'/node_modules/',

            }
        ]
    },
    resolve:{
        extensions:['.ts', '.js'],
        alias:{
            '@':path.resolve(__dirname),
        }
    },
    output:{
        filename:'index.js',
        path:path.resolve(__dirname, 'lib', 'src'),
    }
}

