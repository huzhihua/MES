# 26 · 线束 MES 软件设计总览

**状态：建议稿 / 软件设计入口**

本文从软件系统设计角度展开线束 MES 的功能模块。它不是替代 PRE-01 ～ PRE-25 的专项预研，而是把这些预研收敛成后续研发可理解的“模块地图”。

目标：

1. 明确线束 MES 应该有哪些业务模块；
2. 明确每个模块负责什么、不负责什么；
3. 明确边缘 MES 应用与云端 MES 管理平台的功能分工；
4. 为后续数据库设计、API 设计、前端菜单、Maven/服务模块划分提供依据。

## 1. 软件总体结构

线束 MES 建议按“云端管理平台 + 边缘 MES 应用 + 设备采集网关 + 集成适配层”设计。

```text
线束 MES
├── 云端 MES 管理平台
│   ├── 组织与权限
│   ├── 主数据管理
│   ├── 工艺管理
│   ├── BOM 管理
│   ├── 计划与工单
│   ├── 质量管理
│   ├── 生产追溯
│   ├── 设备管理
│   ├── 图纸管理
│   ├── 标签管理
│   ├── 异常 Andon
│   ├── 报表分析
│   ├── 配置中心
│   ├── 云边运维
│   └── 系统集成
│
├── 边缘 MES 应用
│   ├── 工位执行
│   ├── 班组操控
│   ├── 现场看板
│   ├── 实施看板
│   ├── 本地工单
│   ├── 本地质量
│   ├── 本地物料
│   ├── 本地标签
│   ├── 本地追溯
│   ├── 离线生产
│   └── 同步代理
│
├── 设备采集网关
│   ├── OPC UA
│   ├── Modbus
│   ├── RS232 / RS485
│   ├── TCP / ASCII
│   ├── REST / MQTT
│   ├── 文件采集
│   ├── 厂商协议
│   └── 统一设备数据模型 UDM
│
└── 外部系统适配
    ├── ERP
    ├── WMS
    ├── PLM / 工艺系统
    ├── QMS
    ├── IoT 平台
    └── 客户标签 / 条码系统
```

## 2. 功能模块总览

```text
线束 MES
├── 组织权限
├── 主数据管理
├── 工艺管理
├── BOM 管理
├── 图纸管理
├── 计划排产
├── 工单管理
├── 工位执行
├── 物料执行
├── 质量管理
├── 生产追溯
├── 设备采集
├── 标签打印
├── 异常 Andon
├── 看板报表
├── 云边协同
├── 边缘运维
├── 配置中心
├── 系统集成
├── 数据归档
└── 实施初始化
```

## 3. 组织权限

### 3.1 模块定位

组织权限模块负责系统基础组织结构、人员、角色、权限和数据隔离，是多工厂 MES 的基础。

### 3.2 功能点

- 租户管理；
- 工厂管理；
- 车间管理；
- 产线管理；
- 工位管理；
- 班组管理；
- 班次管理；
- 工作日历；
- 用户管理；
- 员工档案；
- 角色管理；
- 菜单权限；
- 功能权限；
- 数据权限；
- 工厂级数据隔离；
- 产线级数据隔离；
- 工位级权限；
- 离线权限缓存；
- 登录审计；
- 操作审计。

### 3.3 关键对象

```text
Tenant
Factory
Workshop
ProductionLine
Workstation
Shift
User
Employee
Role
Permission
DataScope
AuditLog
```

### 3.4 边界

MES 管理生产现场权限，不替代企业 OA 或 HR 系统。员工主档可从 ERP/HR 同步，MES 只维护现场生产相关属性，如班组、技能、工位授权。

## 4. 主数据管理

### 4.1 模块定位

主数据管理负责 MES 执行所需的稳定基础数据。云端维护主数据原件，边缘保存可执行版本副本。

### 4.2 功能点

- 产品档案；
- 产品版本；
- 物料档案；
- 物料分类；
- 线材属性；
- 端子属性；
- 连接器属性；
- 胶带/套管/辅料属性；
- 客户项目；
- 车型平台；
- 供应商；
- 设备档案；
- 模具档案；
- 治具档案；
- 检具档案；
- 不良代码；
- 报警代码；
- 单位管理；
- 编码规则；
- 字典管理；
- 主数据导入；
- 主数据校验；
- 主数据发布；
- 主数据版本。

