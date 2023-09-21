import * as path from 'path';
import * as fs from 'fs-extra';
import { env, window } from 'vscode';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { context } from './context';
import { IColumns } from '../../config/schema';

export async function handleAskChatGPT() {
  const { lowcodeContext } = context;
  // const res = await lowcodeContext!.createChatCompletion({
  //   messages: [
  //     {
  //       role: 'system',
  //       content: `你是一个严谨的代码机器人，严格按照输入的要求处理问题`,
  //     },
  //     {
  //       role: 'user',
  //       content: `${JSON.stringify(
  //         lowcodeContext!.model,
  //       )} 将这段 json 中，columns 字段中的 key、dataIndex 字段的值翻译为英文，使用驼峰语法。
  // 			返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
  //     },
  //   ],
  //   handleChunk: (data) => {
  //     // lowcodeContext.outputChannel.append(data.text || '')
  //   },
  // });
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const res = await translate<IColumns>({
    schema,
    typeName: 'IColumns',
    request: JSON.stringify(
      (lowcodeContext!.model as { columns: IColumns }).columns,
    ),
    completePrompt: '',
    createChatCompletion: lowcodeContext!.createChatCompletion,
    extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
  });
  lowcodeContext!.outputChannel.appendLine(JSON.stringify(res, null, 2));
  if (res.success) {
    return { ...lowcodeContext!.model, columns: res.data };
  }
  return lowcodeContext!.model;
}

export async function handleComplete() {
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

    // #endregion

    // #region 更新 presenter.tsx 文件
    const presenterFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.presenter.tsx').toString())
      .toString();
    let presenterFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'presenter.tsx').toString())
      .toString();

    const presenterSplitArr = presenterFileContent.split(
      new RegExp(
        [
          '// lowcode-presenter-handlePageChange',
          '// lowcode-presenter-return-handlePageChange',
        ].join('|'),
        'ig',
      ),
    );
    const presenterMethod = presenterSplitArr[1];
    const presenterReturnMethod = presenterSplitArr[2];

    if (
      !presenterFileContentOld.includes('// lowcode-presenter-handlePageChange')
    ) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        `// lowcode-presenter-handlePageChange\nreturn {`,
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-handlePageChange',
      presenterMethod,
    );

    if (
      !presenterFileContentOld.includes(
        '// lowcode-presenter-return-handlePageChange',
      )
    ) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        'return {\n// lowcode-presenter-return-handlePageChange',
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-return-handlePageChange',
      presenterReturnMethod,
    );
    fs.writeFileSync(
      path.join(createBlockPath, 'presenter.tsx'),
      presenterFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.presenter.tsx'));
    // #endregion

    // #region 更新 index.vue 文件
    const vueFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.index.vue').toString())
      .toString();

    let vueFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'index.vue').toString())
      .toString();

    const vueSplitArr = vueFileContent.split(
      new RegExp(
        ['<!-- lowcode-vue-template -->', '// lowcode-vue-columns'].join('|'),
        'ig',
      ),
    );
    const vueTemplate = vueSplitArr[1];
    const vueColumns = vueSplitArr[2];

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

    if (!vueFileContentOld.includes('// lowcode-vue-columns')) {
      vueFileContentOld = vueFileContentOld.replace(
        '</script>',
        `// lowcode-vue-columns\n</script>`,
      );
    }
    vueFileContentOld = vueFileContentOld.replace(
      '// lowcode-vue-columns',
      vueColumns,
    );

    fs.writeFileSync(
      path.join(createBlockPath, 'index.vue'),
      vueFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.index.vue'));
    // #endregion
  }
}
