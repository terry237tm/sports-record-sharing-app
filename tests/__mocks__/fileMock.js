/**
 * 文件资源Mock
 * 用于在测试中处理各种文件类型导入
 */

const mockFileData = {
  // 图片文件
  'test.jpg': {
    path: '/mock/test.jpg',
    size: 1024,
    type: 'image/jpeg',
    name: 'test.jpg'
  },
  'test.png': {
    path: '/mock/test.png',
    size: 2048,
    type: 'image/png',
    name: 'test.png'
  },
  'test.svg': {
    path: '/mock/test.svg',
    size: 512,
    type: 'image/svg+xml',
    name: 'test.svg'
  },
  
  // 字体文件
  'test.woff': {
    path: '/mock/test.woff',
    size: 4096,
    type: 'font/woff',
    name: 'test.woff'
  },
  
  // 媒体文件
  'test.mp3': {
    path: '/mock/test.mp3',
    size: 102400,
    type: 'audio/mpeg',
    name: 'test.mp3'
  },
  
  // 默认文件
  'default': {
    path: '/mock/default.file',
    size: 1024,
    type: 'application/octet-stream',
    name: 'default.file'
  }
}

// 根据文件名返回对应的mock数据
function getMockFile(filename) {
  const fileType = filename.split('.').pop()?.toLowerCase()
  return mockFileData[filename] || mockFileData[fileType] || mockFileData.default
}

module.exports = getMockFile('default')