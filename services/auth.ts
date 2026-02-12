import { User } from '../types';

const USER_KEY = 'medivault_user';

export const authService = {
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  signIn: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email || !password) {
        throw new Error("Please enter both email and password.");
    }
    
    // Create mock user
    const user: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) // Capitalize name
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem(USER_KEY);
  }
};