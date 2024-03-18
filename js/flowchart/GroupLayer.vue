<script setup lang="ts">

import {Group, useAvocado} from "./avocado.js";

const avocado = useAvocado()
const DELTA = 5
function computeGroupBoundingRect(group: Group) {
  const rect = {x: 0, y: 0, xe: 0, ye: 0}
  for (let i = 0; i < group.nodes.length; i++) {
    const node = group.nodes[i]
    const xe = node.x + node.width
    const ye = node.y + node.height
    if (i === 0) {
      Object.assign(rect, {x: node.x, y: node.y})
      Object.assign(rect, {xe, ye})
    } else {
      if (node.x < rect.x) rect.x = node.x
      if (node.y < rect.y) rect.y = node.y
      if (xe > rect.xe) rect.xe = xe
      if (ye > rect.ye) rect.ye = ye
    }
  }
  const r = {x: rect.x, y: rect.y, width: rect.xe - rect.x, height: rect.ye - rect.y}
  return {left: `${r.x - DELTA}px`, top: `${r.y - DELTA}px`, width: `${r.width + DELTA * 2}px`, height: `${r.height + DELTA * 2}px`}
}

</script>

<template>
  <div v-for="(group) in avocado.groups" :key="group.id"
       class="absolute flowchart-group" :style="computeGroupBoundingRect(group)"
       @mousedown="e => avocado.handleMouseDownOnGroup(e, group)">

  </div>
</template>

<style scoped>

</style>
