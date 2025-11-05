import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Better scaling function that doesn't make things too big
const scaleSize = (size: number) => {
  const scaleFactor = width / 375; // 375 is base iPhone width
  // Use moderate scaling - less aggressive
  return size + (scaleFactor - 1) * size * 0.5;
};

// Or use this even simpler approach:
const responsiveSize = (size: number) => {
  return Math.min(size * (width / 375), size * 1.3); // Max 30% larger than base
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24, // Use fixed values instead of scaled
    paddingVertical: 40,
  },

  title: {
    fontSize: 28, // Fixed size
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
    width: "100%", // This will naturally be responsive
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  icon: {
    width: 22, // Fixed size
    height: 22,
    marginRight: 12,
    tintColor: "#888",
  },

  input: {
    flex: 1,
    fontSize: 16, // Fixed size
    color: "#333",
    paddingVertical: 0,
  },

  button: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    shadowColor: "#007bff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17, // Fixed size
    fontWeight: "600",
  },

  message: {
    marginTop: 20,
    fontSize: 14, // Fixed size
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