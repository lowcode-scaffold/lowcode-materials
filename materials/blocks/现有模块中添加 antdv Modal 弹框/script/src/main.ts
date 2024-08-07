import * as path from 'path';
import * as fs from 'fs-extra';
import * as execa from 'execa';
import { workspace } from 'vscode';
import { context } from './context';

export async function handleComplete() {
  const createBlockPath = context.lowcodeContext?.createBlockPath;
  if (createBlockPath) {
    // #region 更新 model.ts 文件
    const modelFileContent = fs
      .readFileSync(path.join(createBlockPath, 'temp.model.ts'))
      .toString();
    let modelFileContentOld = fs
      .readFileSync(path.join(createBlockPath, 'model.ts').toString())
      .toString();

    const keywords = [
      '// lowcode-model-variable',
      '// lowcode-model-return-variable',
    ];
    const modelSplitArr = modelFileContent.split(
      new RegExp(keywords.join('|'), 'ig'),
    );

    const modelVariable = modelSplitArr[1];
    const modelReturnVariable = modelSplitArr[2].replace(/\n/g, '');

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
        [
          '// lowcode-presenter-handle',
          '// lowcode-presenter-return-handle',
        ].join('|'),
        'ig',
      ),
    );
    const presenterMethod = presenterSplitArr[1];
    const presenterReturnMethod = presenterSplitArr[2];

    if (!presenterFileContentOld.includes('// lowcode-presenter-handle')) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        `// lowcode-presenter-handle\nreturn {`,
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-handle',
      presenterMethod,
    );

    if (
      !presenterFileContentOld.includes('// lowcode-presenter-return-handle')
    ) {
      presenterFileContentOld = presenterFileContentOld.replace(
        'return {',
        'return {\n// lowcode-presenter-return-handle',
      );
    }
    presenterFileContentOld = presenterFileContentOld.replace(
      '// lowcode-presenter-return-handle',
      presenterReturnMethod,
    );
    fs.writeFileSync(presenterFile, presenterFileContentOld);
    fs.removeSync(path.join(createBlockPath, 'temp.presenter.ts'));
    try {
      execa.sync('node', [
        path.join(workspace.rootPath!, '/node_modules/eslint/bin/eslint.js'),
        presenterFile,
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
  }
}
