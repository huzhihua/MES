# 22 · 版本兼容与演进策略

**状态：建议稿 / P2**

## 1. 版本维度

云端版本、边缘 MES 版本、sync-agent、update-agent、device-gateway、DB schema、主数据 schema、设备适配插件均可能独立演进。

## 2. 兼容矩阵

云端维护 minimum_supported_edge_version 与协议版本。边缘同步 API 带 protocol_version，避免云端升级后旧边缘突然不可用。

## 3. DB 演进

优先 Expand → 双读/双写（必要时）→ Backfill → Contract，减少“旧应用连不上新库”的回滚风险。

## 4. 设备插件

驱动插件声明 gateway API 兼容版本和设备型号；插件升级与主 MES 业务版本解耦。

## 5. 版本碎片

灰度必须有观察期限和晋级/回退条件；控制长期混跑版本数量。
