import { AuthProvider } from "@/hooks/useAuth";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/" />
      <Stack.Screen name="dashboard" />
    </Stack>
    </AuthProvider>
  );
}
