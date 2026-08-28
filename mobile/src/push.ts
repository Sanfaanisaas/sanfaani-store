import * as Notifications from "expo-notifications";
export async function requestNotificationPermissionAtContextualMoment() { const current = await Notifications.getPermissionsAsync(); if (current.status === "granted") return true; const result = await Notifications.requestPermissionsAsync(); return result.status === "granted"; }
/** Registration remains disabled until the backend exposes a device-token contract. */
export async function registerDeviceTokenWhenSupported() { return { registered: false, reason: "backend_device_registration_endpoint_unavailable" as const }; }
export function configureSafeNotificationRouting() { Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) }); }
