import * as path from 'path';
import * as ReactDOMServer from 'react-dom/server';
import glob from 'glob';
import * as fse from 'fs-extra';
import ts from 'typescript';

export async function renderTemplates(props: object, templateDir: string) {
  return new Promise<void>((resolve, reject) => {
    glob(
      '**',
      {
        cwd: templateDir,
        ignore: ['node_modules/**'],
        nodir: true,
        dot: true,
      },
      (err, files) => {
        if (err) {
          return reject(err);
        }
        const templateFiles = files.filter((s) => {
          let valid = true;
          if (s.indexOf('.template.tsx') < 0) {
            valid = false;
          }
          return valid;
        });
        Promise.all(
          templateFiles.map((file) => {
            const filepath = path.join(templateDir, file);
            return renderFile(filepath, props);
          }),
        )
          .then(() => resolve())
          .catch(reject);
      },
    );
  });
}

async function renderFile(templateFilepath: string, props: object) {
  const tsxContentStr = fse.readFileSync(templateFilepath).toString();
  const transpileResult = ts.transpileModule(tsxContentStr, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ES2015,
      strict: false,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2015,
    },
  });
  fse.writeFileSync(path.join(templateFilepath), transpileResult.outputText);
  const templateJsFilepath = templateFilepath.replace(
    /\.template.tsx$/,
    '.template.js',
  );
  await fse.rename(templateFilepath, templateJsFilepath);
  delete require.cache[require.resolve(templateJsFilepath)];

  const script = require(templateJsFilepath);
  const markup = ReactDOMServer.renderToStaticMarkup(script.default(props));
  const targetFilePath = templateJsFilepath
    .replace(/\.template.js$/, '')
    .replace(
      /\$\{.+?\}/gi,
      (match) => props[match.replace(/\$|\{|\}/g, '')] || '',
    );
  await fse.rename(templateJsFilepath, targetFilePath);
  await fse.writeFile(targetFilePath, markup);
}
