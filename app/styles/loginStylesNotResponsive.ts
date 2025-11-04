import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Main container that adapts to any screen
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  // Scroll content centered and responsive
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  // Title at top
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 40,
    textAlign: "center",
  },

  // Each input field container with icon
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 15,
    width: width * 0.9, // 90% of screen width
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2, // for Android shadow
  },

  // The icon inside the input
  icon: {
    marginRight: 10,
  },

  // Input text
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },

  // Login button
  button: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.9,
    marginTop: 10,
    shadowColor: "#007bff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // Message section
  message: {
    marginTop: 15,
    fontSize: 15,
    textAlign: "center",
  },

  error: {
    color: "#e63946",
  },

  success: {
    color: "#2a9d8f",
  },
});
