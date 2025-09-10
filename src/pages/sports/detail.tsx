import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './detail.scss'

export default function SportsDetail() {
  useLoad(() => {
    console.log('运动详情页面加载')
  })

  return (
    <View className="sports-detail">
      <Text className="title">运动详情</Text>
      <View className="content">
        <Text>这里将显示运动记录详情</Text>
      </View>
    </View>
  )
}