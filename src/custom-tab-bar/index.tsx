// src/custom-tab-bar/index.tsx
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  symbol: string
  accentColor: string
}

const TABS: TabItem[] = [
  { pagePath: '/pages/home/index',    text: '我的简历', symbol: '□', accentColor: '#D02020' },
  { pagePath: '/pages/profile/index', text: '个人中心', symbol: '○', accentColor: '#1040C0' },
]

interface State {
  selected: number
}

/**
 * 自定义 TabBar。
 * 页面在 useDidShow 中调用 tabbar.setSelected(n) 同步选中态。
 * Class 组件是 WeChat 自定义 TabBar 的要求（需要实例方法）。
 */
export default class CustomTabBar extends Component<{}, State> {
  state: State = { selected: 0 }

  setSelected(selected: number) {
    this.setState({ selected })
  }

  switchTab(index: number, pagePath: string) {
    Taro.switchTab({ url: pagePath })
  }

  render() {
    const { selected } = this.state
    return (
      <View className='tabbar'>
        {/* Left: new resume CTA button (center action) */}
        <View
          className='tabbar__new'
          onClick={() => Taro.navigateTo({ url: '/pages/template/index' })}
        >
          <View className='tabbar__new-inner'>
            <Text className='tabbar__new-icon'>+</Text>
          </View>
          <Text className='tabbar__new-label'>新建</Text>
        </View>

        {/* Right: home + profile tabs */}
        {TABS.map((tab, index) => {
          const isActive = selected === index
          return (
            <View
              key={tab.pagePath}
              className={`tabbar__item ${isActive ? 'tabbar__item--active' : ''}`}
              onClick={() => this.switchTab(index, tab.pagePath)}
            >
              {isActive && (
                <View className='tabbar__bar' style={{ backgroundColor: tab.accentColor }} />
              )}
              <Text className={`tabbar__symbol ${isActive ? 'tabbar__symbol--active' : ''}`}>
                {tab.symbol}
              </Text>
              <Text className={`tabbar__label ${isActive ? 'tabbar__label--active' : ''}`}>
                {tab.text}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }
}
