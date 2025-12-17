/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, shell, screen, ipcMain } from 'electron';
import { MainProcess } from './MainProcess';
import { MAINWINDOW_MESSAGES } from '../shared/ipcMessages';
// 【新增】匯入 fs 和 path 模組
import * as fs from 'fs';
import * as path from 'path';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

app
  .whenReady()
  .then(() => {
    const mainProcess = new MainProcess(
      screen.getPrimaryDisplay().workArea.width,
      screen.getPrimaryDisplay().workArea.height,
    );

    ipcMain.handle(
      MAINWINDOW_MESSAGES.GET_BROWSER_WINDOWHWND_HANDLE,
      async () => {
        console.log('[Get BrowserWindow HWND] catched by ipcMain');
        const mainWindow = mainProcess.getMainWindow();
        let hwnd: number;
        if (mainWindow) {
          hwnd = parseInt(
            mainWindow.getNativeWindowHandle().reverse().toString('hex'),
            16,
          );
        } else {
          console.log('[Get BrowserWindow HWND] mainWindow is null');
          hwnd = 0;
        }
        return hwnd;
      },
    );

    ipcMain.on(MAINWINDOW_MESSAGES.ENTER_BUTTON, () => {
      mainProcess.enterButton();
    });

    ipcMain.on(MAINWINDOW_MESSAGES.LEAVE_BUTTON, () => {
      mainProcess.leaveButton();
    });

    ipcMain.on(MAINWINDOW_MESSAGES.OPEN_EXTERNAL_LINK, (event, url) => {
      console.log('[Open External Link] catched by ipcMain');
      shell.openExternal(url);
    });
    
    ipcMain.on(MAINWINDOW_MESSAGES.SHOW_WINDOW, () => {
      console.log('[Show Window] catched by ipcMain');
      mainProcess.showAllWindows();
    });

    ipcMain.on(MAINWINDOW_MESSAGES.HIDE_WINDOW, () => {
      console.log('[Hide Window] catched by ipcMain');
      mainProcess.hideAllWindows();
    });

    ipcMain.on('close-window', async () => {
      console.log('[Close window] catched by ipcMain');
      mainProcess.getMainWindow()?.webContents.send('close');
      mainProcess.getMainWindow()?.close();
      app.quit();
    });
    // 【新增】監聽 'save-comments' 事件並寫入檔案
    ipcMain.on('save-comments', (event, data) => {
      console.log('[Main] 收到儲存註解請求，資料長度:', data.length);

      try {
        // 1. 定義檔案路徑
        // 注意：在開發模式下，這會指向您的 src 資料夾
        // 在打包後的 Production 模式，通常不能寫入 src，建議改用 app.getPath('userData')
        const dataPath =
          process.env.NODE_ENV === 'development'
            ? path.join(__dirname, '../../src/renderer/data/comments.json')
            : path.join(app.getPath('userData'), 'comments.json');

        // 2. 確保資料夾存在 (如果是開發模式)
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // 3. 寫入 JSON 檔案
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

        console.log('[Main] 註解已成功寫入:', dataPath);
      } catch (err) {
        console.error('[Main] 寫入註解失敗:', err);
      }
    });
  })
  .catch(console.log);

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