### 4.3 关键对象

```text
Product
ProductVersion
Material
MaterialCategory
Supplier
CustomerProject
Equipment
Tooling
Fixture
InspectionTool
DefectCode
AlarmCode
Dictionary
CodeRule
```

### 4.4 设计原则

主数据必须版本化发布。边缘生产现场不直接依赖云端实时查询，否则断网会影响生产。

## 5. 工艺管理

### 5.1 模块定位

工艺管理负责定义线束产品如何生产，包括工序、路线、参数、SOP、检验要求和防错规则。

线束 MES 不应把固定工序写死，应采用：

```text
工序库 → 工艺路线模板 → 工艺版本发布 → 工单工艺实例
```

### 5.2 功能点

- 工序库；
- 工序分类；
- 工序编码；
- 工序能力标签；
- 工艺路线模板；
- 工艺路线版本；
- 工序顺序配置；
- 并行工序；
- 分支工序；
- 返工路线；
- 跳站规则；
- 工序参数规范；
- 工序设备要求；
- 工序工装要求；
- 工序人员技能要求；
- 工序检验要求；
- 工序标签规则；
- SOP 管理；
- 工艺变更；
- 工艺审批；
- 工艺发布；
- 工艺版本下发边缘；
- 在制工单影响分析。

### 5.3 关键对象

```text
Operation
OperationCategory
Routing
RoutingVersion
RoutingStep
RoutingRelation
ProcessParameterSpec
SOP
OperationInspectionRule
OperationDeviceRequirement
OperationToolingRequirement
RoutingRelease
```

### 5.4 边界

PLM/工艺系统负责工程源头数据，MES 负责可执行生产工艺。MES 可以接收上游工艺版本，但必须在工单下发时固化为工单工艺实例。

## 6. BOM 管理

### 6.1 模块定位

BOM 管理负责产品、物料、组件、半成品之间的制造结构，并服务物料防错、投料、消耗和追溯。

### 6.2 功能点

- 产品 BOM；
- 制造 BOM；
- BOM 版本；
- BOM 审核；
- BOM 发布；
- BOM 复制；
- BOM 比对；
- 工程 BOM 与制造 BOM 映射；
- 线材用量；
- 端子用量；
- 连接器用量；
- 胶带/套管/辅料用量；
- 替代料；
- 损耗率；
- 单位换算；
- 工序用料配置；
- 工单物料需求生成；
- BOM 下发边缘；
- BOM 变更影响分析。

### 6.3 关键对象

```text
BOM
BOMVersion
BOMItem
MaterialUsage
OperationMaterial
SubstituteMaterial
LossRate
UnitConversion
BOMRelease
```

### 6.4 设计原则

BOM 不只是产品结构，还要落到工序用料。没有工序用料关系，现场扫码防错和批次追溯都会变弱。

## 7. 图纸管理

### 7.1 模块定位

图纸管理负责生产现场所需的图纸、工艺图片、接线图、端子压接示意、检验标准图片等资料的版本化管理和工位展示。

### 7.2 功能点

- 图纸上传；
- 图纸分类；
- 产品图纸；
- 工序图纸；
- 接线图；
- 端子压接图；
- 装配图；
- 检验图；
- 包装图；
- PDF 预览；
- 图片预览；
- 版本管理；
- 图纸审批；
- 图纸发布；
- 图纸与产品绑定；
- 图纸与工序绑定；
- 图纸与工单绑定；
- 工位端图纸查看；
- 离线图纸缓存；
- 图纸变更影响分析；
- 图纸访问审计。

### 7.3 关键对象

```text
Drawing
DrawingVersion
DrawingFile
DrawingCategory
DrawingBinding
DrawingRelease
DrawingAccessLog
```

### 7.4 设计原则

图纸要作为受控资料管理。边缘工位端只能查看已发布版本，不能随意引用未发布图纸。

## 8. 计划排产

### 8.1 模块定位

计划排产负责将工单安排到产线、班次、工位和资源。阶段一不做复杂 APS，但要建立未来 APS 所需的数据基础。

