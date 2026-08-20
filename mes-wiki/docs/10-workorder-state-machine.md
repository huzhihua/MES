# 10 · 工单与工序执行状态机

**状态：建议稿 / P0**

## 1. 两级状态机必须分离

工单状态反映整体执行；工序状态反映某一道工序。不能用单一 work_order.status 表达所有现场状态。

## 2. 工单建议状态

DRAFT → RELEASED → DISPATCHED → READY → RUNNING → COMPLETED → CLOSED。

旁路：HOLD、CANCELLED。生产开始后取消需受限，必要时改为 STOPPED/ABORTED 并保留已发生事实。

## 3. 工序建议状态

WAITING → READY → RUNNING → COMPLETED。

旁路：PAUSED、SKIPPED、FAILED、HOLD、REWORKING。

## 4. 状态变更来源

状态不能只靠页面按钮 UPDATE；应由命令产生事件，再由事件驱动状态投影。关键命令：release、dispatch、start、pause、resume、complete、hold、cancel、rework、close。

## 5. 数量维度

计划数、投入数、完工数、合格数、不良数、报废数、返工中数量应分开。状态与数量不能互相替代。

## 6. 修改规则

- 未下发：可修改计划；
- 已下发未开工：可受控变更并重新同步；
- 已开工：禁止无痕修改计划关键字段；
- 已完成：通过补充/冲销/返工等业务单据调整，不直接改历史。
