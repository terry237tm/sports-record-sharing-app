import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Profile() {
  useLoad(() => {
    console.log('个人中心页面加载')
  })

  return (
    <View className="profile">
      <Text className="title">个人中心</Text>
      <View className="content">
        <Text>这里将显示个人信息</Text>
      </View>
    </View>
  )
}