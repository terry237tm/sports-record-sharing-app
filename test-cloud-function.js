/**
 * 云函数测试脚本
 * 用于验证 CloudBase 云函数调用逻辑
 */

// 测试 HTTP 调用逻辑
async function testHttpCall() {
  console.log('🚀 开始测试云函数 HTTP 调用...');
  
  try {
    // 模拟环境变量
    process.env.TARO_APP_CLOUDBASE_HELLO_URL = 'https://httpbin.org/get';
    
    // 动态导入云函数服务
    const { getHelloFromCloud } = await import('./src/services/cloudbase.ts');
    
    console.log('正在调用云函数...');
    const result = await getHelloFromCloud();
    console.log('✅ 云函数调用成功:', result);
    
  } catch (error) {
    console.error('❌ 云函数调用失败:', error);
  }
}

// 测试配置获取
function testConfig() {
  console.log('🔧 开始测试配置获取...');
  
  try {
    const { getCloudBaseConfig } = require('./src/services/cloudbase.ts');
    const config = getCloudBaseConfig();
    console.log('✅ 配置获取成功:', config);
  } catch (error) {
    console.error('❌ 配置获取失败:', error);
  }
}

// 运行测试
async function runTests() {
  console.log('🎯 开始 CloudBase 云函数测试\n');
  
  // 测试配置
  testConfig();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试 HTTP 调用
  await testHttpCall();
  
  console.log('\n✅ 测试完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };