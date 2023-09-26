import * as path from 'path';
import * as fs from 'fs-extra';
import * as execa from 'execa';
import * as ejs from 'ejs';
import axios from 'axios';
import { workspace, window } from 'vscode';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { context } from './context';
import { IItems } from '../../config/schema';
import { typescriptToMock } from '../../../../../share/utils/json';

export async function handleAskChatGPT() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const typeName = 'IItems';
  const res = await translate<IItems>({
    schema,
    typeName,
    request: JSON.stringify((lowcodeContext!.model as { items: IItems }).items),
    completePrompt:
      `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
      `\`\`\`\n${schema}\`\`\`\n` +
      `以下是用户请求:\n` +
      `"""\n${JSON.stringify(
        (lowcodeContext!.model as { items: IItems }).items,
      )}\n"""\n` +
      `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
    extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
  });
  lowcodeContext!.outputChannel.appendLine(JSON.stringify(res, null, 2));
  if (res.success) {
    return { ...lowcodeContext!.model, items: res.data };
  }
  return lowcodeContext!.model;
}

export async function handleComplete() {
  const { lowcodeContext } = context;
  const createBlockPath = context.lowcodeContext?.createBlockPath;
  if (createBlockPath) {
    // #region 更新 api.ts 文件
    const apiFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.api.ts'))
      .toString();

    let apiFileContentOld = '';
    try {
      apiFileContentOld = fs
        .readFileSync(path.join(createBlockPath, 'api.ts').toString())
        .toString();
    } catch {}

    fs.writeFileSync(
      path.join(createBlockPath, 'api.ts'),
      apiFileContentOld + apiFileContent,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.api.ts'));
    try {
      execa.sync('node', [
        path.join(workspace.rootPath!, '/node_modules/eslint/bin/eslint.js'),
        path.join(createBlockPath, 'api.ts'),
        '--resolve-plugins-relative-to',
        workspace.rootPath!,
        '--fix',
      ]);
    } catch (err) {
      console.log(err);
    }
    // #endregion

    // #region 更新 model.ts 文件
    const modelFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.model.ts'))
      .toString();
    let modelFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'model.ts').toString())
      .toString();

    const keywords = [
      '// lowcode-model-import-api',
      '// lowcode-model-type',
      '// lowcode-model-variable',
      '// lowcode-model-return-variable',
    ];
    const modelSplitArr = modelFileContent.split(
      new RegExp(keywords.join('|'), 'ig'),
    );
    const modelImportApi = modelSplitArr[1].replace(/\n/g, '');
    const modelType = modelSplitArr[2];
    const modelVariable = modelSplitArr[3];
    const modelReturnVariable = modelSplitArr[4].replace(/\n/g, '');

    if (!modelFileContentOld.includes('// lowcode-model-import-api')) {
      modelFileContentOld = `// lowcode-model-import-api\n${modelFileContentOld}`;
    }
    modelFileContentOld = modelFileContentOld.replace(
      '// lowcode-model-import-api',
      modelImportApi,
    );

    if (!modelFileContentOld.includes('// lowcode-model-type')) {
      modelFileContentOld = modelFileContentOld.replace(
        'export const useModel',
        '// lowcode-model-type\nexport const useModel',
      );
    }
    modelFileContentOld = modelFileContentOld.replace(
      '// lowcode-model-type',
      modelType,
    );

    if (!modelFileContentOld.includes('// lowcode-model-variable')) {
      modelFileContentOld = modelFileContentOld.replace(
        'return {',
        '// lowcode-model-variable\nreturn {',
      );
    }
    modelFileContentOld = modelFileContentOld.replace(
      '// lowcode-model-variable',
      modelVariable,
    );

    if (!modelFileContentOld.includes('// lowcode-model-return-variable')) {
      modelFileContentOld = modelFileContentOld.replace(
        'return {',
        'return {\n// lowcode-model-return-variable',
      );
    }
    modelFileContentOld = modelFileContentOld.replace(
      '// lowcode-model-return-variable',
      modelReturnVariable,
    );

    fs.writeFileSync(
      path.join(createBlockPath, 'model.ts'),
      modelFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.model.ts'));
    try {
      execa.sync('node', [
        path.join(workspace.rootPath!, '/node_modules/eslint/bin/eslint.js'),
        path.join(createBlockPath, 'model.ts'),
        '--resolve-plugins-relative-to',
        workspace.rootPath!,
        '--fix',
      ]);
    } catch (err) {
      console.log(err);
    }
    // #endregion

    // #region 更新 service.ts 文件
    const serviceFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.service.ts').toString())
      .toString();
    let serviceFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'service.ts').toString())
      .toString()
      .trim();

    const serviceSplitArr = serviceFileContent.split(
      new RegExp(
        ['// lowcode-service-import-api', '// lowcode-service-method'].join(
          '|',
        ),
        'ig',
      ),
    );
    const serviceImportApi = serviceSplitArr[1].replace(/\n/g, '');
    const serviceMethod = serviceSplitArr[2];
    if (!serviceFileContentOld.includes('// lowcode-service-import-api')) {
      serviceFileContentOld = `// lowcode-service-import-api\n${serviceFileContentOld}`;
    }
    serviceFileContentOld = serviceFileContentOld.replace(
      '// lowcode-service-import-api',
      serviceImportApi,
    );

    if (!serviceFileContentOld.includes('// lowcode-service-method')) {
      serviceFileContentOld = `${serviceFileContentOld.slice(
        0,
        serviceFileContentOld.length - 1,
      )}// lowcode-service-method\n}`;
    }
    serviceFileContentOld = serviceFileContentOld.replace(
      '// lowcode-service-method',
      serviceMethod,
    );
    fs.writeFileSync(
      path.join(createBlockPath, 'service.ts'),
      serviceFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.service.ts'));
    try {
      execa.sync('node', [
        path.join(workspace.rootPath!, '/node_modules/eslint/bin/eslint.js'),
        path.join(createBlockPath, 'service.ts'),
        '--resolve-plugins-relative-to',
        workspace.rootPath!,
        '--fix',
      ]);
    } catch (err) {
      console.log(err);
    }
    // #endregion

    // #region 更新 index.vue 文件
    const vueFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.index.vue').toString())
      .toString();

    let vueFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'index.vue').toString())
      .toString();

    const vueSplitArr = vueFileContent.split(
      new RegExp(['<!-- lowcode-vue-template -->'].join('|'), 'ig'),
    );
    const vueTemplate = vueSplitArr[1];

    if (!vueFileContentOld.includes('<!-- lowcode-vue-template -->')) {
      const index = vueFileContentOld.lastIndexOf('</template>');
      vueFileContentOld = `${vueFileContentOld.substring(
        0,
        index,
      )}<!-- lowcode-vue-template -->${vueFileContentOld.substring(index)}`;
    }
    vueFileContentOld = vueFileContentOld.replace(
      '<!-- lowcode-vue-template -->',
      vueTemplate,
    );

    fs.writeFileSync(
      path.join(createBlockPath, 'index.vue'),
      vueFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.index.vue'));
    try {
      execa.sync('node', [
        path.join(workspace.rootPath!, '/node_modules/eslint/bin/eslint.js'),
        path.join(createBlockPath, 'index.vue'),
        '--resolve-plugins-relative-to',
        workspace.rootPath!,
        '--fix',
      ]);
    } catch (err) {
      console.log(err);
    }
    // #endregion

    // #region 更新 mock 服务
    const mockType = fs
      .readFileSync(path.join(createBlockPath, 'temp.mock.type').toString())
      .toString();
    fs.removeSync(path.join(createBlockPath, 'temp.mock.type'));
    const { mockCode, mockData } = typescriptToMock(mockType);
    const mockTemplate = fs
      .readFileSync(
        path.join(createBlockPath, 'temp.mock.script.ejs').toString(),
      )
      .toString();
    fs.removeSync(path.join(createBlockPath, 'temp.mock.script.ejs'));
    const mockScript = ejs.render(mockTemplate, {
      ...lowcodeContext!.model,
      mockCode,
      mockData,
      createBlockPath: createBlockPath.replace(':', ''),
    });
    const mockProjectPathRes = await axios
      .get('http://localhost:3001/mockProjectPath', { timeout: 1000 })
      .catch(() => {
        window.showErrorMessage('获取 mock 项目路径失败');
      });
    if (mockProjectPathRes?.data.result) {
      const projectName = workspace.rootPath
        ?.replace(/\\/g, '/')
        .split('/')
        .pop();
      const mockRouteFile = path.join(
        mockProjectPathRes.data.result,
        `${projectName}.js`,
      );
      let mockFileContent = `
			import KoaRouter from 'koa-router';
			import proxy from '../middleware/Proxy';
			import { delay } from '../lib/util';

			const Mock = require('mockjs');

			const { Random } = Mock;

			const router = new KoaRouter();
			router{{mockScript}}
			module.exports = router;
			`;

      if (fs.existsSync(mockRouteFile)) {
        mockFileContent = fs.readFileSync(mockRouteFile).toString().toString();
        const index = mockFileContent.lastIndexOf(')') + 1;
        mockFileContent = `${mockFileContent.substring(
          0,
          index,
        )}{{mockScript}}\n${mockFileContent.substring(index)}`;
      }
      mockFileContent = mockFileContent.replace(/{{mockScript}}/g, mockScript);
      fs.writeFileSync(mockRouteFile, mockFileContent);
      try {
        execa.sync('node', [
          path.join(
            mockProjectPathRes.data.result
              .replace(/\\/g, '/')
              .replace('/src/routes', ''),
            '/node_modules/eslint/bin/eslint.js',
          ),
          mockRouteFile,
          '--resolve-plugins-relative-to',
          mockProjectPathRes.data.result
            .replace(/\\/g, '/')
            .replace('/src/routes', ''),
          '--fix',
        ]);
      } catch (err) {
        console.log(err);
      }
      // #endregion
    }
  }
}
