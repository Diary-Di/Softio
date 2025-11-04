import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { styles } from "./../styles/loginStyles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define your navigation type
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const handleLogin = () => {
    if (!email || !password) {
      setMessageType("error");
      setMessage("Please enter both email and password.");
      return;
    }

    if (email === "admin@gmail.com" && password === "123456") {
      setMessageType("success");
      setMessage("Login successful!");
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1000);
    } else {
      setMessageType("error");
      setMessage("Invalid credentials. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Welcome Back 👋</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={22} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={22} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Message Display */}
        {message ? (
          <Text
            style={[
              styles.message,
              messageType === "error" ? styles.error : styles.success,
            ]}
          >
            {message}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
