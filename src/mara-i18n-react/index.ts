import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const sourceCode: string = `
	const renderLocale = () => {
		const userName = "[user.name][marathon]";
		const userAge = "[user.age][20]";
		return (
			<div>
				<p> userName：{userName} </p>
				<p> userAge：{userAge} </p>
			</div>
		)
	}
`;

const ast = parse(sourceCode, {
	plugins: ['jsx'] // @babel/parser这个包中内置了jsx 等plugin
});

traverse(ast, {
	StringLiteral: (path) => {
		console.log(path.node);
	}
});
