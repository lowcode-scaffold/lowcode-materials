import * as path from 'path';
import * as fs from 'fs-extra';
import { window } from 'vscode';
import { context } from './context';
import { generalBasic } from '../../../../../share/BaiduOCR/index';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { IFormItems } from '../../config/schema';

export async function handleOCR() {
  const { lowcodeContext } = context;
  if (!lowcodeContext?.clipboardImage) {
    window.showInformationMessage('剪贴板里没有截图');
    return {
      updateModelImmediately: false,
      onlyUpdateParams: true,
      params: '',
      model: lowcodeContext?.model,
    };
  }
  const ocrRes = await generalBasic({ image: lowcodeContext!.clipboardImage! });
  return {
    updateModelImmediately: false,
    onlyUpdateParams: true,
    params: ocrRes.words_result.map((s) => s.words).join('\r\n'),
    model: lowcodeContext?.model,
  };
}

const scriptHandle: {
  [method: string]: () => Promise<{
    updateModelImmediately: boolean;
    onlyUpdateParams: boolean;
    params?: string;
    model: any;
  }>;
} = {
  askChatGPT: async () => {
    const { lowcodeContext } = context;
    const schema = fs.readFileSync(
      path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
      'utf8',
    );
    const typeName = 'IFormItems';
    const res = await translate<IFormItems>({
      schema,
      typeName,
      request: JSON.stringify(
        (lowcodeContext!.model as { formItems: IFormItems }).formItems,
      ),
      completePrompt:
        `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
        `\`\`\`\n${schema}\`\`\`\n` +
        `以下是用户请求:\n` +
        `"""\n${JSON.stringify(
          (lowcodeContext!.model as { formItems: IFormItems }).formItems,
        )}\n"""\n` +
        `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
      createChatCompletion: lowcodeContext!.createChatCompletion,
      showWebview: true,
      extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
    });
    lowcodeContext!.outputChannel.appendLine(JSON.stringify(res, null, 2));
    if (res.success) {
      return {
        updateModelImmediately: false,
        onlyUpdateParams: false,
        params: '',
        model: { ...lowcodeContext?.model, formItems: res.data },
      };
    }
    return {
      updateModelImmediately: false,
      onlyUpdateParams: false,
      params: '',
      model: lowcodeContext?.model,
    };
  },
};

export async function handleRunScript() {
  const { lowcodeContext } = context;
  const res = await scriptHandle[lowcodeContext!.method]();
  return res;
}

export async function handleComplete() {
  const createBlockPath = context.lowcodeContext?.createBlockPath;
  if (createBlockPath) {
    // #region 更新 model.ts 文件
    const modelFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.model.ts'))
      .toString();
    let modelFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'model.ts'))
      .toString();

    const keywords = [
      '// lowcode-model-type',
      '// lowcode-model-defalut-data',
      '// lowcode-model-variable',
      '// lowcode-model-return-variable',
    ];
    const modelSplitArr = modelFileContent.split(
      new RegExp(keywords.join('|'), 'ig'),
    );
    const modelType = modelSplitArr[1];
    const modelDefaultData = modelSplitArr[2];
    const modelVariable = modelSplitArr[3];
    const modelReturnVariable = modelSplitArr[4].replace(/\n/g, '');

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

    if (!modelFileContentOld.includes('// lowcode-model-defalut-data')) {
      modelFileContentOld = modelFileContentOld.replace(
        'export const useModel',
        '// lowcode-model-defalut-data\nexport const useModel',
      );
    }
    modelFileContentOld = modelFileContentOld.replace(
      '// lowcode-model-defalut-data',
      modelDefaultData,
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
      .readFileSync(path.join(createBlockPath, 'temp.service.ts'))
      .toString();
    let serviceFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'service.ts'))
      .toString()
      .trim();

    const serviceSplitArr = serviceFileContent.split(
      new RegExp(['// lowcode-service-method'].join('|'), 'ig'),
    );
    const serviceMethod = serviceSplitArr[1];
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

    // #region 更新 presenter 文件
    const presenterFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.presenter.ts'))
      .toString();

    let presenterFile = path.join(createBlockPath, 'presenter.ts');
    if (!fs.existsSync(presenterFile)) {
      presenterFile = path.join(createBlockPath, 'presenter.tsx');
    }
    let presenterFileContentOld = fs.readFileSync(presenterFile).toString();

    const presenterSplitArr = presenterFileContent.split(
      new RegExp(
        ['// lowcode-presenter-variable', '// lowcode-presenter-return'].join(
          '|',
        ),
        'ig',
      ),
    );
    const presenterVariable = presenterSplitArr[1];
    const presenterReturn = presenterSplitArr[2];

    if (!presenterFileContentOld.includes('// lowcode-presenter-variable')) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        `// lowcode-presenter-variable\nreturn {`,
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-variable',
      presenterVariable,
    );

    if (!presenterFileContentOld.includes('// lowcode-presenter-return')) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        'return {\n// lowcode-presenter-return',
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-return',
      presenterReturn,
    );
    fs.writeFileSync(presenterFile, presenterFileContentOld);
    fs.removeSync(path.join(createBlockPath, 'temp.presenter.ts'));
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
        ['<!-- lowcode-vue-template -->', '// lowcode-vue-import'].join('|'),
        'ig',
      ),
    );
    const vueTemplate = vueSplitArr[1];
    const vueImport = vueSplitArr[2];

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

    if (!vueFileContentOld.includes('lowcode-vue-import')) {
      vueFileContentOld = vueFileContentOld.replace(
        '<script lang="ts" setup>',
        `<script lang="ts" setup>\n// lowcode-vue-import`,
      );
    }
    vueFileContentOld = vueFileContentOld.replace(
      '// lowcode-vue-import',
      vueImport,
    );

    fs.writeFileSync(
      path.join(createBlockPath, 'index.vue'),
      vueFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.index.vue'));
    // #endregion
  }
}
