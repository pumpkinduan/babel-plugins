const generate = require('@babel/generator').default;

const targetCalleeNameData = ['log', 'info', 'error', 'debug', 'warning'].map((name) => `console.${name}`)

// console.log 打印 出当前语句所在的行与列, 且该语句单独占一行
function logPositionInsert({ types, template }) {
    return {
        visitor: {
            CallExpression(path) {
                if (path.node.isNew) return;
                const callee = path.node.callee;
                if (targetCalleeNameData.includes(generate(callee).code)) {
                    const { line, column } = path.node.loc.start;
                    const newNode = template.expression(`console.log("position: ${line}, ${column}")`)();
                    // NOTE 新插入的节点，需要加上标记，因为babel traverse 时也在相应的vistor中处理这个节点

                    newNode.isNew = true;

                    if (path.findParent((path) => path.isJSXElement())) {
                        // NOTE 用新的节点替换旧的节点后， babel traverse会继续遍历新的节点
                        // NOTE 所以必须执行path.skip() 跳过子节点处理 
                        // TODO but what is the rule for babel traversing ?
                        path.replaceWith(types.arrayExpression([newNode, path.node]));
                        path.skip();
                    } else {
                        path.insertBefore(newNode);
                        // 改造成插件的形式，利用babel去编译.tsx文件，若JSX中包含了console.log()语句，会无限循环，所以这里也要加上该语句
                        path.skip();
                    }
                }
            }
        }
    }
}

module.exports = logPositionInsert