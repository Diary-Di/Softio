import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F3F4F6",
		paddingTop: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	listContainer: {
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		elevation: 2,
	},
	fieldRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 6,
	},
	fieldLabel: {
		width: 110,
		fontWeight: "600",
		color: "#374151",
		marginRight: 8,
	},
	fieldValue: {
		flex: 1,
		color: "#111827",
	},

	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 6,
	},
	avatar: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#E0E7FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	avatarText: {
		color: "#3730A3",
		fontWeight: "700",
		fontSize: 14,
	},
	name: {
		flex: 1,
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	chevron: {
		marginLeft: 12,
		color: "#6B7280",
		fontSize: 18,
	},
	chevronButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EEF2FF',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 2,
	},
	expanded: {
		marginTop: 8,
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
		paddingTop: 8,
	},

	actionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#F9FAFB',
	},
	actionButton: {
		flex: 1,
		height: 44,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F6F4FF',
		paddingHorizontal: 12,
		marginHorizontal: 6,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 1,
	},
	actionIcon: {
		// reserved for minor adjustments
	},

	centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
  },
  
  nameContainer: {
    flex: 1,
    marginLeft: 12,
  },
  
  email: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  
  typeText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '600',
  },
  
  avatarEnterprise: {
    backgroundColor: '#10B981',
  },
  
  avatarParticulier: {
    backgroundColor: '#3B82F6',
  },
  
  countText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
