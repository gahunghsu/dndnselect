<template>
  <drag-select v-model="selection" class="drag-select">
    <div class="lists-container">
      <!-- 列表 A -->
      <div ref="parentA" class="list-box">
        <drag-select-option
          v-for="(item, index) in listA"
          :key="item.id"
          :value="item.id"
          class="item-wrapper"
        >
          <div :index="index" class="item-card" :class="{ 'selected': selection.includes(item.id) }">
            {{ item.name }}
          </div>
        </drag-select-option>
      </div>
      <!-- 列表 B -->
      <div ref="parentB" class="list-box">
        <drag-select-option
          v-for="(item, index) in listB"
          :key="item.id"
          :value="item.id"
          class="item-wrapper"
        >
          <div :index="index" class="item-card" :class="{ 'selected': selection.includes(item.id) }">
            {{ item.name }}
          </div>
        </drag-select-option>
      </div>
      <!-- 列表 C -->
      <div ref="parentC" class="list-box">
        <drag-select-option
          v-for="(item, index) in listC"
          :key="item.id"
          :value="item.id"
          class="item-wrapper"
        >
          <div :index="index" class="item-card" :class="{ 'selected': selection.includes(item.id) }">
            {{ item.name }}
          </div>
        </drag-select-option>
      </div>
    </div>
  </drag-select>

  <!-- 只有当已选项不为空时，显示「处理选中」按钮 -->
  <button
    v-if="selection.length > 0 && !showModal"
    class="process-button"
    @click="openModal"
  >
    处理已选 ({{ selection.length }} 项)
  </button>

  <!-- 弹窗 -->
  <div v-if="showModal" class="modal-overlay" @click.self="onCancel">
    <div class="modal-content">
      <h3>输入文字</h3>
      <p>已选 {{ selection.length }} 项，ID：{{ selection.join(', ') }}</p>
      <textarea v-model="inputText" rows="4" class="modal-textarea" placeholder="请输入..."></textarea>
      <div class="modal-buttons">
        <button @click="onConfirm">确认</button>
        <button @click="onCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDragAndDrop } from 'fluid-dnd/vue'

interface Item { id: number; name: string }

// 示例数据生成
function generateItems(prefix: string, count: number, startId: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    name: `${prefix}-${startId + i}`,
  }))
}

const listA = ref<Item[]>(generateItems('A', 9, 1))
const listB = ref<Item[]>(generateItems('B', 9, 101))
const listC = ref<Item[]>(generateItems('C', 9, 201))

// fluid-dnd 初始化
const [parentA] = useDragAndDrop(listA, {
  droppableGroup: 'group',
  draggingClass: 'dragging-item',
})
const [parentB] = useDragAndDrop(listB, {
  droppableGroup: 'group',
  draggingClass: 'dragging-item',
})
const [parentC] = useDragAndDrop(listC, {
  droppableGroup: 'group',
  draggingClass: 'dragging-item',
})

// 选中 ID 列表
const selection = ref<number[]>([])
// 控制弹窗显示
const showModal = ref(false)
const inputText = ref('')

// 点击「处理选中」按钮打开弹窗
function openModal() {
  showModal.value = true
  inputText.value = ''
}

// 确认后处理并关闭弹窗、清空选择
function onConfirm() {
  console.log('选中 IDs:', selection.value, '输入文本:', inputText.value)
  // 示例：给对应 item 添加 note
  selection.value.forEach(id => {
    let found = listA.value.find(i => i.id === id)
    if (found) (found as any).note = inputText.value
    else {
      found = listB.value.find(i => i.id === id)
      if (found) (found as any).note = inputText.value
      else {
        found = listC.value.find(i => i.id === id)
        if (found) (found as any).note = inputText.value
      }
    }
  })
  // 关闭弹窗并清空选择
  showModal.value = false
  selection.value = []
}

// 取消时关闭弹窗，可保留或清空选择；这里也清空选择
function onCancel() {
  showModal.value = false
  selection.value = []
}
</script>

<style scoped>
.lists-container {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.list-box {
  background: #f3f3f3;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}
.item-card {
  background: #fff;
  border: 1px solid #999;
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 8px;
  cursor: grab;
  user-select: none;
}
.item-card.selected {
  border-color: #007bff;
  background: #e0f0ff;
}
/* 拖拽中样式 */
.dragging-item {
  opacity: 0.5;
  transform: scale(1.03);
}

/* 处理按钮 */
.process-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff; padding: 1.5rem; border-radius: 8px;
  width: 90%; max-width: 400px;
}
.modal-textarea {
  width: 100%; margin: 0.5rem 0; resize: vertical;
}
.modal-buttons {
  display: flex; justify-content: flex-end; gap: 0.5rem;
}
.modal-buttons button {
  padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;
}
.modal-buttons button:first-child {
  background: #007bff; color: white;
}
.modal-buttons button:last-child {
  background: #ccc;
}
</style>
