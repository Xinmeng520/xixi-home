import Taro from '@tarojs/taro'

const API_BASE = 'http://192.168.110.119:3000'

interface RequestOptions {
  method?: string
  body?: any
  header?: Record<string, string>
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = Taro.getStorageSync('token')
  const header: Record<string, string> = { ...(options.header || {}) }
  if (token) header['Authorization'] = 'Bearer ' + token

  // Only set Content-Type for JSON bodies (not FormData/file uploads)
  if (options.body && typeof options.body === 'object' && !(options.body instanceof ArrayBuffer)) {
    if (!header['Content-Type']) {
      header['Content-Type'] = 'application/json'
    }
  }

  const res = await Taro.request({
    url: API_BASE + url,
    method: options.method || 'GET',
    data: options.body,
    header,
    dataType: 'json'
  })

  const data = res.data as any
  if (data.code === 401) {
    Taro.removeStorageSync('token')
    Taro.reLaunch({ url: '/pages/login/index' })
    throw new Error('Unauthorized')
  }
  if (data.code !== 0) {
    throw new Error(data.data?.message || data.message || 'Request failed')
  }
  return data.data as T
}

export async function uploadFile(url: string, filePath: string, formData?: any, name: string = 'file'): Promise<any> {
  const token = Taro.getStorageSync('token')
  const res = await Taro.uploadFile({
    url: API_BASE + url,
    filePath,
    name,
    formData,
    header: token ? { 'Authorization': 'Bearer ' + token } : {}
  })
  if (res.statusCode >= 400) throw new Error('Upload failed: ' + res.statusCode)
  try {
    const data = JSON.parse(res.data)
    if (data.code !== 0) throw new Error(data.message || 'Upload failed')
    return data.data
  } catch (e: any) {
    if (e.message && e.message.includes('Upload failed')) throw e
    return res.data
  }
}


export async function uploadRawFile(url: string, filePath: string): Promise<any> {
  const fs = Taro.getFileSystemManager()
  let base64Data: string
  try {
    base64Data = fs.readFileSync(filePath, "base64")
  } catch (e: any) {
    throw new Error("读取文件失败")
  }
  const result = await request<{ avatar: string; user: any }>(url, {
    method: "POST",
    body: JSON.stringify({ image: base64Data })
  })
  return result
}
