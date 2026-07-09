import { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import './index.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('\u8bf7\u8f93\u5165\u7528\u6237\u540d\u548c\u5bc6\u7801'); return }
    setLoading(true); setError('')
    try {
      const data = await request<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      Taro.setStorageSync('token', data.token)
      Taro.reLaunch({ url: '/src/pages/home/index' })
    } catch (err: any) { setError(err.message || '\u767b\u5f55\u5931\u8d25') }
    finally { setLoading(false) }
  }

  return (
    <View className='login-page'>
      <View className='login-bg-1'></View>
      <View className='login-bg-2'></View>
      <View className='login-content'>
        <View className='login-logo'>
          <View className='login-heart'>
            <Text className='heart-icon'>\u2764</Text>
          </View>
        </View>
        <Text className='login-title'>\u7199\u7199\u5c0f\u7a9d</Text>
        <Text className='login-subtitle'>\u767b\u5f55\u4f60\u7684\u5c0f\u4e16\u754c</Text>
        <View className='login-form'>
          <Input className='login-input' type='text' placeholder='\u8bf7\u8f93\u5165\u7528\u6237\u540d' value={username} onInput={e => setUsername(e.detail.value)} />
          <Input className='login-input' password placeholder='\u8bf7\u8f93\u5165\u5bc6\u7801' value={password} onInput={e => setPassword(e.detail.value)} />
          {error && <Text className='login-error'>{error}</Text>}
          <Button className='login-btn' loading={loading} onClick={handleLogin}>
            {loading ? '\u767b\u5f55\u4e2d...' : '\u767b \u5f55'}
          </Button>
        </View>
        <Text className='login-tip'>\u9ed8\u8ba4\u8d26\u53f7: xixi / 123456</Text>
      </View>
    </View>
  )
}
