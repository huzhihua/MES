# 12 · ERP 集成规范

**状态：建议稿 / P0**

## 1. 集成边界

ERP → MES：产品/物料/BOM参考数据、生产计划/工单、客户/订单上下文（按客户情况）。  
MES → ERP：开工/完工、实际产量、报废、实际物料消耗、必要的质量/批次信息。

## 2. Adapter 架构

MES 内部使用稳定 Canonical Model；不同 ERP 通过 Adapter 完成字段、编码、状态、调用协议映射。

```text
ERP-A ─ Adapter-A ┐
ERP-B ─ Adapter-B ├─ Canonical Integration API ─ MES
ERP-C ─ Adapter-C ┘
```

## 3. 接口可靠性

- correlation_id / external_id；
- 幂等键；
- 请求/响应日志；
- 重试与退避；
- 死信/人工重放；
- 对账任务；
- schema/version 字段。

## 4. 不允许“接口失败阻塞生产”

ERP 回传失败只能影响外部同步状态，不得删除或回滚 MES 已确认的生产事实。

## 5. 工单变更

ERP 修改/取消已下发工单时，云端必须先查询边缘执行状态并应用状态机规则，不能单纯覆盖。

## 6. 首家客户验证项

ERP 厂商/版本、接口协议、BOM来源、工单编码、状态字典、单位换算、批次/序列号策略、完工和耗料回传粒度。