### 8.2 功能点

- ERP 工单接收；
- 计划池；
- 工单优先级；
- 交期管理；
- 产线日历；
- 班次产能；
- 人员技能；
- 设备能力；
- 模具/治具约束；
- 标准工时；
- 换型时间；
- 人工排产；
- 拖拽排程；
- 产能负荷；
- 冲突提示；
- 延误预警；
- 排产版本；
- 排产发布；
- 排产下发边缘；
- APS 接口预留。

### 8.3 关键对象

```text
ProductionPlan
Schedule
ScheduleVersion
ScheduleItem
CapacityCalendar
ResourceCapacity
WorkCenter
SkillRequirement
```

## 9. 工单管理

### 9.1 模块定位

工单管理是 MES 生产执行主线，负责把计划转化为现场可执行任务。

### 9.2 功能点

- 工单创建；
- ERP 工单同步；
- 试制工单；
- 工单审核；
- 工单发布；
- 工单下发边缘；
- 工单取消；
- 工单变更；
- 已开工工单变更保护；
- 工单拆分；
- 工单合并建议；
- 工单派工；
- 工单冻结；
- 工单解冻；
- 工单齐套检查；
- 工单状态机；
- 工单工艺实例；
- 工单物料需求；
- 工单进度；
- 工单完工；
- 工单关闭；
- 工单履历。

### 9.3 关键对象

```text
WorkOrder
WorkOrderOperation
WorkOrderRoutingInstance
WorkOrderMaterialRequirement
WorkOrderStatusLog
DispatchTask
```

## 10. 工位执行

### 10.1 模块定位

工位执行是边缘 MES 应用的核心。它面向操作工，强调扫码、防错、少输入和离线可用。

### 10.2 功能点

- 工位登录；
- 员工扫码登录；
- 当前任务；
- 工单信息；
- 产品信息；
- 工序信息；
- SOP 展示；
- 图纸展示；
- 参数展示；
- 扫码开工；
- SN 扫码；
- 物料扫码；
- 工装扫码；
- 模具扫码；
- 防跳站；
- 防漏扫；
- 物料防错；
- 人员技能校验；
- 工序开始；
- 工序暂停；
- 工序恢复；
- 工序完成；
- 良品报工；
- 不良报工；
- 报废报工；
- 检验录入；
- 设备数据带入；
- 标签打印；
- 异常上报；
- 离线生产。

### 10.3 关键对象

```text
WorkstationSession
WorkstationTask
ScanRecord
OperationExecution
ProductionReport
WorkstationException
```

## 11. 物料执行

### 11.1 模块定位

物料执行负责现场投料和消耗事实，不替代 ERP/WMS 库存账。

### 11.2 功能点

- 工单物料需求；
- 备料确认；
- 物料上线；
- 批次扫码；
- 投料；
- 换料；
- 换批；
- 补料；
- 退料；
- 消耗；
- 损耗；
- 余料；
- 替代料校验；
- 超领提示；
- 有效期校验；
- 批次切换；
- SN 与物料批次绑定；
- 消耗回传 ERP；
- 物料追溯。

### 11.3 关键对象

```text
MaterialBatch
MaterialFeed
MaterialConsumption
MaterialReturn
BatchSwitch
MaterialBinding
```

## 12. 质量管理

### 12.1 模块定位

质量管理负责生产现场质量执行和不合格品闭环。

### 12.2 功能点

- 检验计划；
- 检验标准；
- 检验项目；
- 首检；
- 巡检；
- 过程检；
- 完工检；
- 导通测试；
- 拉力测试；
- 压接高度检测；
- 压接曲线记录；
- 自动判定；
- 人工判定；
- 不良记录；
- NCR；
- 返工；
- 返修；
- 报废；
- 特采/让步放行；
- 质量冻结；
- 质量放行；
- 复检；
- 质量统计；
- 客诉追溯。

### 12.3 关键对象

```text
InspectionPlan
InspectionTask
InspectionItem
InspectionRecord
QualityResult
Defect
NCR
Disposition
ReworkOrder
QualityRelease
```

## 13. 生产追溯

### 13.1 模块定位

