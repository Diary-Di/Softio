import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { styles } from "./../styles/loginStyles";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome Back 👋</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Image 
            source={require('../../assets/icons/mail.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Image 
            source={require('../../assets/icons/lock.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          activeOpacity={0.8}
        >
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