import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Share() {
  useLoad(() => {
    console.log('分享页面加载')
  })

  return (
    <View className="share">
      <Text className="title">运动分享</Text>
      <View className="content">
        <Text>这里将显示分享内容</Text>
      </View>
    </View>
  )
}