生产追溯负责把人、机、料、法、环、测与工单、工序、批次、SN 连接起来。线束追溯应按 Genealogy 图谱设计，而不是简单单表链路。

### 13.2 功能点

- SN 管理；
- 半成品批次；
- 成品批次；
- 包装单元；
- 工序履历；
- 人员履历；
- 工位履历；
- 物料履历；
- 设备履历；
- 质量履历；
- 标签履历；
- 批次拆分；
- 批次合并；
- 物料批次到 SN 关系；
- 半成品到成品关系；
- 正向追溯；
- 反向追溯；
- 影响范围分析；
- 客诉 SN 查询；
- 召回分析；
- 追溯报告导出。

### 13.3 关键对象

```text
ProductSN
ProductionBatch
TraceEvent
GenealogyRelation
PackageUnit
TraceQuery
```

## 14. 设备采集

### 14.1 模块定位

设备采集负责将设备状态、报警、计数、工艺参数、质量结果和文件数据纳入 MES。MES 不直接写大量协议驱动，而通过 Device Gateway 适配。

### 14.2 功能点

- 设备档案；
- 设备能力模型；
- 设备与工位绑定；
- 设备状态采集；
- 设备报警采集；
- 设备计数采集；
- 工艺参数采集；
- 质量结果采集；
- 曲线文件采集；
- OPC UA 适配；
- REST 适配；
- MQTT 适配；
- WPCS / 厂商接口；
- RS232 / RS485；
- Modbus RTU/TCP；
- TCP/ASCII；
- 文件导出采集；
- 私有协议/SDK；
- I/O 改造；
- 旁路传感；
- 设备数据 UDM；
- 设备事件与工单绑定；
- 设备事件与 SN 绑定；
- 设备断线重连；
- 原始数据归档。

### 14.3 关键对象

```text
Device
DeviceCapability
DeviceAdapter
DevicePoint
DeviceEvent
DeviceAlarm
DeviceParameter
DeviceRawData
DeviceBinding
```

## 15. 标签打印

### 15.1 模块定位

标签打印服务生产流转、质量隔离、包装交付和追溯。

### 15.2 功能点

- 标签模板；
- 标签版本；
- 产品标签；
- 半成品标签；
- 成品 SN 标签；
- 包装标签；
- 工序流转标签；
- 物料标签；
- 不良标签；
- 返工标签；
- 客户标签；
- 打印规则；
- 工位打印；
- 批量打印；
- 补打；
- 重打审批；
- 打印记录；
- 打印失败重试；
- 打印机绑定；
- ZPL / TSPL / Windows Driver 支持。

### 15.3 关键对象

```text
LabelTemplate
LabelVersion
LabelRule
PrintTask
PrintRecord
Printer
ReprintApproval
```

## 16. 异常 Andon

### 16.1 模块定位

异常 Andon 负责生产现场异常上报、响应、处理、恢复和复盘。

### 16.2 功能点

- 异常分类；
- 异常等级；
- 缺料异常；
- 设备异常；
- 质量异常；
- 工艺异常；
- 人员异常；
- 模具异常；
- 来料异常；
- 扫码异常；
- 测试失败；
- Andon 呼叫；
- 停线申请；
- 责任部门；
- 响应人；
- 处理过程；
- 恢复生产；
- 原因分析；
- 异常关闭；
- 异常升级；
- MTTA；
- MTTR；
- 停机损失分析。

### 16.3 关键对象

```text
ExceptionTicket
AndonCall
StopLineRecord
ExceptionAction
ExceptionReason
ExceptionClose
```

## 17. 看板报表

### 17.1 模块定位

看板偏现场实时，报表偏管理复盘。

### 17.2 功能点

- 工单进度看板；
- 产线状态看板；
- 工位状态看板；
- 设备状态看板；
- 异常看板；
- 质量看板；
- 产量日报；
- 小时产量；
- 工序良率；
- 不良 Pareto；
- 停机分析；
- 节拍分析；
- 工时分析；
- 物料消耗分析；
- 设备在线率；
- ERP 回传状态；
- 边缘同步状态；
- 跨工厂对比。

### 17.3 关键对象

```text
Dashboard
ReportDefinition
ReportQuery
MetricSnapshot
AnalysisDataset
```

## 18. 云边协同

