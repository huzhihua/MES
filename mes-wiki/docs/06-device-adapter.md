# 06 · 设备对接协议适配库

**状态：基线，来源 PRE-06**

## 1. 架构决策

阶段二采用“设备 → 边缘设备采集网关 → MES”，不让 MES 业务应用直接承担大量厂商协议；阶段二暂不引入独立 IoT 数据中台。

## 2. 网关职责

协议解析、采集、清洗、时间戳统一、本地缓存、标准化输出；不负责工单绑定、质量最终判定、追溯业务规则。

## 3. 协议范围

高端设备可能提供 OPC UA、REST、MQTT、WPCS/厂商标准接口；中低端常见 RS232、Modbus、TCP/ASCII、文件导出或私有协议；老旧设备可能需要 I/O、串口改造或旁路传感。

## 4. 四层适配

1. Transport：Serial/TCP/UDP/HTTP；
2. Protocol：Modbus/OPC UA/ASCII/私有协议；
3. Adapter：厂商/型号插件；
4. UDM：统一设备数据模型。

## 5. 数据采集分级

- L1 状态采集：运行/停机/报警/计数；
- L2 参数回传：工艺参数、质量测量值；
- L3 闭环控制：工单/配方/参数下发与互锁。

阶段二优先 L1 + 关键设备 L2。

## 6. 统一设备事件建议

至少包含：device_id、event_id、event_type、device_time、received_time、sequence、payload、quality、raw_ref。
