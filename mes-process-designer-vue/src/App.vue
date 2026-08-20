<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const STORAGE_KEY = "harness-mes-process-draft";

const nodeLibrary = [
  { type: "cut", name: "定长裁线", icon: "裁", color: "#3878f6", hint: "按工单设定长度完成裁切" },
  { type: "strip", name: "剥皮", icon: "剥", color: "#8b5cf6", hint: "端部绝缘层剥除与尺寸确认" },
  { type: "seal", name: "穿防水栓", icon: "栓", color: "#16a3a5", hint: "防水栓型号与方向防错" },
  { type: "crimp", name: "端子压接", icon: "压", color: "#f08c32", hint: "端子、模具与拉力参数绑定" },
  { type: "insert", name: "插壳", icon: "插", color: "#db5f77", hint: "孔位顺序与颜色防错" },
  { type: "twist", name: "绞线", icon: "绞", color: "#6879d8", hint: "绞距、长度与线对配置" },
  { type: "weld", name: "超声波焊接", icon: "焊", color: "#d8a32e", hint: "能量、压力与焊点参数" },
  { type: "test", name: "导通测试", icon: "测", color: "#26a269", hint: "回路、耐压与短路测试" },
  { type: "inspect", name: "外观检验", icon: "检", color: "#5e7187", hint: "关键外观项目逐项确认" },
  { type: "pack", name: "包装入库", icon: "包", color: "#51646f", hint: "标签打印、装箱与入库" },
];

function makeNode(type, position) {
  const def = nodeLibrary.find((item) => item.type === type) || nodeLibrary[0];
  return {
    id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    code: `OP${String(position * 10).padStart(3, "0")}`,
    name: def.name,
    station: type === "test" ? "TEST-01" : `WS-${String(position).padStart(2, "0")}`,
    standardTime: type === "test" ? 28 : 18,
    setupTime: type === "crimp" ? 8 : 3,
    workCenter: type === "test" ? "终检区" : "前加工区",
    qualityMode: type === "test" ? "全检" : "首件+巡检",
    description: def.hint,
    mandatoryConfirm: type === "crimp" || type === "test",
    materialTrace: type === "crimp" || type === "insert",
    allowSkip: false,
  };
}

function createDefaultNodes() {
  return ["cut", "strip", "crimp", "insert", "test"].map((type, index) => makeNode(type, index + 1));
}

const flowMeta = ref({
  code: "WH-USB-C-001",
  name: "USB-C 连接线总成",
  version: "V1.0",
  productCode: "P-WH-240816",
  status: "草稿",
});
const nodes = ref(createDefaultNodes());
const selectedId = ref(nodes.value[0].id);
const search = ref("");
const activeTab = ref("library");
const drawerOpen = ref(false);
const savedAt = ref(null);
const toast = ref(null);
let dragged = null;
let toastTimer = null;

const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedId.value) || null);
const selectedDef = computed(() => nodeLibrary.find((item) => item.type === selectedNode.value?.type) || nodeLibrary[0]);
const filteredLibrary = computed(() => nodeLibrary.filter((item) => `${item.name}${item.hint}`.includes(search.value.trim())));
const totalTime = computed(() => nodes.value.reduce((sum, node) => sum + Number(node.standardTime || 0), 0));
const qualityCount = computed(() => nodes.value.filter((node) => node.mandatoryConfirm).length);
const traceCount = computed(() => nodes.value.filter((node) => node.materialTrace).length);
const issues = computed(() => validateFlow(flowMeta.value, nodes.value));
const result = computed(() => buildResult(flowMeta.value, nodes.value));
const resultJson = computed(() => JSON.stringify(result.value, null, 2));

onBeforeUnmount(() => clearTimeout(toastTimer));

function showToast(message, kind = "success") {
  toast.value = { message, kind };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 2600);
}

function startLibraryDrag(event, type) {
  dragged = { source: "library", type };
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("application/json", JSON.stringify(dragged));
}

function startNodeDrag(event, id) {
  dragged = { source: "canvas", id };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/json", JSON.stringify(dragged));
}