### 18.1 模块定位

云边协同负责主数据、工艺、工单、配置从云端下发，生产事件、质量记录、设备事件从边缘上报。

### 18.2 功能点

- 边缘节点注册；
- 主数据下发；
- 工艺版本下发；
- 工单下发；
- 配置包下发；
- 生产事件上报；
- 质量记录上报；
- 设备事件上报；
- 标签记录上报；
- 同步队列；
- 幂等去重；
- 断点续传；
- 冲突处理；
- 同步监控；
- 离线恢复。

### 18.3 关键对象

```text
EdgeNode
SyncTask
SyncMessage
SyncOffset
SyncConflict
SyncStatus
```

## 19. 配置中心

### 19.1 模块定位

配置中心负责把客户实施配置、工位配置、规则配置、设备点位配置版本化发布到边缘。

### 19.2 功能点

- 工厂配置；
- 工位配置；
- 扫码规则；
- 防错规则；
- 标签规则；
- 打印配置；
- 设备点位配置；
- ERP 映射配置；
- 字典配置；
- 编码规则；
- 功能开关；
- 配置包；
- 配置审批；
- 配置发布；
- 配置回滚；
- 配置生效记录。

### 19.3 关键对象

```text
ConfigItem
ConfigPackage
ConfigVersion
ConfigRelease
FeatureFlag
RuleDefinition
```

## 20. 系统集成

### 20.1 模块定位

系统集成负责 MES 与 ERP、WMS、PLM、QMS、IoT、客户系统之间的数据交换。

### 20.2 功能点

- ERP 工单接口；
- ERP 主数据接口；
- ERP 完工回传；
- ERP 消耗回传；
- WMS 领料接口；
- WMS 退料接口；
- PLM 产品版本接口；
- PLM 图纸接口；
- QMS 不良接口；
- IoT 设备遥测接口；
- 客户标签系统接口；
- API 凭证；
- 字段映射；
- 编码映射；
- 接口日志；
- 接口重试；
- 失败队列；
- 手工补偿；
- 接口对账。

### 20.3 关键对象

```text
IntegrationAdapter
InterfaceMessage
InterfaceLog
RetryTask
MappingRule
ExternalSystem
```

## 21. 边缘运维

### 21.1 模块定位

边缘运维负责现场节点可观测、远程升级、备份恢复和故障诊断。

### 21.2 功能点

- 边缘节点列表；
- 服务状态；
- mes-app 状态；
- sync-agent 状态；
- update-agent 状态；
- device-gateway 状态；
- CPU / 内存 / 磁盘；
- 本地数据库健康；
- 待同步事件；
- 日志回传；
- 远程诊断；
- 远程升级；
- 灰度发布；
- 自动回滚；
- 边缘备份；
- 整机替换恢复。

### 21.3 关键对象

```text
EdgeNode
EdgeService
HealthCheck
Metric
LogBundle
UpgradeTask
BackupTask
RecoveryTask
```

## 22. 数据归档

### 22.1 模块定位

数据归档负责生产事件、设备原始数据、质量记录、标签记录、日志等数据的保留、归档和查询。

### 22.2 功能点

- 生产事件保留策略；
- 质量记录保留策略；
- 设备原始数据归档；
- 曲线文件归档；
- 标签记录归档；
- 操作日志归档；
- 边缘本地保留周期；
- 云端冷热分层；
- 压缩；
- 脱敏；
- 删除审批；
- 历史追溯查询。

### 22.3 关键对象

```text
RetentionPolicy
ArchiveTask
ArchiveIndex
ColdStorageRef
DataDeletionApproval
```

## 23. 实施初始化

### 23.1 模块定位

实施初始化负责把客户现场从“空系统”配置成可运行的 MES 环境，并沉淀为可复制上线方法。

### 23.2 功能点

- 客户项目档案；
- 工厂调研表；
- 设备调研表；
- 工艺调研表；
- BOM 调研表；
- ERP 接口调研表；
- 标签调研表；
- 数据导入模板；
- 工厂初始化；
- 产线初始化；
- 工位初始化；
- 用户权限初始化；
- 设备绑定初始化；
- 打印机绑定；
- 扫码枪绑定；
- 配置包生成；
- 试生产记录；
- 上线检查清单；
- 验收记录；
- 实施问题清单。

