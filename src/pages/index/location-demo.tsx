import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'

export default function Index() {
  const navigateToLocationDemo = () => {
    Taro.navigateTo({
      url: '/pages/location-demo/test-components'
    })
  }

  return (
    <View className="demo-navigation">
      <View className="demo-card">
        <Text className="demo-title">🗺️ 位置服务演示</Text>
        <Text className="demo-description">
          体验完整的位置服务功能，包括位置显示、权限管理、位置选择、地址搜索和地图展示
        </Text>
        <Button type="primary" onClick={navigateToLocationDemo}>
          进入演示
        </Button>
      </View>
    </View>
  )
}