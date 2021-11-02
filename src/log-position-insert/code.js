const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const template = require('@babel/template');

const targetCalleeNameData = ['log', 'info', 'error', 'debug', 'warning'].map((name) => `console.${name}`)
const sourceCode = `
    const foo = () => 'foo';
    console.warning('test');
    <div>{console.info('jsx')}</div>;
`;

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
});

traverse(ast, {
    CallExpression(path) {
        if (path.node.isNew) return;
        // 表示当前正在执行的函数表达式：a() / a.b()
        const callee = path.node.callee;
        // const isNodeChanged = types.isMemberExpression(callee) && callee.object.name === 'console' &&
        //     ['log', 'info', 'error', 'debug', 'warning'].includes(
        //         callee.property.name
        //     )
        // 利用generate api生成代码片段进行字符匹配，简化判断逻辑
        const isNodeChanged = targetCalleeNameData.includes(generate(callee).code);
        if (isNodeChanged) {
            const { line, column } = path.node.loc.start;
            const newNode = template.expression(`console.log("positions: [${line}, ${column}]")`)();
            // NOTE 新插入的节点，需要加上标记，因为babel traverse 时也在相应的vistor中处理这个节点
            newNode.isNew = true;
            if (path.findParent((path) => path.isJSXElement())) {
                path.replaceWith(types.arrayExpression([newNode, path.node]));
                // NOTE 用新的节点替换旧的节点后， babel traverse会继续遍历新的节点
                // NOTE 所以必须执行path.skip() 跳过子节点处理 
                // TODO but what is the rule for babel traversing ?
                path.skip();
            } else {
                path.insertBefore(newNode);
                // 改造成插件的形式，利用babel去编译.tsx文件，若JSX中包含了console.log()语句，会无限循环，所以这里也要加上该语句
                path.skip();
            }
        }
    }
});
