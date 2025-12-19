export type UserRole = 'customer' | 'manager' | 'admin' | 'super_admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

// 模擬用戶資料庫
const STORAGE_KEY = 'registered_users';

const DEFAULT_USERS: StoredUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    isActive: true,
  },
  {
    id: '2',
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: 'password123',
    role: 'super_admin',
    isActive: true,
  },
  {
    id: '3',
    username: 'manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    isActive: true,
  },
  {
    id: '4',
    username: 'customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    isActive: true,
  },
];

// 取得已註冊用戶
export const getRegisteredUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const users = JSON.parse(stored);
    // Migrate old users without role field
    return users.map((u: StoredUser) => ({
      ...u,
      role: u.role || 'customer',
      isActive: u.isActive !== undefined ? u.isActive : true,
    }));
  }
  // 初始化預設用戶
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

// 儲存用戶
const saveUser = (user: StoredUser) => {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// 更新用戶
export const updateUser = (userId: string, updates: Partial<StoredUser>) => {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return users[index];
  }
  return null;
};

// 模擬 API 延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    await delay(800); // 模擬網路延遲
    
    const users = getRegisteredUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (!user.isActive) {
        return {
          success: false,
          message: '此帳號已被停用',
        };
      }
      
      const token = btoa(`${user.username}:${Date.now()}`);
      return {
        success: true,
        message: '登入成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
        token,
      };
    }
    
    return {
      success: false,
      message: '帳號或密碼錯誤',
    };
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay(800); // 模擬網路延遲
    
    const users = getRegisteredUsers();
    
    // 檢查帳號是否已存在
    if (users.some(u => u.username === username)) {
      return {
        success: false,
        message: '此帳號已被使用',
      };
    }
    
    // 檢查 Email 是否已存在
    if (users.some(u => u.email === email)) {
      return {
        success: false,
        message: '此 Email 已被註冊',
      };
    }
    
    // 建立新用戶 (default role is customer)
    const newUser: StoredUser = {
      id: String(Date.now()),
      username,
      email,
      password,
      role: 'customer',
      isActive: true,
    };
    
    saveUser(newUser);
    
    const token = btoa(`${newUser.username}:${Date.now()}`);
    return {
      success: true,
      message: '註冊成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      token,
    };
  },

  async validateToken(token: string): Promise<AuthResponse> {
    await delay(200);
    
    try {
      const decoded = atob(token);
      const [username] = decoded.split(':');
      const users = getRegisteredUsers();
      const user = users.find(u => u.username === username);
      
      if (user && user.isActive) {
        return {
          success: true,
          message: 'Token 有效',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          },
        };
      }
    } catch {
      // Token 解析失敗
    }
    
    return {
      success: false,
      message: 'Token 無效',
    };
  },

  async getAllUsers(): Promise<User[]> {
    await delay(300);
    return getRegisteredUsers().map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    }));
  },

  async updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean }> {
    await delay(300);
    const result = updateUser(userId, { role });
    return { success: !!result };
  },

  async toggleUserActive(userId: string, isActive: boolean): Promise<{ success: boolean }> {
    await delay(300);
    const result = updateUser(userId, { isActive });
    return { success: !!result };
  },
};
