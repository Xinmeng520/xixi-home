import { View, Text } from '@tarojs/components'
import './index.css'

// Use Unicode characters for maximum WeChat MP compatibility
const ICON_CHARS: Record<string, string> = {
  heart: '\u2764',
  'heart-filled': '\u2764',
  comment: '\uD83D\uDCAC',
  pin: '\uD83D\uDCCC',
  'pin-off': '\uD83D\uDCCC',
  edit: '\u270F\uFE0F',
  delete: '\uD83D\uDDD1',
  camera: '\uD83D\uDCF7',
  image: '\uD83D\uDDBC',
  close: '\u2716',
  back: '\u2190',
  add: '+',
  more: '\u22EE',
  upload: '\uD83D\uDCE4',
  save: '\uD83D\uDCBE',
  logout: '\uD83D\uDEAA',
  logo: '\u2764',
  calendar: '\uD83D\uDCC5',
  user: '\uD83D\uDC64',
  send: '\uD83D\uDCE8',
  search: '\uD83D\uDD0D',
  settings: '\u2699',
  home: '\uD83C\uDFE0',
  album: '\uD83D\uDDBC',
  bell: '\uD83D\uDD14',
  share: '\uD83D\uDD17',
  check: '\u2714',
  'chevron-left': '\u276E',
  'chevron-right': '\u276F',
  'chevron-down': '\u276F',
}

interface IconProps {
  name: string
  size?: number
  color?: string
  className?: string
}

export default function Icon({ name, size = 24, color = 'currentColor', className = '' }: IconProps) {
  // Fallback to a simple shape if icon not found
  return (
    <View className={'icon-wrapper ' + className}>
      <Text
        className='icon-char'
        style={{ fontSize: size + 'px', color, lineHeight: size + 'px' }}
      >
        {ICON_CHARS[name] || '\u25CF'}
      </Text>
    </View>
  )
}

export const iconNames = Object.keys(ICON_CHARS)
