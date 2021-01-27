"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function setDefaultAppMenu() {
    // For mac keyboard shortcuts to work the appropriate action must exist in the app menu, so build it
    const template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        }
    ];
    if (process.platform == 'darwin') {
        // Splits into two menus 'AI Connection for Minecraft' and 'Edit' to look more like a normal app
        template.unshift({
            label: electron_1.app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }
    let appMenu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(appMenu);
}
exports.setDefaultAppMenu = setDefaultAppMenu;
//# sourceMappingURL=DefaultAppMenu.js.map