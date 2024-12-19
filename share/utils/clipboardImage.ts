import * as path from 'path';
import { spawn } from 'child_process';
import { homedir } from 'os';
import * as fs from 'fs-extra';

const saveClipboardImageToPath = (projectPath: string, imagePath: string) => {
  return new Promise<string>((resolve, reject) => {
    const { platform } = process;
    if (platform === 'win32') {
      // Windows
      const scriptPath = path.join(
        projectPath,
        '/scripts/ClipboardImage/pc.ps1',
      );

      let command =
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
      const powershellExisted = fs.existsSync(command);
      if (!powershellExisted) {
        command = 'powershell';
      }

      const powershell = spawn(command, [
        '-noprofile',
        '-noninteractive',
        '-nologo',
        '-sta',
        '-executionpolicy',
        'unrestricted',
        '-windowstyle',
        'hidden',
        '-file',
        scriptPath,
        imagePath,
      ]);
      powershell.on('error', (e: { code: string }) => {
        if (e.code === 'ENOENT') {
          reject(
            `The powershell command is not in you PATH environment variables. Please add it and retry.`,
          );
        } else {
          reject(e);
        }
      });
      powershell.on('exit', (code, signal) => {
        // console.log('exit', code, signal);
      });
      powershell.stdout.on('data', (data: Buffer) => {
        // cb(imagePath, data.toString().trim());
        resolve(imagePath);
      });
    } else if (platform === 'darwin') {
      // Mac
      const scriptPath = path.join(
        projectPath,
        '/scripts/ClipboardImage/mac.applescript',
      );

      const ascript = spawn('osascript', [scriptPath, imagePath]);
      ascript.on('error', (e) => {
        reject(e);
      });
      ascript.on('exit', (code, signal) => {
        // console.log('exit',code,signal);
      });
      ascript.stdout.on('data', (data: Buffer) => {
        // cb(imagePath, data.toString().trim());
        resolve(imagePath);
      });
    } else {
      // Linux
      const scriptPath = path.join(
        projectPath,
        '/scripts/ClipboardImage/linux.sh',
      );

      const ascript = spawn('sh', [scriptPath, imagePath]);
      ascript.on('error', (e) => {
        reject(e);
      });
      ascript.on('exit', (code, signal) => {
        // console.log('exit',code,signal);
      });
      ascript.stdout.on('data', (data: Buffer) => {
        const result = data.toString().trim();
        if (result === 'no xclip') {
          reject('You need to install xclip command first.');
        }
        resolve(imagePath);
        // cb(imagePath, result);
      });
    }
  });
};

export const getClipboardImage = async (projectPath: string) => {
  const imagePath = path.join(homedir(), '.lowcode', 'clipboardImage.png');
  if (fs.existsSync(imagePath)) {
    fs.removeSync(imagePath);
  }
  await saveClipboardImageToPath(projectPath, imagePath);
  if (fs.existsSync(imagePath)) {
    const base64 = fs.readFileSync(imagePath, 'base64');
    return `data:image/png;base64,${base64}`;
  }
  return '';
};
