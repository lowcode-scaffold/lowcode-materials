import * as path from 'path';
import glob from 'glob';
import * as execa from 'execa';

export async function lint(option: {
  createBlockPath: string;
  rootPath: string;
}) {
  const { createBlockPath, rootPath } = option;
  return new Promise<void>((resolve, reject) => {
    glob(
      '**',
      {
        cwd: createBlockPath,
        ignore: ['node_modules/**'],
        nodir: true,
        dot: true,
      },
      (err, files) => {
        if (err) {
          return reject(err);
        }
        Promise.all(
          files.map((file) => {
            try {
              execa.sync('node', [
                path.join(rootPath, '/node_modules/eslint/bin/eslint.js'),
                path.join(createBlockPath, file),
                '--resolve-plugins-relative-to',
                rootPath,
                '--fix',
              ]);
            } catch (e) {
              console.log(e);
            }
          }),
        )
          .then(() => resolve())
          .catch(reject);
      },
    );
  });
}
