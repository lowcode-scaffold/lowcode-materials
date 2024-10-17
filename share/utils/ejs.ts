import * as path from 'path';
import * as ejs from 'ejs';
import glob from 'glob';
import * as fse from 'fs-extra';

export type YapiInfo = {
  query_path: { path: string };
  method: string;
  title: string;
  project_id: number;
  req_params: {
    name: string;
    desc: string;
  }[];
  _id: number;
  req_query: { required: '0' | '1'; name: string }[];
  res_body_type: 'raw' | 'json';
  res_body: string;
  username: string;
};

export type Model = {
  type: string;
  requestBodyType?: string;
  funcName: string;
  typeName: string;
  inputValues: string[];
  api?: YapiInfo;
  yapiDomain?: string;
  mockCode: string;
  mockData: string;
  jsonData: any;
  jsonKeys?: string[];
  rawSelectedText: string; // 编辑器中选中的原始文本
  rawClipboardText: string; // 系统剪切板中的原始文本
  activeTextEditorFilePath?: string; // 当前打开文件地址
  createBlockPath?: string; // 创建区块的目录
};

export const compile = (templateString: string, model: Model) =>
  ejs.render(templateString, model);

export async function renderEjsTemplates(
  templateData: object,
  templateDir: string,
) {
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
          if (s.indexOf('.ejs') < 0) {
            valid = false;
          }
          return valid;
        });
        Promise.all(
          templateFiles.map((file) => {
            const filepath = path.join(templateDir, file);
            return renderFile(
              filepath,
              templateData,
              file.includes('.keep.ejs'),
            );
          }),
        )
          .then(() => resolve())
          .catch(reject);
      },
    );
  });
}

async function renderFile(
  templateFilepath: string,
  data: ejs.Data,
  keepRawContent: boolean,
) {
  if (!keepRawContent) {
    const content = await ejs.renderFile(templateFilepath, data);
    const targetFilePath = templateFilepath
      .replace(/\.ejs$/, '')
      .replace(
        /\$\{.+?\}/gi,
        (match) => data[match.replace(/\$|\{|\}/g, '')] || '',
      );
    await fse.rename(templateFilepath, targetFilePath);
    await fse.writeFile(targetFilePath, content);
  } else {
    const targetFilePath = templateFilepath
      .replace(/\.keep\.ejs$/, '.ejs')
      .replace(
        /\$\{.+?\}/gi,
        (match) => data[match.replace(/\$|\{|\}/g, '')] || '',
      );
    await fse.rename(templateFilepath, targetFilePath);
  }
}
