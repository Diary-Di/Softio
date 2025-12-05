// app/index.tsx
import { Redirect } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';

export default function Index() {
  
  //useKeepAwake
  //return <Redirect href="/(auth)/login" />;
  return <Redirect href="/dashboard" />;
}
