<script setup lang="ts">

import {onMounted, onUnmounted, ref} from "vue";
import {useAvocado} from "./avocado.js";
import {ignore} from "../utils.js";
import NodeLayer from "./NodeLayer.vue";
import WireLayer from "./WireLayer.vue";
import MenuLayer from "./MenuLayer.vue";
import GroupLayer from "./GroupLayer.vue";

const containerEl = ref<HTMLDivElement>()
const avocado = useAvocado()

function handleResize() {
  const rect = containerEl.value.getBoundingClientRect()
  Object.assign(avocado.palette, {width: rect.width, height: rect.height, offsetX: rect.x, offsetY: rect.y})
}

function sensitiveOperation() {
  avocado.closeMenu()
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize)
  window.addEventListener('click', sensitiveOperation)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('click', sensitiveOperation)
})


</script>

<template>
  <div class="absolute w-full h-full" style="margin: 0; padding: 0; overflow: hidden;"
       ref="containerEl"
       @contextmenu="ignore"
       @wheel="avocado.handleMouseWheel"
       @mousedown="avocado.handleMouseDownOnLayer"
       @mousemove="avocado.handleMouseMoveOnLayer"
       @mouseup="avocado.handleMouseUpOnLayer">
    <group-layer/>
    <wire-layer/>
    <node-layer/>
    <menu-layer/>
  </div>
</template>

<style scoped>

</style>
