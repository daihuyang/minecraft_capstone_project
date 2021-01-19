import { app, Menu } from 'electron';

export function setDefaultAppMenu() {
    // For mac keyboard shortcuts to work the appropriate action must exist in the app menu, so build it
    const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: 'Edit',
          submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
          ]
        }
    ];
    if(process.platform == 'darwin') {
        // Splits into two menus 'AI Connection for Minecraft' and 'Edit' to look more like a normal app
        template.unshift({
            label: app.getName(),
            submenu: [
                {role: 'about'},
                {type: 'separator'},
                {role: 'hide'},
                {role: 'hideothers'},
                {role: 'unhide'},
                {type: 'separator'},
                {role: 'quit'}
            ]
        });
    }
    let appMenu: Electron.Menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(appMenu);
}