function readPayload(event) {
  try {
    return JSON.parse(event.dataTransfer.getData("application/json"));
  } catch {
    return dragged;
  }
}

function dropAt(event, targetIndex) {
  event.preventDefault();
  const payload = readPayload(event);
  if (!payload) return;

  if (payload.source === "library") {
    const fresh = makeNode(payload.type, targetIndex + 1);
    nodes.value.splice(targetIndex, 0, fresh);
    renumberDuplicateCodes(nodes.value);
    selectedId.value = fresh.id;
    showToast(`已添加“${fresh.name}”工序`);
  } else {
    const oldIndex = nodes.value.findIndex((node) => node.id === payload.id);
    if (oldIndex >= 0) {
      const [moved] = nodes.value.splice(oldIndex, 1);
      const adjusted = oldIndex < targetIndex ? targetIndex - 1 : targetIndex;
      nodes.value.splice(adjusted, 0, moved);
    }
  }
  dragged = null;
}

function removeNode() {
  if (!selectedNode.value) return;
  const index = nodes.value.findIndex((item) => item.id === selectedId.value);
  nodes.value.splice(index, 1);
  selectedId.value = nodes.value[Math.min(index, nodes.value.length - 1)]?.id || null;
  showToast("工序已移除", "neutral");
}

function duplicateNode() {
  if (!selectedNode.value) return;
  const index = nodes.value.findIndex((item) => item.id === selectedId.value);
  const copy = {
    ...selectedNode.value,
    id: `${selectedNode.value.type}-${Date.now().toString(36)}-copy`,
    code: `${selectedNode.value.code}-COPY`,
    name: `${selectedNode.value.name}（副本）`,
  };
  nodes.value.splice(index + 1, 0, copy);
  selectedId.value = copy.id;
  showToast("已复制工序节点");
}

function applyTemplate(types, label) {
  nodes.value = types.map((type, index) => makeNode(type, index + 1));
  selectedId.value = nodes.value[0]?.id || null;
  showToast(`已应用${label}模板`);
}

function saveDraft() {
  const now = new Date();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta: flowMeta.value, nodes: nodes.value, savedAt: now.toISOString() }));
  savedAt.value = now;
  showToast("草稿已保存到当前浏览器");
}

function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return showToast("当前浏览器没有已保存草稿", "neutral");
  try {
    const draft = JSON.parse(raw);
    flowMeta.value = { ...flowMeta.value, ...draft.meta };
    nodes.value = Array.isArray(draft.nodes) ? draft.nodes : [];
    selectedId.value = nodes.value[0]?.id || null;
    savedAt.value = draft.savedAt ? new Date(draft.savedAt) : null;
    showToast("已读取浏览器草稿");
  } catch {
    showToast("草稿数据已损坏，无法读取", "neutral");
  }
}

function clearFlow() {
  nodes.value = [];
  selectedId.value = null;
  showToast("画布已清空", "neutral");
}

function runValidation() {
  drawerOpen.value = true;
  showToast(issues.value.length ? `发现 ${issues.value.length} 项待完善配置` : "流程校验通过");
}

