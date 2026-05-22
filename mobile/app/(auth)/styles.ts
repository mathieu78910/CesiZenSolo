import { StyleSheet } from "react-native";

const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F3EE",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  orbTop: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(255, 224, 188, 0.6)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(226, 211, 196, 0.55)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 62,
    gap: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#151515",
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#5E5952",
  },
  card: {
    borderRadius: 24,
    padding: 1,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.55)",
    shadowColor: "rgba(20, 14, 5, 0.36)",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 14,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#151515",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6A635C",
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2B2621",
  },
  input: {
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DED6CD",
    fontSize: 16,
    backgroundColor: "#FAF8F5",
    color: "#151515",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  secondaryLink: {
    alignItems: "flex-start",
    marginTop: 6,
  },
  secondaryLinkText: {
    color: "#5C554E",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  successText: {
    color: "#1F6A3B",
    fontWeight: "600",
    fontSize: 13,
  },
  errorText: {
    color: "#A32C24",
    fontWeight: "600",
    fontSize: 13,
  },
  footerRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  footerText: {
    color: "#6A635C",
    fontSize: 14,
  },
  footerAction: {
    color: "#2B2621",
    fontSize: 14,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default authStyles;
