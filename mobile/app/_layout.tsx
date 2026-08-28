import { Stack } from "expo-router";
import { configureSafeNotificationRouting } from "../src/push";
configureSafeNotificationRouting();
export default function Layout() { return <Stack screenOptions={{ headerShown: true }}><Stack.Screen name="index" options={{ title: "Sanfaani Store" }} /><Stack.Screen name="catalogue" options={{ title: "Catalogue" }} /><Stack.Screen name="cart" options={{ title: "Cart" }} /><Stack.Screen name="checkout" options={{ title: "Checkout" }} /><Stack.Screen name="orders" options={{ title: "Orders" }} /><Stack.Screen name="repairs" options={{ title: "Repairs" }} /><Stack.Screen name="account" options={{ title: "Account" }} /></Stack>; }
