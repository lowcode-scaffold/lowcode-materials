import * as path from 'path';
import * as fs from 'fs';
import { workspace } from 'vscode';

export const getFileContent = (filePath: string, fullPath = false) => {
  let fileContent = '';
  const fileFullPath = fullPath
    ? filePath
    : path.join(path.join(workspace.rootPath || ''), filePath);
  try {
    const fileBuffer = fs.readFileSync(fileFullPath);
    fileContent = fileBuffer.toString();
  } catch (error) {}
  return fileContent;
};
