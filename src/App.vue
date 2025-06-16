<template>
  <!-- 模式切換 -->
  <div class="mode-switch">
    <button :class="{ active: mode==='station' }" @click="mode='station'">
      站點設定
    </button>
    <button :class="{ active: mode==='line' }" @click="mode='line'">
      產線設定
    </button>
  </div>

  <!-- 1. 站點設定 -->
  <div v-if="mode==='station'" class="assign-container">
    <div class="lists-container">
      <div class="station-box">
        <h4>Station A</h4>
        <ul ref="parentA" class="list-box">
          <li
            v-for="(it,i) in listA"
            :key="it.id"
            :index="i"
            class="item-card"
            :style="itemStyle(it)"
          >
            {{ it.name }}
          </li>
        </ul>
      </div>
      <div class="station-box">
        <h4>Station B</h4>
        <ul ref="parentB" class="list-box">
          <li
            v-for="(it,i) in listB"
            :key="it.id"
            :index="i"
            class="item-card"
            :style="itemStyle(it)"
          >
            {{ it.name }}
          </li>
        </ul>
      </div>
      <div class="station-box">
        <h4>Station C</h4>
        <ul ref="parentC" class="list-box">
          <li
            v-for="(it,i) in listC"
            :key="it.id"
            :index="i"
            class="item-card"
            :style="itemStyle(it)"
          >
            {{ it.name }}
          </li>
        </ul>
      </div>
      <div class="station-box">
        <h4>設備池</h4>
        <ul ref="parentPool" class="list-box">
          <li
            v-for="(it,i) in devicePool"
            :key="it.id"
            :index="i"
            class="item-card"
            :style="itemStyle(it)"
          >
            {{ it.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 2. 產線設定 -->
  <div v-else class="line-container">
    <!-- 新增產線區 -->
    <div class="line-setup">
      <input
        v-model="newLineName"
        type="text"
        placeholder="輸入產線名稱"
      />
      <input
        v-model="newLineColor"
        type="color"
        title="選擇產線顏色"
      />
      <button
        @click="addLine"
        :disabled="!newLineName.trim()"
      >＋ 新增產線</button>
    </div>

    <!-- 產線選擇 Chips -->
    <div class="line-badges">
      <span
        v-for="ln in productionLines"
        :key="ln.id"
        class="line-badge"
        :style="{ backgroundColor: ln.color, opacity: activeLineId===ln.id ? 1 : 0.6 }"
        @click="activeLineId = ln.id"
      >
        {{ ln.name }}
      </span>
    </div>

    <!-- 框選區 -->
    <h4>框選下方設備後，點「指派至 {{ currentLine?.name || '—' }}」</h4>
    <drag-select
      v-model="selection"
      drag-area-class="all-assign-area"
      :draggable-on-option="false"
      class="drag-select"
    >
      <div class="assign-container all-assign-area">
        <div class="lists-container">
          <div class="station-box">
            <h4>Station A</h4>
            <ul class="list-box">
              <drag-select-option
                v-for="(it,i) in listA"
                :key="it.id"
                :value="it.id"
              >
                <li
                  :index="i"
                  class="item-card"
                  :style="itemStyle(it)"
                  :class="{ selected: selection.includes(it.id) }"
                >
                  {{ it.name }}
                </li>
              </drag-select-option>
            </ul>
          </div>
          <div class="station-box">
            <h4>Station B</h4>
            <ul class="list-box">
              <drag-select-option
                v-for="(it,i) in listB"
                :key="it.id"
                :value="it.id"
              >
                <li
                  :index="i"
                  class="item-card"
                  :style="itemStyle(it)"
                  :class="{ selected: selection.includes(it.id) }"
                >
                  {{ it.name }}
                </li>
              </drag-select-option>
            </ul>
          </div>
          <div class="station-box">
            <h4>Station C</h4>
            <ul class="list-box">
              <drag-select-option
                v-for="(it,i) in listC"
                :key="it.id"
                :value="it.id"
              >
                <li
                  :index="i"
                  class="item-card"
                  :style="itemStyle(it)"
                  :class="{ selected: selection.includes(it.id) }"
                >
                  {{ it.name }}
                </li>
              </drag-select-option>
            </ul>
          </div>
          <div class="station-box">
            <h4>設備池</h4>
            <ul class="list-box">
              <drag-select-option
                v-for="(it,i) in devicePool"
                :key="it.id"
                :value="it.id"
              >
                <li
                  :index="i"
                  class="item-card"
                  :style="itemStyle(it)"
                  :class="{ selected: selection.includes(it.id) }"
                >
                  {{ it.name }}
                </li>
              </drag-select-option>
            </ul>
          </div>
        </div>
      </div>
    </drag-select>

    <!-- 確認指派按鈕 -->
    <div class="line-assign-controls">
      <button
        :disabled="!selection.length || !currentLine"
        @click="assignLines"
      >
        指派 {{ selection.length }} 項到「{{ currentLine?.name }}」
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDragAndDrop } from 'fluid-dnd/vue'

interface Item { id: number; name: string; lineId?: number }
interface Line { id: number; name: string; color: string }

// 產生假資料
function genDevices(): Item[] {
  return Array.from({ length: 8 }, (_, i) => ({ id: i+1, name: `設備-${i+1}` }))
}

const devicePool = ref<Item[]>([])
const listA = ref<Item[]>([])
const listB = ref<Item[]>([])
const listC = ref<Item[]>([])

// Fluid-DnD：池與三站共用 droppableGroup
const [ parentPool ] = useDragAndDrop(devicePool, { droppableGroup: 'stations', draggingClass: 'dragging-item' })
const [ parentA    ] = useDragAndDrop(listA,      { droppableGroup: 'stations', draggingClass: 'dragging-item' })
const [ parentB    ] = useDragAndDrop(listB,      { droppableGroup: 'stations', draggingClass: 'dragging-item' })
const [ parentC    ] = useDragAndDrop(listC,      { droppableGroup: 'stations', draggingClass: 'dragging-item' })

// 模式
const mode = ref<'station'|'line'>('station')

// 產線設定
const productionLines = ref<Line[]>([])
const newLineName = ref('')
const newLineColor = ref('#28a745')
const activeLineId = ref<number|null>(null)

// 目前產線物件
const currentLine = computed(() => 
  productionLines.value.find(l => l.id === activeLineId.value!) || null
)

// 新增產線
function addLine() {
  const name = newLineName.value.trim()
  if (!name) return
  const id = Date.now()
  productionLines.value.push({ id, name, color: newLineColor.value })
  activeLineId.value = id
  newLineName.value = ''
}

// 框選結果
const selection = ref<number[]>([])

// 指派產線
function assignLines() {
  const lineId = activeLineId.value!
  const all = [...listA.value, ...listB.value, ...listC.value, ...devicePool.value]
  all.filter(it => selection.value.includes(it.id))
     .forEach(it => it.lineId = lineId)
  selection.value = []
}

// 卡片樣式
function itemStyle(it: Item) {
  const ln = productionLines.value.find(l => l.id === it.lineId)
  return ln ? { backgroundColor: ln.color, color: '#fff' } : {}
}

// 初始化
onMounted(() => {
  devicePool.value = genDevices()
  listA.value = []
  listB.value = []
  listC.value = []
})
</script>

<style scoped>
.mode-switch {
  margin-bottom: 1rem;
}
.mode-switch button {
  margin-right: .5rem;
  padding: .5rem 1rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}
.mode-switch button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.assign-container .lists-container,
.all-assign-area .lists-container {
  display: flex;
  gap: 1rem;
}

.station-box {
  text-align: center;
}
.station-box h4 {
  margin: 0 0 .5rem;
}

.list-box {
  list-style: none;
  margin: 0;
  padding: 8px;
  background: #f3f3f3;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

.item-card {
  margin-bottom: 6px;
  padding: 8px;
  background: #fff;
  border: 1px solid #999;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
}
.item-card.selected {
  outline: 2px dashed #007bff;
}
.dragging-item {
  opacity: .5;
  transform: scale(1.03);
}

.line-setup {
  display: flex;
  gap: .5rem;
  align-items: center;
  margin-bottom: .5rem;
}
.line-setup input[type="text"] {
  padding: .4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.line-setup input[type="color"] {
  width: 2.2rem;
  height: 2.2rem;
  border: none;
}
.line-setup button {
  padding: .4rem .8rem;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.line-badges {
  margin-bottom: 1rem;
}
.line-badge {
  display: inline-block;
  padding: .3rem .6rem;
  margin-right: .4rem;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.line-assign-controls {
  margin-top: 1rem;
}
.line-assign-controls button {
  padding: .6rem 1.2rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.line-assign-controls button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.drag-select {
  border: 1px dashed rgba(0,123,255,.5);
  border-radius: 4px;
}
</style>
