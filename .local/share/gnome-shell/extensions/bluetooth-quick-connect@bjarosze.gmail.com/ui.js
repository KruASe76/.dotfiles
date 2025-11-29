// Copyright 2018 Bartosz Jaroszewski
// SPDX-License-Identifier: GPL-2.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import St from "gi://St";
import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
class PopupSwitchWithButtonMenuItem extends PopupMenu.PopupSwitchMenuItem {
  _client;
  _logger;
  _device;
  _showRefreshButton;
  _closeMenuOnAction;
  _refreshButton;
  _pendingLabel;
  _batteryInfo;
  _afterReconnectTimeout = null;
  _afterToggleTimeout = null;
  _reconnectTimeout = null;
  constructor(client, device, logger, params) {
    const label = device.alias || device.name || "(unknown)";
    super(label, device.connected);
    this._handleIcon(device);
    this._client = client;
    this._logger = logger;
    this._device = device;
    this._showRefreshButton = params.showRefreshButton;
    this._closeMenuOnAction = params.closeMenuOnAction;
    this.actor.labelActor.xExpand = true;
    this.actor._statusBin.xExpand = false;
    this._refreshButton = this._buildRefreshButton();
    this._pendingLabel = this._buildPendingLabel();
    this._connectToggledEvent();
    this._batteryInfo = new BatteryInfoWidget(params.showBatteryValue, params.showBatteryIcon);
    this.insert_child_at_index(this._batteryInfo, this.get_n_children() - 1);
    this.insert_child_at_index(this._refreshButton, this.get_n_children() - 1);
    this.add_child(this._pendingLabel);
    this.sync(device);
  }
  _handleIcon(device) {
    if (!device.icon) return;
    const deviceIcon = new St.Icon({
      styleClass: "popup-menu-icon",
      iconName: device.icon
    });
    this.insert_child_at_index(deviceIcon, 1);
  }
  disconnectSignals() {
    if (this._afterReconnectTimeout != null) {
      GLib.Source.remove(this._afterReconnectTimeout);
      this._afterReconnectTimeout = null;
    }
    if (this._afterToggleTimeout != null) {
      GLib.Source.remove(this._afterToggleTimeout);
      this._afterToggleTimeout = null;
    }
  }
  sync(device) {
    this.disconnectSignals();
    this._batteryInfo.visible = false;
    this._device = device;
    this.setToggleState(device.connected);
    this.visible = device.paired;
    if (this._showRefreshButton && device.connected) this._refreshButton.show();
    else this._refreshButton.hide();
    this._disablePending();
    if (device.connected) {
      if (device.batteryPercentage && device.batteryPercentage > 0) {
        this._batteryInfo.show();
        this._logger.log(
          `Battery percentage ${device.alias || device.name}: ${device.batteryPercentage}`
        );
        this._batteryInfo.setPercentage(device.batteryPercentage);
      }
    }
  }
  _buildRefreshButton() {
    const icon = new St.Icon({
      iconName: "view-refresh",
      styleClass: "popup-menu-icon",
      opacity: 155
    });
    const button = new St.Button({
      child: icon,
      xAlign: 2
      // Align.END
    });
    button.connect("enter-event", (widget) => {
      widget.child.ease({
        opacity: 255,
        time: 0.05,
        transition: Clutter.AnimationMode.LINEAR
      });
    });
    button.connect("leave-event", (widget) => {
      widget.child.ease({
        opacity: 155,
        time: 0.05,
        transition: Clutter.AnimationMode.LINEAR
      });
    });
    button.connect("clicked", () => {
      this._enablePending();
      this._logger.log(`Reconnecting to ${this._device.alias || this._device.name}`);
      this._client.connect_service(this._device.get_object_path(), false, null, () => {
        this._reconnectTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 7e3, () => {
          this._logger.log(`Trying to Reconnect to ${this._device.alias || this._device.name}`);
          this._client.connect_service(this._device.get_object_path(), true, null, () => {
          });
          this._logger.log(`Reconnected to ${this._device.alias || this._device.name}`);
          this.sync(this._device);
          return GLib.SOURCE_REMOVE;
        });
      });
      this._afterReconnectTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1e4, () => {
        this._disablePending();
        this._afterReconnectTimeout = null;
        return GLib.SOURCE_REMOVE;
      });
      if (this._closeMenuOnAction) this.emit("activate", Clutter.get_current_event());
    });
    return button;
  }
  _buildPendingLabel() {
    const label = new St.Label({ text: _("Wait") });
    label.hide();
    return label;
  }
  _connectToggledEvent() {
    this.connect("toggled", (item, state) => {
      this._client.connect_service(this._device.get_object_path(), state, null, () => {
      });
      this._afterToggleTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1e4, () => {
        this._disablePending();
        this._afterToggleTimeout = null;
        return GLib.SOURCE_REMOVE;
      });
    });
  }
  activate(event) {
    if (this.actor._switch.mapped) {
      this.toggle();
      this.actor._switch.toggle();
    }
    if (event.type() === Clutter.EventType.KEY_PRESS && event.get_key_symbol() === Clutter.KEY_space)
      return;
    if (this._closeMenuOnAction) this.emit("activate", event);
  }
  toggle() {
    super.toggle();
    this._enablePending();
  }
  _enablePending() {
    this._refreshButton.reactive = false;
    this.actor._switch.hide();
    this._pendingLabel.show();
    this.reactive = false;
  }
  _disablePending() {
    this._refreshButton.reactive = true;
    this.actor._switch.show();
    this._pendingLabel.hide();
    this.reactive = true;
  }
  destroy() {
    if (this._reconnectTimeout) {
      GLib.Source.remove(this._reconnectTimeout);
      this._reconnectTimeout = null;
    }
    this.disconnectSignals();
    super.destroy();
  }
}
const PopupBluetoothDeviceMenuItem = GObject.registerClass(PopupSwitchWithButtonMenuItem);
class BatteryInfoWidgetClass extends St.BoxLayout {
  _icon;
  _label;
  constructor(showBatteryValue, showBatteryIcon) {
    super({ visible: false, style: "spacing: 3px;" });
    this._icon = new St.Icon({ styleClass: "popup-menu-icon" });
    this.add_child(this._icon);
    this._icon.iconName = "battery-missing-symbolic";
    this._label = new St.Label({
      xAlign: Clutter.ActorAlign.START,
      yAlign: Clutter.ActorAlign.CENTER,
      text: "100%",
      styleClass: "monospace"
    });
    this._label.naturalWidth = this._label.width;
    this._label.text = "";
    this.add_child(this._label);
    if (!showBatteryValue) this._label.hide();
    if (!showBatteryIcon) this._icon.hide();
  }
  setPercentage(value) {
    if (value == null) {
      this._label.text = "";
      this._icon.iconName = "battery-missing-symbolic";
    } else {
      this._label.text = `${value}%`;
      const fillLevel = 10 * Math.floor(value / 10);
      const iconName = `battery-level-${fillLevel}-symbolic`;
      this._icon.iconName = iconName;
    }
  }
}
const BatteryInfoWidget = GObject.registerClass(BatteryInfoWidgetClass);
export {
  PopupBluetoothDeviceMenuItem,
  PopupSwitchWithButtonMenuItem
};
