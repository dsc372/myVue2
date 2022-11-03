import babel from 'rollup-plugin-babel'

export default{
    input:'./src/index.js',
    output:{
        file:'./dist/myVue2.js',
        name:'MyVue2',
        format:'umd',//以什么格式打包 esm es6模块 commonjs iife自执行函数 umd
        sourcemap:true,
    },
    plugins:[
        babel({
            exclude:'node_modules/**'//不打包node_modules中的内容
        })
    ]
}