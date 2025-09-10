import { User, UserGender, UserRole, UserStatus, CreateUserData, UpdateUserData } from '../../src/models/User'

/**
 * 用户数据模型测试
 * 测试用户模型的类型定义和接口
 */
describe('User Model', () => {
  describe('枚举定义', () => {
    it('应该包含所有用户性别枚举值', () => {
      expect(UserGender.UNKNOWN).toBe(0)
      expect(UserGender.MALE).toBe(1)
      expect(UserGender.FEMALE).toBe(2)
    })

    it('应该包含所有用户角色枚举值', () => {
      expect(UserRole.USER).toBe('user')
      expect(UserRole.ADMIN).toBe('admin')
      expect(UserRole.COACH).toBe('coach')
    })

    it('应该包含所有用户状态枚举值', () => {
      expect(UserStatus.ACTIVE).toBe('active')
      expect(UserStatus.INACTIVE).toBe('inactive')
      expect(UserStatus.BANNED).toBe('banned')
      expect(UserStatus.DELETED).toBe('deleted')
    })
  })

  describe('用户模型接口', () => {
    it('应该定义完整的用户数据结构', () => {
      const mockUser: User = {
        _id: 'test_user_id',
        openId: 'test_open_id',
        unionId: 'test_union_id',
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: UserGender.MALE,
        birthday: new Date('1990-01-01'),
        height: 175,
        weight: 70,
        phone: '13800138000',
        email: 'test@example.com',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        favoriteSports: ['running', 'cycling'],
        fitnessGoals: ['weight_loss', 'endurance'],
        weeklyGoal: 5,
        totalWorkouts: 100,
        totalDuration: 5000,
        totalCalories: 50000,
        totalDistance: 500,
        currentStreak: 7,
        longestStreak: 30,
        followersCount: 50,
        followingCount: 30,
        postsCount: 20,
        privacyLevel: 'public',
        allowRecommend: true,
        allowNotification: true,
        lastLoginAt: new Date(),
        loginCount: 200,
        isVerified: false,
        membershipLevel: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      }

      expect(mockUser).toBeDefined()
      expect(mockUser.openId).toBe('test_open_id')
      expect(mockUser.nickName).toBe('测试用户')
      expect(mockUser.role).toBe(UserRole.USER)
    })

    it('应该支持可选字段', () => {
      const minimalUser: User = {
        openId: 'test_open_id',
        nickName: '测试用户',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalDistance: 0,
        currentStreak: 0,
        longestStreak: 0,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        privacyLevel: 'public',
        allowRecommend: true,
        allowNotification: true,
        loginCount: 0,
        isVerified: false,
        membershipLevel: 'free'
      }

      expect(minimalUser).toBeDefined()
      expect(minimalUser.gender).toBeUndefined()
      expect(minimalUser.phone).toBeUndefined()
    })
  })

  describe('创建用户数据接口', () => {
    it('应该定义创建用户所需的数据结构', () => {
      const createData: CreateUserData = {
        openId: 'test_open_id',
        unionId: 'test_union_id',
        nickName: '新用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: UserGender.FEMALE,
        birthday: new Date('1995-01-01'),
        height: 165,
        weight: 55,
        phone: '13900139000',
        email: 'newuser@example.com'
      }

      expect(createData).toBeDefined()
      expect(createData.openId).toBe('test_open_id')
      expect(createData.nickName).toBe('新用户')
    })

    it('应该支持部分创建数据', () => {
      const minimalCreateData: CreateUserData = {
        openId: 'test_open_id',
        nickName: '新用户'
      }

      expect(minimalCreateData).toBeDefined()
      expect(minimalCreateData.avatarUrl).toBeUndefined()
    })
  })

  describe('更新用户数据接口', () => {
    it('应该定义更新用户的数据结构', () => {
      const updateData: UpdateUserData = {
        nickName: '更新后的昵称',
        avatarUrl: 'https://example.com/new_avatar.jpg',
        gender: UserGender.MALE,
        birthday: new Date('1992-01-01'),
        height: 180,
        weight: 75,
        phone: '13700137000',
        email: 'updated@example.com',
        favoriteSports: ['swimming', 'fitness'],
        fitnessGoals: ['muscle_gain'],
        weeklyGoal: 4,
        privacyLevel: 'friends',
        allowRecommend: false,
        allowNotification: false
      }

      expect(updateData).toBeDefined()
      expect(updateData.nickName).toBe('更新后的昵称')
      expect(updateData.privacyLevel).toBe('friends')
    })

    it('应该支持部分更新数据', () => {
      const partialUpdateData: UpdateUserData = {
        nickName: '新昵称'
      }

      expect(partialUpdateData).toBeDefined()
      expect(partialUpdateData.phone).toBeUndefined()
    })
  })

  describe('类型安全性', () => {
    it('应该确保枚举值的类型安全', () => {
      const gender: UserGender = UserGender.MALE
      const role: UserRole = UserRole.USER
      const status: UserStatus = UserStatus.ACTIVE

      expect(typeof gender).toBe('number')
      expect(typeof role).toBe('string')
      expect(typeof status).toBe('string')
    })

    it('应该确保用户模型的类型安全', () => {
      const user: User = {
        openId: 'test',
        nickName: 'test',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalDistance: 0,
        currentStreak: 0,
        longestStreak: 0,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        privacyLevel: 'public',
        allowRecommend: true,
        allowNotification: true,
        loginCount: 0,
        isVerified: false,
        membershipLevel: 'free'
      }

      // 验证所有必需字段都存在
      expect(user.openId).toBeDefined()
      expect(user.nickName).toBeDefined()
      expect(user.role).toBeDefined()
      expect(user.status).toBeDefined()
    })
  })
})