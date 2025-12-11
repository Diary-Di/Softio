import { AuthProvider } from "@/hooks/useAuth";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* autres routes */}
      </Stack>
    </AuthProvider>
  );
}
