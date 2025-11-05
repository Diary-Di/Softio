import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 40,
    textAlign: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  inputContainerFocused: {
    borderColor: "#007bff",
    borderWidth: 2,
    shadowColor: "#007bff",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 12,
    tintColor: "#888",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
    paddingRight: 8,
    borderWidth: 0,
    outlineWidth: 0,
    ...Platform.select({
      android: {
        underlineColorAndroid: 'transparent',
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
    }),
  },

  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },

  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: "#888",
  },

  button: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
  },

  buttonDisabled: {
    backgroundColor: "#cccccc", // Gray background when disabled
    shadowOpacity: 0, // Remove shadow when disabled
    elevation: 0, // Remove elevation when disabled
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  buttonTextDisabled: {
    color: "#888888", // Gray text when disabled
  },

  message: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  error: {
    color: "#e63946",
  },

  success: {
    color: "#2a9d8f",
  },
});