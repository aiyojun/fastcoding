<script setup lang="ts">

import {onMounted, onUnmounted, ref} from "vue";
import {useAvocado} from "./avocado.js";
import NodeLayer from "./NodeLayer.vue";
import WireLayer from "./WireLayer.vue";

const containerEl = ref<HTMLDivElement>()
const avocado = useAvocado()
function handleResize() {
  const rect = containerEl.value.getBoundingClientRect()
  Object.assign(avocado.palette, {width: rect.width, height: rect.height, offsetX: rect.x, offsetY: rect.y})
}
onMounted(() => {handleResize(); window.addEventListener('resize', handleResize)})
onUnmounted(() => {window.removeEventListener('resize', handleResize)})

</script>

<template>
  <div class="absolute w-full h-full" ref="containerEl">
    <wire-layer />
    <node-layer />
  </div>
</template>

<style scoped>



</style>
