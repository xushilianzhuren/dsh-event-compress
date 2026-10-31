# dsh-event-compress · 事件压缩总纲令

事件压缩总纲：AI记忆的压缩单位闸——压缩按事件不按token：每完成一个事件（任务闭环）立即压缩为离身三件套（令+脚本+插件），事件收口即触发、禁跨事件混合、平台上下文压缩降级为兜底，event_compress工具提供三类裸压口径拦截与三类合法答法，零依赖装上即用。（Host 插件，零依赖、无构建）。

## 闸
- gate · 口径检：3类违禁口径，命中即返回正判。
- gate · 合法答法：3类问题合法答法模板。

## 配置
```yaml
- id: dsh-event-compress
  config:
    enabled: true
    tool: true
```

## 许可
MIT
