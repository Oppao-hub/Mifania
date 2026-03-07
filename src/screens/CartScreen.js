import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const CartScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Text>CartScreen</Text>
    </SafeAreaView>
  )
}

export default CartScreen