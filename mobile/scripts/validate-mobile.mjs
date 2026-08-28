import { readFileSync } from "node:fs";
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))); const app=JSON.parse(readFileSync(new URL('../app.json',import.meta.url))); if(pkg.main!=="expo-router/entry"||app.expo.scheme!=="sanfaani") throw new Error("Expo app configuration is invalid"); console.log("Expo configuration validated: " + app.expo.slug);
