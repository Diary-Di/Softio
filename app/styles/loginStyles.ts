import { StyleSheet, Platform, Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    minHeight: height,
  },

  // Logo container at the top
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },

  logo: {
    width: 200,
    height: 80,
  },

  // Form container in the center
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    width: "100%",
  },

  // Instruction text above inputs - Increased size
  instructionText: {
    fontSize: 20, // Increased from 16 to 20
    color: "#333", // Changed from #666 to #333 for better contrast
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 26, // Increased line height for better readability
    width: "100%",
    fontWeight: "600", // Added semi-bold for better visibility
  },

  // ... rest of the styles remain the same
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
    maxWidth: 400,
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

  // Forgot password link
  forgotPasswordContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
    marginTop: -5,
    alignItems: "flex-end",
  },

  forgotPasswordText: {
    color: "#e63946",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },

  button: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    maxWidth: 400,
  },

  buttonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  buttonTextDisabled: {
    color: "#888888",
  },

  // Google button styles
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
  },

  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },

  googleIcon: {
    width: 20,
    height: 20,
  },

  // Divider styles
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },

  dividerText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 15,
  },

  // Bottom links container
  bottomLinksContainer: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },

  bottomText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  link: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },

  message: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    width: "100%",
  },

  error: {
    color: "#e63946",
  },

  success: {
    color: "#2a9d8f",
  },
});