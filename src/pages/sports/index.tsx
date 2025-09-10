import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Sports() {
  useLoad(() => {
    console.log('运动记录页面加载')
  })

  return (
    <View className="sports">
      <Text className="title">运动记录</Text>
      <View className="content">
        <Text>这里将显示运动记录列表</Text>
      </View>
    </View>
  )
}