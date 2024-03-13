import path from 'path';
import fs from 'fs';
import glob from 'glob';

type Docs = Doc[];

export interface Doc {
  label?: string;
  _id: string;
  _rev?: string;
  value?: string;
  feature?: Feature;
  script?: string;
  updateAt?: number;
  scriptId?: number;
  versionAt?: string;
}

export interface Feature {
  code: string;
  explain: string;
  cmds: any[];
  icon: string;
}

export const bootstrap = (scriptFile?: string) => {
  const materialsPath = utools.showOpenDialog({
    properties: ['openDirectory'],
    message: '请选择 lowcode-materials 仓库目录',
  });
  if (materialsPath && Array.isArray(materialsPath) && materialsPath[0]) {
    const utoolsPath = path.join(materialsPath[0], 'dist/uTools');
    if (!fs.existsSync(utoolsPath)) {
      return '请选择正确的 lowcode-materials 仓库目录';
    }
    const docs = utools.db.allDocs() as Docs;
    const lowcodeDocs: Docs = []; // 我的脚本
    const utoolsDocs: Docs = []; // 下载的脚本
    docs.forEach((s) => {
      if (s.feature && !s.scriptId) {
        lowcodeDocs.push(s);
      } else {
        utoolsDocs.push(s);
      }
    });
    return new Promise((resolve) => {
      glob(
        '**',
        {
          cwd: utoolsPath,
          ignore: ['node_modules/**'],
          nodir: true,
          dot: true,
        },
        (err, files) => {
          if (err) {
            resolve(err);
          }
          const addDoc: string[] = [];
          const updateDoc: string[] = [];
          files.map((file) => {
            if (file.replace('\\', '/').indexOf('/script/index.js') > -1) {
              const arr = file.replace('\\', '/').split('/');
              const name = arr[0];
              const scriptContent = fs.readFileSync(
                path.join(utoolsPath, file),
                'utf8',
              );
              const exist = lowcodeDocs.find(
                (s) => s.feature?.explain === name,
              );
              if (exist) {
                if (exist.script !== scriptContent) {
                  updateDoc.push(name);
                  exist.script = scriptContent;
                  exist.updateAt = new Date().getTime() + Math.random();
                }
              } else {
                addDoc.push(name);
                const id = new Date().getTime() + Math.random();
                lowcodeDocs.push({
                  feature: {
                    code: `${id}`,
                    explain: name,
                    cmds: [name],
                    icon: 'action.png',
                  },
                  script: scriptContent,
                  updateAt: new Date().getTime() + Math.random(),
                  _id: `scripts/${id}`,
                });
              }
            }
          });
          utools.db.bulkDocs([...utoolsDocs, ...lowcodeDocs]);
          resolve(
            `新增${addDoc.length}条脚本：${addDoc.join('、')}\n更新${
              updateDoc.length
            }条脚本：${updateDoc.join('、')}`,
          );
        },
      );
    });
  }
  return '请选择 lowcode-materials 仓库目录';
};
