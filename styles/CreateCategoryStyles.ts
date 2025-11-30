import { StyleSheet } from "react-native";

export const createCategoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
  },

  /** INPUTS */
  inputContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
  },

  inputFocused: {
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  input: {
    fontSize: 15,
    color: "#111",
  },

  /** BOUTONS */
  button: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#A0C8FF",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  /** MESSAGES */
  messageBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },

  successBox: {
    backgroundColor: "#E6F8E7",
    borderWidth: 1,
    borderColor: "#2ECC71",
  },

  errorBox: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },

  messageText: {
    fontSize: 14,
    fontWeight: "500",
  },

  successText: {
    color: "#2ECC71",
  },

  errorText: {
    color: "#FF3B30",
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
},

headerCenter: {
  flex: 1,
  alignItems: "center",
},

backButton: {
  marginRight: 8,
  padding: 4,
},

});

export default createCategoryStyles;
