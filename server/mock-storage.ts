/**
 * Mock storage implementation for development/testing
 * This avoids MongoDB dependency while demonstrating functionality
 */

// In-memory data store
const mockData: any = {
  users: new Map(),
  userPreferences: new Map(),
  patients: new Map(),
  surgeons: new Map(),
  procedures: new Map(),
  cases: new Map(),
  caseTemplates: new Map(),
  casePhotos: new Map(),
};

// Mock counter for IDs
let idCounter = 1;

export const mockStorage = {
  async getUser(id: string) {
    return mockData.users.get(id) || null;
  },

  async upsertUser(userData: any) {
    const existingUser = mockData.users.get(userData.id);
    const user = {
      ...existingUser,
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    mockData.users.set(userData.id, user);
    return user;
  },

  async updateUserTheme(userId: string, theme: string) {
    const user = mockData.users.get(userId);
    if (user) {
      user.themePreference = theme;
      user.updatedAt = new Date();
      mockData.users.set(userId, user);
    }
  },

  async getUserPreferences(userId: string) {
    return mockData.userPreferences.get(userId) || {
      userId,
      defaultAnesthesiaType: "",
      defaultInstitution: "",
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
      },
      aiSettings: {
        selectedModel: "",
        modelTier: "free",
        enableAgent: false,
        apiUsage: {
          requestsThisMonth: 0,
          lastRequestDate: null,
        },
      },
    };
  },

  async upsertUserPreferences(preferencesData: any) {
    const preferences = {
      id: idCounter++,
      ...preferencesData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockData.userPreferences.set(preferencesData.userId, preferences);
    return preferences;
  },

  // Mock implementations for other methods
  async getPatients() { return []; },
  async getPatient() { return null; },
  async getPatientByPatientId() { return null; },
  async createPatient() { return {}; },
  async updatePatient() { return {}; },
  async deletePatient() { return; },
  async searchPatients() { return []; },
  async getSurgeons() { return []; },
  async getSurgeon() { return null; },
  async createSurgeon() { return {}; },
  async updateSurgeon() { return {}; },
  async deleteSurgeon() { return; },
  async getProcedures() { return []; },
  async getProcedure() { return null; },
  async createProcedure() { return {}; },
  async getCases() { return []; },
  async getCase() { return null; },
  async createCase() { return {}; },
  async updateCase() { return {}; },
  async deleteCase() { return; },
  async searchCases() { return []; },
  async getCasesByDateRange() { return []; },
  async getCaseStats() { return { totalCases: 0, averageMonthly: 0, casesByType: [] }; },
  async getCaseTemplates() { return []; },
  async createCaseTemplate() { return {}; },
  async getCasePhotos() { return []; },
  async createCasePhoto() { return {}; },
  async getAllUsers() { return []; },
  async getUserStats() { return []; },
  async getSystemStats() { return { totalUsers: 0, activeUsers: 0, usersByRole: [], totalCases: 0, totalPatients: 0, totalSurgeons: 0 }; },
};