function exportJson() {
  const blob = new Blob([resultJson.value], { type: "application/json;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${flowMeta.value.code || "process-flow"}-${flowMeta.value.version || "draft"}.json`;
  link.click();
  URL.revokeObjectURL(href);
  showToast("配置 JSON 已导出");
}

function nodeDef(type) {
  return nodeLibrary.find((item) => item.type === type) || nodeLibrary[0];
}

function formatSavedAt(date) {
  return date?.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function renumberDuplicateCodes(list) {
  const seen = new Set();
  list.forEach((node, index) => {
    if (seen.has(node.code)) node.code = `OP${String((index + 1) * 10).padStart(3, "0")}`;
    seen.add(node.code);
  });
}

function validateFlow(meta, list) {
  const found = [];
  if (!meta.code.trim()) found.push("请填写工艺编码");
  if (!meta.name.trim()) found.push("请填写工艺名称");
  if (!list.length) found.push("流程至少需要一个工序节点");
  const codes = list.map((node) => node.code.trim()).filter(Boolean);
  if (codes.length !== list.length) found.push("存在未填写工序编码的节点");
  if (new Set(codes).size !== codes.length) found.push("工序编码不能重复");
  list.forEach((node, index) => {
    if (!node.station.trim()) found.push(`第 ${index + 1} 道“${node.name}”尚未配置工位`);
    if (Number(node.standardTime) <= 0) found.push(`第 ${index + 1} 道“${node.name}”标准工时必须大于 0`);
  });
  return found;
}

function buildResult(meta, list) {
  return {
    process: { ...meta, mode: "SERIAL", totalStandardTimeSeconds: list.reduce((sum, node) => sum + Number(node.standardTime || 0), 0) },
    route: list.map((node, index) => ({ sequence: (index + 1) * 10, ...node })),
    generatedAt: new Date().toISOString(),
  };
}
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark"><span /><span /><span /></div>
        <div><strong>HARNESS MES</strong><small>线束制造执行系统</small></div>
      </div>
      <div class="page-title">
        <span class="crumb">工艺管理</span><span class="slash">/</span><strong>工序流程配置</strong>
        <span class="draft-pill"><i />{{ flowMeta.status }}</span>
      </div>
      <div class="top-actions">
        <button class="button ghost" @click="runValidation">✓ 校验流程</button>
        <button class="button ghost" @click="drawerOpen = true">◉ 查看配置结果</button>
        <button class="button primary" @click="saveDraft">▣ 保存草稿</button>
        <button class="icon-button" title="读取浏览器草稿" @click="loadDraft">↻</button>
      </div>
    </header>

    <section class="meta-strip">
      <label><span>工艺编码</span><input v-model="flowMeta.code" /></label>
      <label class="wide"><span>工艺名称</span><input v-model="flowMeta.name" /></label>
      <label><span>产品编码</span><input v-model="flowMeta.productCode" /></label>
      <label class="version"><span>版本</span><input v-model="flowMeta.version" /></label>
      <div class="autosave"><span class="saved-dot" />{{ savedAt ? `${formatSavedAt(savedAt)} 已保存` : "修改尚未保存" }}</div>
    </section>

    <section class="designer">
      <aside class="library-panel">
        <div class="panel-tabs">
          <button :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">▦ 工序库</button>
          <button :class="{ active: activeTab === 'template' }" @click="activeTab = 'template'">⌘ 模板</button>
        </div>
        <template v-if="activeTab === 'library'">
          <div class="search-box"><span>⌕</span><input v-model="search" placeholder="搜索工序" /></div>
          <div class="library-heading"><span>基础工序</span><em>{{ filteredLibrary.length }}</em></div>
          <div class="library-list">
            <article
              v-for="item in filteredLibrary"
              :key="item.type"
              class="library-item"
              draggable="true"
              title="拖到中间画布添加工序"
              @dragstart="startLibraryDrag($event, item.type)"
              @dragend="dragged = null"
            >
              <span class="node-icon small" :style="{ '--node-color': item.color }">{{ item.icon }}</span>
              <div><strong>{{ item.name }}</strong><small>{{ item.hint }}</small></div>
              <span class="drag-grip">⠿</span>
            </article>
          </div>
          <p class="drag-tip">ⓘ 拖拽工序到画布中，或拖动画布节点调整顺序</p>
        </template>
        <div v-else class="template-list">
          <button @click="applyTemplate(['cut', 'strip', 'crimp', 'insert', 'test'], '基础端子线')">
            <strong>基础端子线</strong><span>裁线 → 剥皮 → 压接 → 插壳 → 测试</span><em>5 道工序</em>
          </button>
          <button @click="applyTemplate(['cut', 'strip', 'twist', 'crimp', 'test'], '双绞线束')">
            <strong>双绞线束</strong><span>裁线 → 剥皮 → 绞线 → 压接 → 测试</span><em>5 道工序</em>
          </button>
        </div>
      </aside>

      <section class="canvas-panel">
        <div class="canvas-toolbar">
          <div><strong>流程画布</strong><span>共 {{ nodes.length }} 道工序</span></div>
          <div class="toolbar-right"><button @click="clearFlow">清空</button><span>● 已配置</span><span class="active-dot">● 当前选中</span></div>
        </div>
        <div class="canvas-scroll">
          <div class="flow-start"><i /><span>开始</span></div>
          <div class="drop-zone" @dragover.prevent @drop="dropAt($event, 0)"><span>＋ 放到这里</span></div>
          <div class="flow-list">
            <div v-for="(node, index) in nodes" :key="node.id" class="flow-fragment">
              <article
                class="flow-node"
                :class="{ selected: selectedId === node.id }"
                draggable="true"
                @click="selectedId = node.id"
                @dragstart="startNodeDrag($event, node.id)"
                @dragend="dragged = null"
              >
                <span class="node-index">{{ String(index + 1).padStart(2, "0") }}</span>
                <span class="node-icon" :style="{ '--node-color': nodeDef(node.type).color }">{{ nodeDef(node.type).icon }}</span>
                <div class="node-main"><strong>{{ node.name }}</strong><small>{{ node.code }}</small></div>
                <div class="node-tags"><span>{{ node.station || "未设工位" }}</span><span>{{ node.standardTime || 0 }}s</span></div>
                <div class="node-flags"><i v-if="node.materialTrace">追</i><i v-if="node.mandatoryConfirm">确</i></div>
                <span class="node-drag">⠿</span>
              </article>
              <div v-if="index < nodes.length - 1" class="connector"><span /></div>
              <div class="drop-zone compact" @dragover.prevent @drop="dropAt($event, index + 1)"><span>＋ 放到这里</span></div>
            </div>
          </div>
          <div v-if="nodes.length === 0" class="empty-canvas" @dragover.prevent @drop="dropAt($event, 0)">
            <b>＋</b><strong>拖入第一个工序</strong><span>从左侧工序库开始搭建流程</span>
          </div>
          <div class="flow-end"><i /><span>结束</span></div>
        </div>
        <div class="canvas-summary">
          <div><span>标准节拍</span><strong>{{ totalTime }}<em> 秒</em></strong></div>
          <div><span>质量控制点</span><strong>{{ qualityCount }}<em> 个</em></strong></div>
          <div><span>物料追溯点</span><strong>{{ traceCount }}<em> 个</em></strong></div>
          <div :class="issues.length ? 'has-issues' : 'ok'"><span>配置状态</span><strong>{{ issues.length ? `${issues.length} 项待完善` : "完整" }}</strong></div>
        </div>
      </section>

      <aside class="config-panel">
        <div class="config-heading">
          <div><strong>节点配置</strong><span>{{ selectedNode?.code || "未选择节点" }}</span></div>
          <div v-if="selectedNode"><button class="tiny-icon" title="复制" @click="duplicateNode">▣</button><button class="tiny-icon danger" title="删除" @click="removeNode">⌫</button></div>
        </div>
        <div v-if="selectedNode" class="config-body">
          <div class="selected-summary">
            <span class="node-icon" :style="{ '--node-color': selectedDef.color }">{{ selectedDef.icon }}</span>
            <div><strong>{{ selectedNode.name }}</strong><small>第 {{ nodes.findIndex((item) => item.id === selectedNode.id) + 1 }} 道工序 · {{ selectedNode.type.toUpperCase() }}</small></div>
          </div>
          <fieldset><legend>基本信息</legend>
            <label class="form-field"><span>工序编码<b>*</b></span><input v-model.trim="selectedNode.code" @input="selectedNode.code = selectedNode.code.toUpperCase()" /></label>
            <label class="form-field"><span>工序名称<b>*</b></span><input v-model="selectedNode.name" /></label>
            <div class="field-row">
              <label class="form-field"><span>工作中心</span><select v-model="selectedNode.workCenter"><option>前加工区</option><option>装配区</option><option>终检区</option><option>包装区</option></select></label>
              <label class="form-field"><span>工位编码</span><input v-model="selectedNode.station" @input="selectedNode.station = selectedNode.station.toUpperCase()" /></label>
            </div>
          </fieldset>
          <fieldset><legend>节拍与质量</legend>
            <div class="field-row">
              <label class="form-field"><span>标准工时（秒）<b>*</b></span><input v-model.number="selectedNode.standardTime" type="number" min="1" /></label>
              <label class="form-field"><span>换型时间（分）</span><input v-model.number="selectedNode.setupTime" type="number" min="0" /></label>
            </div>
            <label class="form-field"><span>检验方式</span><select v-model="selectedNode.qualityMode"><option>首件+巡检</option><option>全检</option><option>抽检</option><option>免检</option></select></label>
            <label class="toggle-row"><div><strong>必须完成作业确认</strong><small>操作员完成当前工序后才能流转</small></div><input v-model="selectedNode.mandatoryConfirm" type="checkbox" /><span class="toggle-ui" /></label>
            <label class="toggle-row"><div><strong>启用物料批次追溯</strong><small>记录端子、护套等投入物料批次</small></div><input v-model="selectedNode.materialTrace" type="checkbox" /><span class="toggle-ui" /></label>
            <label class="toggle-row"><div><strong>允许跳过当前工序</strong><small>仅授权人员可执行跳站</small></div><input v-model="selectedNode.allowSkip" type="checkbox" /><span class="toggle-ui" /></label>
          </fieldset>
          <fieldset><legend>作业说明</legend><label class="form-field"><span>工序描述</span><textarea v-model="selectedNode.description" rows="3" /></label></fieldset>
        </div>
        <div v-else class="empty-config"><b>⌘</b><strong>选择一个工序节点</strong><span>在画布中点击节点后，可在这里配置工位、节拍与质量规则。</span></div>
      </aside>
    </section>

    <div v-if="drawerOpen" class="drawer-backdrop" @mousedown.self="drawerOpen = false">
      <aside class="result-drawer">
        <div class="drawer-header"><div><span class="eyebrow">CONFIGURATION RESULT</span><h2>工艺配置结果</h2><p>{{ flowMeta.code }} · {{ flowMeta.version }}</p></div><button class="icon-button" @click="drawerOpen = false">×</button></div>
        <div class="validation-card" :class="issues.length ? 'warning' : 'success'"><span class="validation-icon">{{ issues.length ? "!" : "✓" }}</span><div><strong>{{ issues.length ? `发现 ${issues.length} 项待完善` : "配置校验通过" }}</strong><p>{{ issues.length ? issues[0] : "节点顺序、编码与必填参数均已完成，可以导出配置。" }}</p></div></div>
        <ul v-if="issues.length > 1" class="issue-list"><li v-for="issue in issues.slice(1)" :key="issue">{{ issue }}</li></ul>
        <div class="result-stats"><div><span>工序数</span><strong>{{ nodes.length }}</strong></div><div><span>标准节拍</span><strong>{{ totalTime }}s</strong></div><div><span>质量点</span><strong>{{ qualityCount }}</strong></div></div>
        <div class="result-section"><div class="section-title"><strong>工序路线</strong><span>按执行顺序</span></div><div class="route-preview"><div v-for="(node, index) in nodes" :key="node.id"><span>{{ index + 1 }}</span><div><strong>{{ node.name }}</strong><small>{{ node.code }} · {{ node.station || "未设工位" }} · {{ node.standardTime }}s</small></div></div></div></div>
        <div class="result-section json-section"><div class="section-title"><strong>配置 JSON</strong><span>{{ resultJson.length }} 字符</span></div><pre>{{ resultJson }}</pre></div>
        <div class="drawer-actions"><button class="button ghost" @click="drawerOpen = false">返回编辑</button><button class="button primary" @click="exportJson">⇩ 导出 JSON</button></div>
      </aside>
    </div>

    <div v-if="toast" class="toast" :class="toast.kind"><span>{{ toast.kind === "success" ? "✓" : "ⓘ" }}</span>{{ toast.message }}</div>
  </main>
</template>
