import events from "../events";

/**
 * Plugin system events
 */
export const pluginEvents = {
  // Lifecycle events
  beforeLoad: "plugin:beforeLoad",
  afterLoad: "plugin:afterLoad",
  loadError: "plugin:loadError",

  // Installation events
  beforeInstall: "plugin:beforeInstall",
  afterInstall: "plugin:afterInstall",
  installError: "plugin:installError",

  // Activation events
  beforeActivate: "plugin:beforeActivate",
  afterActivate: "plugin:afterActivate",
  activateError: "plugin:activateError",

  // Deactivation events
  beforeDeactivate: "plugin:beforeDeactivate",
  afterDeactivate: "plugin:afterDeactivate",
  deactivateError: "plugin:deactivateError",

  // Uninstallation events
  beforeUninstall: "plugin:beforeUninstall",
  afterUninstall: "plugin:afterUninstall",
  uninstallError: "plugin:uninstallError",

  // Registration events
  menuItemRegistered: "plugin:menuItemRegistered",
  settingsPanelRegistered: "plugin:settingsPanelRegistered",
  editorExtensionRegistered: "plugin:editorExtensionRegistered",
  routeRegistered: "plugin:routeRegistered",
};

/**
 * Subscribe to a plugin event
 * @param event The event name to subscribe to
 * @param callback The callback function to execute when the event is triggered
 * @returns A function to unsubscribe from the event
 */
export const onPluginEvent = (
  event: string,
  callback: (...args: any[]) => void,
) => {
  return events.on(event, callback);
};

/**
 * Emit a plugin event
 * @param event The event name to emit
 * @param args The arguments to pass to the event callbacks
 */
export const emitPluginEvent = (event: string, ...args: any[]) => {
  events.emit(event, ...args);
};
