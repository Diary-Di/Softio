// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "./../styles/loginStyles";
import { loginUser, setAuthToken } from "./../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
      };

      const res = await loginUser(credentials);
      const token = res.data.token;

      // Save token locally (you can use SecureStore for better security)
      setAuthToken(token);

      setMessage("Connexion réussie ✅");
      Alert.alert("Succès", "Connexion réussie ✅");

      setTimeout(() => {
        router.replace("/dashboard"); // ✅ Redirect to dashboard after login
      }, 1000);
    } catch (err: any) {
      console.error("Erreur détaillée:", err.response);

      let errorMessage = "Impossible de se connecter";
      if (err.response?.status === 500 && err.response?.data?.message?.includes("Unknown column")) {
        errorMessage = "Erreur serveur : problème de configuration de la base de données.";
      } else if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(", ");
        errorMessage = `Erreur de validation : ${validationErrors}`;
      } else {
        errorMessage = err.response?.data?.message || err.response?.data?.error || errorMessage;
      }

      setMessage("Erreur : " + errorMessage);
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email.trim() !== "" && formData.password.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        editable={!loading}
      />

      <View style={{ height: 10 }} />

      <TouchableOpacity
        style={[
          styles.button,
          (!isFormValid || loading) && { backgroundColor: "#ccc" },
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter →</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Alert.alert("Mot de passe oublié")}>
        <Text style={styles.link}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Créer un compte</Text>
      </TouchableOpacity>

      {message !== "" && (
        <Text
          style={[
            styles.message,
            message.includes("Erreur") ? styles.error : styles.success,
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
