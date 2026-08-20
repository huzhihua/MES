# 07 · MES 核心领域模型

**状态：建议稿 / P0**

## 1. 为什么优先做

现有预研已共同依赖产品、BOM、工艺、工单、工序实例、报工、批次、SN、质量、设备事件。若对象边界不稳定，数据库、API、同步和追溯都会反复返工。

## 2. 建议领域划分

```text
Organization  Factory / Workshop / Line / Workstation / Shift
MasterData    Product / Material / BOM / Employee / Equipment
Process       Operation / Routing / RoutingVersion / SOP / ParameterSpec
Production    WorkOrder / WorkOrderOperation / ProductionBatch / Report / Event
Material      MaterialBatch / Feeding / Consumption / Return
Quality       InspectionPlan / InspectionRecord / Defect / Disposition / Rework
Traceability  ProductSN / TraceEvent / GenealogyRelation
Equipment     Device / DeviceEvent / DeviceParameter / DeviceAlarm
```

## 3. 聚合边界建议

### WorkOrder 聚合

保存计划身份和执行约束，不承载所有生产明细。工序执行事实通过 WorkOrderOperation + ProductionEvent 表达。

### Routing 聚合

模板按版本不可变发布；工单生成路线实例后与模板解耦。

### ProductionEvent

生产事实统一事件化：START、PAUSE、RESUME、COMPLETE、MATERIAL_FEED、INSPECTION、DEFECT、REWORK、DEVICE_CAPTURE 等。

### GenealogyRelation

表达“输入对象 → 输出对象”，对象可为物料批次、半成品批次、SN、包装单元。

## 4. 主键与业务编码

数据库主键与业务编码分离。推荐使用全局唯一 ID/UUID/雪花 ID 作为内部主键，工单号、批次号、SN 独立字段并建立业务唯一约束。

## 5. 多工厂维度

核心业务表至少具备 tenant_id（若未来SaaS）、factory_id；现场表按需带 workshop_id、line_id、workstation_id。

## 6. 时间字段规范

区分：event_time、device_time、received_time、created_at、synced_at，不用一个 create_time 表达所有时序语义。

## 7. 下一步输出物

- 领域上下文图；
- 核心 ER 图；
- 聚合根定义；
- 事件字典；
- ID/编码规范；
- 数据所有权矩阵。
