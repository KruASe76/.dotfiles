/*
 * Primary Input on LockScreen extension for GNOME Shell 45+
 * Copyright 2023 Paulo Fino (@somepaulo) with help from Just Perfection (@jrahmatzadeh), 2022 Sagi (@sagidayan)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * If this extension breaks your desktop you get to keep all of the pieces...
 */

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as KeyboardStatus from 'resource:///org/gnome/shell/ui/status/keyboard.js';

export default class PrimaryInputOnLockScreen {
    enable() {
        this.setPrimaryOnLock();
        this._sessionId = Main.sessionMode.connect(
            'updated',
            this.setPrimaryOnLock.bind(this)
        );
    }
    
    disable() {
        /*
        // This extensions uses the `unlock-dialog` session mode
        // because it only needs to operate on the unlock screen
        // in order to check and change the current keyboard layout.
        // However, it also uses `user` session mode to avoid confusing
        // users by appearing disabled in extension management interfaces.
        */
        if (this._sessionId) {
            Main.sessionMode.disconnect(this._sessionId);
            this._sessionId = null;
        }
    }
    
    setPrimaryOnLock() {
        if (!Main.sessionMode.isLocked) {
            return;
        }
        const inputSourceManager = KeyboardStatus.getInputSourceManager();
        const primaryInput = inputSourceManager.inputSources["0"];
        const currentInput = inputSourceManager.currentSource;
        if (currentInput != primaryInput) {
            primaryInput.activate();
        }
    }
}
