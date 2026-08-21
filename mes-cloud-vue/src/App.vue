<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="brand">
        <div class="brand-mark">M</div>
        <div>
          <strong>Cloud MES</strong>
          <span>线束制造云平台</span>
        </div>
      </div>

      <nav class="menu" aria-label="主菜单">
        <button
          v-for="item in menus"
          :key="item.key"
          class="menu-item"
          :class="{ active: currentKey === item.key }"
          type="button"
          @click="selectMenu(item.key)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </button>
      </nav>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <button class="icon-button mobile-only" type="button" aria-label="打开菜单" @click="menuOpen = !menuOpen">
          ☰
        </button>
        <div>
          <p class="eyebrow">云端 MES 管理平台 DEMO</p>
          <h1>{{ activeModule.title }}</h1>
        </div>
        <div class="top-actions">
          <div class="sync-pill" :class="syncState.className">
            <span></span>
            {{ syncState.text }}
          </div>
          <button class="ghost-button" type="button" @click="toggleSync">
            {{ syncState.nextText }}
          </button>
          <button class="primary-button" type="button" @click="simulateScan">扫码演示</button>
        </div>
      </header>

      <main>
        <section v-if="currentKey === 'home'" class="home-grid">
          <div class="hero-panel">
            <div>
              <p class="eyebrow">今日总览 · 天津线束一厂</p>
              <h2>云端管全局，边缘保生产不断线</h2>
              <p>
                演示覆盖标准 7 工序、工艺路线版本、扫码防错、工单执行、质量事件、成品 SN 追溯、
                标签打印和边缘节点同步。
              </p>
            </div>
            <div class="hero-score">
              <span>综合达成率</span>
              <strong>96.8%</strong>
              <small>较昨日 +2.4%</small>
            </div>
          </div>

          <div class="kpi-grid">
            <article v-for="metric in metrics" :key="metric.label" class="metric-card">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <small :class="metric.trendType">{{ metric.trend }}</small>
            </article>
          </div>

          <section class="panel production-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">生产节拍</p>
                <h3>标准工序流程</h3>
              </div>
              <span class="tag">路线 WH-AUTO-V3.2</span>
            </div>
            <div class="flow">
              <div v-for="(step, index) in processSteps" :key="step.name" class="flow-step" :class="step.status">
                <span>{{ index + 1 }}</span>
                <strong>{{ step.name }}</strong>
                <small>{{ step.detail }}</small>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">云边状态</p>
                <h3>边缘节点与同步队列</h3>
              </div>
              <span class="tag good">4 小时离线可运行</span>
            </div>
            <div class="edge-list">
              <div v-for="node in edgeNodes" :key="node.name" class="edge-row">
                <div>
                  <strong>{{ node.name }}</strong>
                  <span>{{ node.scope }}</span>
                </div>
                <div class="progress">
                  <span :style="{ width: node.progress + '%' }"></span>
                </div>
                <small>{{ node.queue }} 条待同步</small>
              </div>
            </div>
          </section>

          <section class="panel table-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">执行现场</p>
                <h3>重点工单</h3>
              </div>
              <button class="text-button" type="button" @click="currentKey = 'workOrder'">查看工单</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>工单</th>
                    <th>产品</th>
                    <th>工序</th>
                    <th>进度</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in workOrders.slice(0, 4)" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ order.product }}</td>
                    <td>{{ order.step }}</td>
                    <td>
                      <div class="mini-progress"><span :style="{ width: order.progress + '%' }"></span></div>
                    </td>
                    <td><span class="status" :class="order.statusClass">{{ order.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section v-else class="module-layout">
          <div class="module-summary panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">{{ activeModule.category }}</p>
                <h2>{{ activeModule.title }}</h2>
              </div>
              <span class="tag">{{ activeModule.badge }}</span>
            </div>
            <p>{{ activeModule.description }}</p>
            <div class="module-actions">
              <button class="primary-button" type="button">{{ activeModule.primaryAction }}</button>
              <button class="ghost-button" type="button">{{ activeModule.secondaryAction }}</button>
            </div>
          </div>

          <div class="module-cards">
            <article v-for="card in activeModule.cards" :key="card.label" class="metric-card">
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
              <small>{{ card.note }}</small>
            </article>
          </div>

          <section class="panel table-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">业务清单</p>
                <h3>{{ activeModule.tableTitle }}</h3>
              </div>
              <div class="segmented">
                <button
                  v-for="tab in activeModule.tabs"
                  :key="tab"
                  type="button"
                  :class="{ active: selectedTab === tab }"
                  @click="selectedTab = tab"
                >
                  {{ tab }}
                </button>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th v-for="head in activeModule.headers" :key="head">{{ head }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in activeRows" :key="row.join('-')">
                    <td v-for="cell in row" :key="cell">
                      <span v-if="isStatus(cell)" class="status" :class="statusClass(cell)">{{ cell }}</span>
                      <span v-else>{{ cell }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="panel insight-panel">
            <div>
              <p class="eyebrow">演示要点</p>
              <h3>{{ activeModule.insightTitle }}</h3>
              <p>{{ activeModule.insight }}</p>
            </div>
            <div class="scan-box">
              <span>最近扫码</span>
              <strong>{{ lastScan }}</strong>
              <small>5 秒防重扫 · 工序顺序校验 · BOM 四码防错</small>
            </div>
          </section>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const menuOpen = ref(false)
const currentKey = ref('home')
const selectedTab = ref('全部')
const online = ref(true)
const lastScan = ref('SN-WH-20260821-0187')

const menus = [
  { key: 'home', name: '首页', icon: '⌂' },
  { key: 'org', name: '组织权限', icon: '◎' },
  { key: 'master', name: '主数据', icon: '□' },
  { key: 'process', name: '工艺管理', icon: '↦' },
  { key: 'bom', name: 'BOM 管理', icon: '▤' },
  { key: 'drawing', name: '图纸管理', icon: '▧' },
  { key: 'schedule', name: '计划排产', icon: '◴' },
  { key: 'workOrder', name: '工单管理', icon: '▣' },
  { key: 'quality', name: '质量管理', icon: '✓' },
  { key: 'trace', name: '追溯中心', icon: '⌁' },
  { key: 'equipment', name: '设备管理', icon: '⚙' },
  { key: 'label', name: '标签中心', icon: '▦' },
  { key: 'andon', name: '异常 Andon', icon: '!' },
  { key: 'report', name: '报表分析', icon: '▥' },
  { key: 'config', name: '配置中心', icon: '◫' },
  { key: 'integration', name: '集成中心', icon: '⇄' },
  { key: 'edge', name: '云边运维', icon: '⇅' },
  { key: 'delivery', name: '实施管理', icon: '◇' },
  { key: 'system', name: '系统设置', icon: '⌘' }
]

const metrics = [
  { label: '今日计划', value: '12,800 pcs', trend: '已排 18 张工单', trendType: 'good-text' },
  { label: '完工数量', value: '9,842 pcs', trend: '达成 76.9%', trendType: 'good-text' },
  { label: '一次合格率', value: '98.6%', trend: '不良 137 pcs', trendType: 'warn-text' },
  { label: 'Andon 未关闭', value: '6', trend: '平均响应 4.2 分钟', trendType: 'bad-text' }
]

const processSteps = [
  { name: '裁线下线', detail: '看板标签', status: 'done' },
  { name: '压接', detail: '端子/导线/模具/防水栓', status: 'done' },
  { name: '预装', detail: '板位码校验', status: 'doing' },
  { name: '总装', detail: '线束分支装配', status: 'waiting' },
  { name: '导通测试', detail: '100% 电测', status: 'waiting' },
  { name: '外检', detail: '外观与尺寸', status: 'waiting' },
  { name: '包装入库', detail: '箱标打印', status: 'waiting' }
]

const edgeNodes = [
  { name: 'EDGE-TJ-01', scope: '一车间 A 线', progress: 98, queue: 0 },
  { name: 'EDGE-TJ-02', scope: '一车间 B 线', progress: 86, queue: 24 },
  { name: 'EDGE-HB-01', scope: '河北分厂试产线', progress: 72, queue: 138 }
]

const workOrders = [
  { id: 'WO-260821-001', product: '汽车门板线束 WH-A102', step: '预装', progress: 64, status: '生产中', statusClass: 'running' },
  { id: 'WO-260821-002', product: '家电电源线束 HA-08', step: '导通测试', progress: 82, status: '待检验', statusClass: 'pending' },
  { id: 'WO-260821-003', product: '工业控制线束 IN-C32', step: '压接', progress: 31, status: '异常', statusClass: 'alert' },
  { id: 'WO-260821-004', product: '防水端子线束 WH-WP9', step: '包装入库', progress: 96, status: '待入库', statusClass: 'done' }
]

const moduleMap = {
  org: buildModule('组织权限', '权限与数据隔离', 'RBAC + 工厂/车间/产线行级数据权限，覆盖操作工、班组长、工艺工程师、质量工程师和管理员。', '组织架构', ['用户', '角色', '权限点', '数据范围'], [
    ['天津线束一厂', '一车间', '班组长张工', '在线'],
    ['天津线束一厂', '二车间', '质量工程师李工', '在线'],
    ['河北试产基地', '试产线', '工艺工程师王工', '待审核']
  ]),
  master: buildModule('主数据', '产品/物料/客户基础档案', '集中维护物料、产品、客户、供应商、工位和不良代码，为工艺、BOM、排产和追溯提供统一主数据。', '主数据版本 v13', ['对象', '编码', '名称', '状态'], [
    ['产品', 'WH-A102', '汽车门板线束', '启用'],
    ['物料', 'WIRE-AVSS-05R', '0.5 红色导线', '启用'],
    ['客户', 'OEM-TJ-01', '天津主机厂', '启用']
  ]),
  process: buildModule('工艺管理', '行业模板 + 有界配置', '预置线束标准 7 工序，支持工序增删、拖拽排序、扫码点开关、版本发布与在制工单快照锁定。', '路线 V3.2', ['路线', '行业', '工序数', '状态'], [
    ['WH-AUTO-V3.2', '汽车线束', '7 + 防水栓', '已发布'],
    ['HA-HOME-V1.6', '家电线束', '5', '评审中'],
    ['IN-CTRL-V2.1', '工业线束', '6 + 焊接', '草稿']
  ]),
  bom: buildModule('BOM 管理', '多层 BOM 与替代料', '按产品和工艺路线维护导线、端子、防水栓、胶壳、辅料清单，支持版本、生效日期和防错校验。', 'BOM-A102-08', ['BOM', '产品', '物料项', '状态'], [
    ['BOM-A102-08', 'WH-A102', '38 项', '已发布'],
    ['BOM-HA08-03', 'HA-08', '12 项', '已发布'],
    ['BOM-WP9-02', 'WH-WP9', '46 项', '变更中']
  ]),
  drawing: buildModule('图纸管理', '图纸/SOP/视频作业指导', '管理线束图纸、端子压接标准、板位图、SOP 和检验规范，并与工序和工位绑定。', '受控文件', ['文件', '版本', '绑定对象', '状态'], [
    ['WH-A102-BOARD.pdf', 'V2.4', '总装工序', '受控'],
    ['CRIMP-STD-08.pdf', 'V1.9', '压接工序', '受控'],
    ['TEST-SOP-A102.mp4', 'V1.1', '导通测试', '待审核']
  ]),
  schedule: buildModule('计划排产', '订单到工单的排程驾驶舱', '根据订单交期、产线能力、设备状态和物料齐套进行有限能力排程，并下发到边缘节点。', '今日 18 单', ['计划', '产线', '数量', '状态'], [
    ['SCH-0821-A', 'A 线', '6,000 pcs', '已下发'],
    ['SCH-0821-B', 'B 线', '4,200 pcs', '生产中'],
    ['SCH-0821-T', '试产线', '600 pcs', '待齐套']
  ]),
  workOrder: buildModule('工单管理', '工单快照与执行闭环', '工单创建时复制工艺路线模板为执行快照，在制期间不受模板变更影响，保证追溯链稳定。', 'WIP 26 单', ['工单', '产品', '当前工序', '状态'], workOrders.map((item) => [item.id, item.product, item.step, item.status])),
  quality: buildModule('质量管理', '首检/巡检/完工检', '覆盖压接高度、拉力、导通、耐压、绝缘、外观等检验项目，不良事件以追加方式进入追溯链。', 'FPY 98.6%', ['检验单', '工序', '项目', '状态'], [
    ['QC-260821-117', '压接', '拉力 ≥ 80N', '合格'],
    ['QC-260821-118', '导通测试', '全回路导通', '合格'],
    ['QC-260821-119', '外检', '胶壳划伤', '不合格']
  ]),
  trace: buildModule('追溯中心', '成品 SN 到物料批次的双向追溯', '基于生产事件和关系链，串联人、机、料、法、环、测，支持正向召回和反向原因定位。', 'SN 级追溯', ['对象', '上游', '当前节点', '状态'], [
    ['SN-WH-20260821-0187', 'LOT-WIRE-7782', '导通测试', '合格'],
    ['SN-WH-20260821-0188', 'LOT-TERM-2218', '外检', '待检验'],
    ['LOT-WATER-3302', '供应商批次', '压接消耗', '已归档']
  ]),
  equipment: buildModule('设备管理', '设备台账与协议适配', '管理裁线机、压接机、测试仪、打印机、扫码枪和边缘网关，预留 Modbus、OPC UA、串口和 MQTT 接入。', '在线率 94%', ['设备', '工位', '协议', '状态'], [
    ['CUT-KMX-01', '裁线下线', 'MIKO/WPCS', '在线'],
    ['CRIMP-HP-03', '压接', 'RS232', '在线'],
    ['TEST-SG-02', '导通测试', 'TCP/IP', '告警']
  ]),
  label: buildModule('标签中心', 'ZPL 模板与打印防错', '管理看板标签、端子标签、成品 SN、合格证和包装标签，记录重打原因与打印日志。', '5 类标签', ['模板', '触发工序', '打印机', '状态'], [
    ['看板标签', '裁线下线开工', 'Zebra-A01', '启用'],
    ['成品 SN 标签', '导通测试通过', 'Zebra-T02', '启用'],
    ['包装标签', '包装入库', 'Zebra-P01', '维护中']
  ]),
  andon: buildModule('异常 Andon', '异常上报与响应闭环', '操作工可上报设备故障、缺料、来料不良、质量异常，班组长和工程师按 SLA 响应关闭。', '未关闭 6', ['异常', '工位', '负责人', '状态'], [
    ['ANDON-8821', '压接 03', '设备工程师赵工', '处理中'],
    ['ANDON-8822', '总装 01', '班组长张工', '待响应'],
    ['ANDON-8823', '导通 02', '质量工程师李工', '已关闭']
  ]),
  report: buildModule('报表分析', 'OEE / 良率 / 产量 / 人效', '云端聚合跨班次、跨产线、跨工厂数据，输出产量、达成率、不良趋势、设备 OEE 和人员绩效。', '本周达成 93%', ['报表', '周期', '指标', '状态'], [
    ['产量日报', '今日', '9,842 pcs', '已生成'],
    ['不良 Top5', '本周', '压接高度偏差', '已生成'],
    ['OEE 分析', '本月', '78.4%', '计算中']
  ]),
  config: buildModule('配置中心', '业务参数与功能开关', '维护扫码去重时间、离线缓存时长、工序跳过原因、返工策略、版本评审流和字段显隐。', '参数集 v8', ['参数', '当前值', '范围', '状态'], [
    ['扫码防重扫', '5 秒', '1-30 秒', '启用'],
    ['离线缓存', '4 小时', '1-72 小时', '启用'],
    ['路线发布评审', '双人复核', '可配置', '启用']
  ]),
  integration: buildModule('集成中心', 'ERP / WMS / API 开放', '对接 ERP 订单、BOM、完工回传、物料消耗和 WMS 入库，同时提供开放 API 与 Webhook。', '接口 12 个', ['系统', '方向', '频率', '状态'], [
    ['ERP 工单拉取', 'ERP → MES', '5 分钟', '在线'],
    ['完工回传', 'MES → ERP', '实时', '在线'],
    ['WMS 入库', 'MES → WMS', '批量', '待联调']
  ]),
  edge: buildModule('云边运维', '边缘节点同步、离线、远程更新', '边缘负责扫码、报工、打印和本地追溯写入；云端负责主数据、分析、归档和版本发布。', '3 个节点', ['节点', '版本', '队列', '状态'], [
    ['EDGE-TJ-01', 'v1.0.2', '0', '在线'],
    ['EDGE-TJ-02', 'v1.0.2', '24', '补传中'],
    ['EDGE-HB-01', 'v1.0.1', '138', '离线']
  ]),
  delivery: buildModule('实施管理', '客户上线任务与验收', '管理首次部署、硬件就位、扫码枪/打印机配置、BOM 导入、工艺核对、培训和验收清单。', '项目 5 个', ['项目', '阶段', '负责人', '状态'], [
    ['天津线束一厂', '试运行', '实施经理刘工', '进行中'],
    ['河北试产基地', '数据准备', '实施顾问陈工', '待确认'],
    ['华东样板线', '验收', '项目经理周工', '已完成']
  ]),
  system: buildModule('系统设置', '租户、审计、安全与备份', '维护租户、菜单、审计日志、登录策略、备份策略和系统公告，支撑 SaaS 化与多工厂扩展。', '审计开启', ['设置项', '策略', '最近更新', '状态'], [
    ['登录策略', '密码 + 短信', '2026-08-19', '启用'],
    ['审计日志', '关键操作全记录', '2026-08-20', '启用'],
    ['数据备份', '每日 02:00', '2026-08-21', '启用']
  ])
}

function buildModule(title, category, description, badge, headers, rows) {
  return {
    title,
    category,
    description,
    badge,
    headers,
    rows,
    tabs: ['全部', '有效', '待处理'],
    tableTitle: `${title}列表`,
    primaryAction: '新增记录',
    secondaryAction: '导出演示数据',
    cards: [
      { label: '有效记录', value: String(rows.length * 12 + 8), note: '演示数据' },
      { label: '待处理', value: String(rows.filter((row) => /待|异常|告警|离线|变更/.test(row.join(''))).length + 2), note: '需关注' },
      { label: '最近同步', value: '30 秒前', note: '云边一致' }
    ],
    insightTitle: `${title}设计重点`,
    insight: description
  }
}

const activeModule = computed(() => moduleMap[currentKey.value] || moduleMap.process)

const activeRows = computed(() => {
  if (selectedTab.value === '全部') return activeModule.value.rows
  if (selectedTab.value === '待处理') {
    return activeModule.value.rows.filter((row) => /待|异常|告警|离线|变更|处理中/.test(row.join('')))
  }
  return activeModule.value.rows.filter((row) => !/待|异常|告警|离线|变更|不合格/.test(row.join('')))
})

const syncState = computed(() => {
  if (online.value) {
    return { text: '云边在线', nextText: '模拟离线', className: 'online' }
  }
  return { text: '离线模式', nextText: '恢复同步', className: 'offline' }
})

watch(currentKey, () => {
  selectedTab.value = '全部'
  menuOpen.value = false
})

function selectMenu(key) {
  currentKey.value = key
}

function toggleSync() {
  online.value = !online.value
}

function simulateScan() {
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  lastScan.value = `SN-WH-20260821-${suffix}`
  currentKey.value = currentKey.value === 'home' ? 'trace' : currentKey.value
}

function isStatus(value) {
  return /在线|启用|已发布|生产中|待|异常|告警|离线|合格|不合格|已完成|处理中|已关闭|补传中|草稿|评审/.test(value)
}

function statusClass(value) {
  if (/异常|告警|离线|不合格/.test(value)) return 'alert'
  if (/待|处理中|补传中|评审|草稿|维护/.test(value)) return 'pending'
  if (/完成|合格|发布|启用|在线|生产中|受控/.test(value)) return 'running'
  return 'done'
}
</script>
