import * as path from 'path';
import * as fs from 'fs-extra';
import { context } from './context';

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
      )}// lowcode-service-import-api\n}`;
    }
    serviceFileContentOld = serviceFileContentOld.replace(
      '// lowcode-service-import-api',
      serviceMethod,
    );
    fs.writeFileSync(
      path.join(createBlockPath, 'service.ts'),
      serviceFileContentOld,
    );
    fs.removeSync(path.join(createBlockPath, 'temp.service.ts'));

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
    // #endregion
  }
}
