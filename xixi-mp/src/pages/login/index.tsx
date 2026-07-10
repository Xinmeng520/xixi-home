import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import Icon from '../../components/Icon'
import './index.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('请输入用户名和密码'); return }
    setLoading(true); setError('')
    try {
      const data = await request<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      Taro.setStorageSync('token', data.token)
      Taro.reLaunch({ url: '/pages/home/index' })
    } catch (err: any) { setError(err.message || '登录失败') }
    finally { setLoading(false) }
  }

  return (
    <View className='login-page'>
      <View className='login-decoration login-decoration-1'></View>
      <View className='login-decoration login-decoration-2'></View>

      <View className='login-content'>
        <View className='login-logo'>
          <Icon name='logo' size={50} color='#fff' />
        </View>
        <Text className='login-title'>熙熙小窝</Text>
        <Text className='login-subtitle'>登录你的小世界</Text>

        <View className='login-form'>
          <Input
            className='login-input'
            type='text'
            placeholder='请输入用户名'
            value={username}
            onInput={e => setUsername(e.detail.value)}
          />
          <Input
            className='login-input'
            password
            placeholder='请输入密码'
            value={password}
            onInput={e => setPassword(e.detail.value)}
          />
          {error && <Text className='login-error'>{error}</Text>}
          <Button className='login-btn' loading={loading} onClick={handleLogin}>
            {loading ? '登录中...' : '登 录'}
          </Button>
        </View>

        <Text className='login-tip'>默认账号: xixi / 123456</Text>
      </View>
    </View>
  )
}
