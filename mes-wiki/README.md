# 线束 MES 预研 Wiki

> 项目：线束制造执行系统（MES）  
> 版本：Wiki V1.0  
> 整理日期：2026-08-20  
> 状态：预研基线，供产品、研发、实施评审使用

本 Wiki 将已完成的 PRE-01、02、03、04、06 预研资料重新归一，并补充 MES 产品化所需的领域模型、追溯、质量、工单执行、物料执行、ERP、组织权限、排产、异常、可观测性、安全、灾备、实施与测试等课题。

## 使用原则

1. **MES 是独立新项目**，本文档不引用其他业务项目的数据模型或架构作为既定事实。
2. **已上传资料优先**：凡与原始 PRE-01/02/03/04/06 一致的内容，以原始文档为基线。
3. **新增预研与既定决策分离**：新增课题标记为“建议稿/待评审”，避免把建议误当成既定方案。
4. **先业务模型、后技术实现**：优先稳定 WorkOrder、Operation、Batch、Material、Quality、Event、SN、Genealogy 等核心对象。
5. **边缘保障不停产，云端保障集中治理**：现场确定性执行留在边缘，集中管理与分析放在云端。

## 快速入口

- [00 总览与预研地图](docs/00-overview.md)
- [01 工艺路线与工序配置](docs/01-process-routing.md)
- [02 关键技术要点](docs/02-key-technical-points.md)
- [03 云边协同架构](docs/03-cloud-edge.md)
- [04 边缘节点远程更新](docs/04-edge-update.md)
- [05 标签打印体系](docs/05-label-printing.md)
- [06 设备协议适配库](docs/06-device-adapter.md)
- [07 MES 核心领域模型](docs/07-domain-model.md)
- [08 批次 / SN / Genealogy 追溯](docs/08-traceability.md)
- [09 质量管理与不合格闭环](docs/09-quality.md)
- [10 工单与工序执行状态机](docs/10-workorder-state-machine.md)
- [11 生产物料执行模型](docs/11-material-execution.md)
- [12 ERP 集成规范](docs/12-erp-integration.md)
- [13 组织、权限与多工厂模型](docs/13-org-security.md)
- [14 生产计划与 APS 演进](docs/14-planning-aps.md)
- [15 异常 / Andon / 停线管理](docs/15-andon.md)
- [16 可观测性与远程运维](docs/16-observability.md)
- [17 MES 安全体系](docs/17-security.md)
- [18 备份、灾备与恢复](docs/18-backup-dr.md)
- [19 外围系统集成边界](docs/19-integration-boundary.md)
- [20 客户实施与初始化体系](docs/20-implementation.md)
- [21 配置中心与主数据发布](docs/21-config-center.md)
- [22 版本兼容与演进策略](docs/22-version-compatibility.md)
- [23 数据生命周期与归档](docs/23-data-lifecycle.md)
- [24 测试、验收与上线门禁](docs/24-test-acceptance.md)
- [25 阶段路线图与开发顺序](docs/25-roadmap.md)

## 文档状态说明

| 状态 | 含义 |
|---|---|
| 基线 | 来自已上传预研，主要做结构化重整 |
| 拆分整理 | 从已有资料中抽取成独立课题 |
| 建议稿 | 基于当前体系新增，需业务/产品/技术共同评审 |
| 待实地验证 | 需要结合首家线束厂真实工艺、设备、ERP、组织流程确认 |

## 原始资料

`sources/` 保存本次整理使用的原始 PRE 文档副本，便于追溯差异。
