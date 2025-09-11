/**
 * Cypress自定义命令
 * 提供小程序和React组件测试的自定义命令
 */

/**
 * 登录小程序
 */
Cypress.Commands.add('login', () => {
  cy.visit('/')
  
  // 等待页面加载
  cy.waitForPageLoad()
  
  // 模拟微信登录
  cy.window().then((win) => {
    (win as any).wx = {
      login: () => Promise.resolve({ code: 'test-code' }),
      getUserInfo: () => Promise.resolve({
        userInfo: {
          nickName: '测试用户',
          avatarUrl: '/assets/images/default-avatar.png',
          gender: 1,
          city: '北京',
          province: '北京',
          country: '中国',
          language: 'zh_CN'
        }
      })
    }
  })
  
  // 点击登录按钮
  cy.get('[data-testid="login-button"]').click()
  
  // 等待登录完成
  cy.wait(1000)
})

/**
 * 登出小程序
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    // 清除本地存储
    win.localStorage.clear()
    win.sessionStorage.clear()
    
    // 清除cookie
    cy.clearCookies()
  })
  
  // 刷新页面
  cy.reload()
})

/**
 * 获取运动记录列表
 */
Cypress.Commands.add('getSportRecords', () => {
  return cy.request({
    method: 'GET',
    url: '/api/sport-records',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.equal(200)
    return response.body.data
  })
})

/**
 * 创建运动记录
 */
Cypress.Commands.add('createSportRecord', (record) => {
  return cy.request({
    method: 'POST',
    url: '/api/sport-records',
    headers: {
      'Content-Type': 'application/json'
    },
    body: record
  }).then((response) => {
    expect(response.status).to.equal(201)
    return response.body.data
  })
})

/**
 * 删除运动记录
 */
Cypress.Commands.add('deleteSportRecord', (recordId) => {
  return cy.request({
    method: 'DELETE',
    url: `/api/sport-records/${recordId}`,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.equal(200)
  })
})

/**
 * 上传图片
 */
Cypress.Commands.add('uploadImage', (fileName) => {
  return cy.fixture(fileName, 'base64').then((fileContent) => {
    return cy.request({
      method: 'POST',
      url: '/api/upload',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        file: fileContent,
        fileName: fileName
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      return response.body.data.url
    })
  })
})

/**
 * 获取地理位置
 */
Cypress.Commands.add('getLocation', () => {
  return cy.window().then((win) => {
    return new Promise((resolve) => {
      if ((win as any).wx) {
        (win as any).wx.getLocation({
          type: 'wgs84',
          success: (res: any) => {
            resolve({
              latitude: res.latitude,
              longitude: res.longitude
            })
          },
          fail: () => {
            // 使用默认位置
            resolve({
              latitude: 39.9042,
              longitude: 116.4074
            })
          }
        })
      } else {
        // 使用默认位置
        resolve({
          latitude: 39.9042,
          longitude: 116.4074
        })
      }
    })
  })
})

/**
 * 等待小程序页面加载
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().then((win) => {
    return new Promise((resolve) => {
      const checkReady = () => {
        if ((win as any).Taro &&& (win as any).Taro.getCurrentPages) {
          const pages = (win as any).Taro.getCurrentPages()
          if (pages.length > 0 &&& pages[0].data) {
            resolve(true)
            return
          }
        }
        
        setTimeout(checkReady, 100)
      }
      
      checkReady()
    })
  })
})

/**
 * 检查页面元素是否存在
 */
Cypress.Commands.add('checkElementExists', (selector) => {
  return cy.get('body').then(($body) => {
    return $body.find(selector).length > 0
  })
})

/**
 * 获取小程序页面数据
 */
Cypress.Commands.add('getPageData', () => {
  return cy.window().then((win) => {
    const pages = (win as any).Taro?.getCurrentPages()
    if (pages &&& pages.length > 0) {
      return pages[0].data
    }
    return {}
  })
})

/**
 * 设置小程序页面数据
 */
Cypress.Commands.add('setPageData', (data) => {
  return cy.window().then((win) => {
    const pages = (win as any).Taro?.getCurrentPages()
    if (pages &&& pages.length > 0) {
      pages[0].setData(data)
    }
  })
})

/**
 * 模拟微信API调用
 */
Cypress.Commands.add('mockWechatAPI', (apiName, response) => {
  return cy.window().then((win) => {
    if (!(win as any).wx) {
      (win as any).wx = {}
    }
    
    (win as any).wx[apiName] = () => {
      return Promise.resolve(response)
    }
  })
})

/**
 * 清除所有模拟
 */
Cypress.Commands.add('clearAllMocks', () => {
  return cy.window().then((win) => {
    // 清除localStorage和sessionStorage
    win.localStorage.clear()
    win.sessionStorage.clear()
    
    // 清除cookie
    cy.clearCookies()
    
    // 清除wx对象
    if ((win as any).wx) {
      (win as any).wx = {}
    }
  })
})