### 23.3 关键对象

```text
ImplementationProject
SurveyForm
ImportTemplate
InitializationTask
GoLiveChecklist
AcceptanceRecord
IssueItem
```

## 24. 建议前端菜单

### 24.1 云端 MES 管理平台

```text
首页
组织权限
主数据
工艺管理
BOM 管理
图纸管理
计划排产
工单管理
质量管理
追溯中心
设备管理
标签中心
异常 Andon
报表分析
配置中心
集成中心
云边运维
实施管理
系统设置
```

### 24.2 边缘 MES 应用

```text
现场首页
工位执行
班组操控
工单队列
物料执行
质量执行
标签打印
设备状态
异常 Andon
现场看板
实施看板
同步状态
本地系统管理
```

## 25. 建议后端模块

后端可以按领域模块拆分，但早期不建议过早微服务化。推荐先采用模块化单体或云边分别模块化的方式。

```text
mes-cloud
├── mes-org
├── mes-master-data
├── mes-process
├── mes-bom
├── mes-drawing
├── mes-planning
├── mes-workorder
├── mes-quality
├── mes-traceability
├── mes-equipment
├── mes-label
├── mes-andon
├── mes-report
├── mes-config
├── mes-integration
└── mes-edge-ops

mes-edge
├── edge-workstation
├── edge-workorder
├── edge-material
├── edge-quality
├── edge-label
├── edge-traceability
├── edge-device
├── edge-sync
└── edge-local-admin

device-gateway
├── adapter-opcua
├── adapter-modbus
├── adapter-serial
├── adapter-tcp-ascii
├── adapter-file
├── adapter-rest
├── adapter-mqtt
└── udm
```

## 26. 设计优先级

### P0：必须先稳定

- 组织权限；
- 主数据；
- 工艺管理；
- BOM 管理；
- 工单管理；
- 工位执行；
- 物料执行；
- 质量管理；
- 生产追溯；
- 云边同步；
- ERP 集成。

### P1：首家客户试点前完善

- 图纸管理；
- 标签打印；
- 异常 Andon；
- 看板报表；
- 设备基础采集；
- 配置中心；
- 边缘运维；
- 实施初始化。

### P2：产品化和规模化阶段

- APS 高级排程；
- 设备 L3 闭环；
- 高级质量分析；
- 跨工厂分析；
- 数据冷热归档；
- IoT 平台化扩展。

## 27. 阶段一建议收敛范围

阶段一不要追求“大而全”，建议先形成最小生产闭环：

```text
产品 / 物料 / BOM
    ↓
工艺路线
    ↓
工单
    ↓
工位扫码执行
    ↓
物料批次绑定
    ↓
质量记录
    ↓
标签打印
    ↓
生产追溯
    ↓
ERP 完工回传
```

阶段一可以暂缓：

- 复杂 APS；
- 大规模设备协议库；
- L3 设备闭环控制；
- 复杂 QMS 全流程；
- IoT 中台；
- 高级 BI；
- 多客户深度定制。

## 28. 与现有预研的关系

| 软件设计模块 | 对应预研 |
|---|---|
| 工艺管理 | PRE-01、PRE-07 |
| BOM 管理 | PRE-07、PRE-11 |
| 生产追溯 | PRE-08 |
| 设备采集 | PRE-06 |
| 工单管理 | PRE-10、PRE-12 |
| 质量管理 | PRE-09 |
| 物料执行 | PRE-11 |
| 云边协同 | PRE-03 |
| 边缘远程升级 | PRE-04 |
| 标签打印 | PRE-05 |
| 组织权限 | PRE-13 |
| 排产 APS | PRE-14 |
| 异常 Andon | PRE-15 |
| 可观测性 | PRE-16 |
| 安全体系 | PRE-17 |
| 备份灾备 | PRE-18 |
| 外围集成 | PRE-19 |
| 实施初始化 | PRE-20 |
| 配置中心 | PRE-21 |
| 版本兼容 | PRE-22 |
| 数据生命周期 | PRE-23 |
| 测试验收 | PRE-24 |
| 路线图 | PRE-25 |

