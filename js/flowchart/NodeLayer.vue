<script setup lang="ts">
import {useAvocado, plugin, Port} from "./avocado.js";

const avocado = useAvocado()

function computePortY(port: Port) {
  return port.offsetY - 8
}

</script>

<template>
  <div v-for="(node) in avocado.nodes" :key="node.id"
       @mousedown="e => avocado.handleMouseDownOnNode(e, node)"
       class="flowchart-node shadow"
       :class="{'selected-node': avocado.selectedNodes.filter(e => e.id === node.id).length > 0}"
       :style="{left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px`, transform: `scale(${avocado.palette.scale})`}">
    <div class="absolute w-full h-full hidden">
      <component :is="plugin(node)" :key="node.id + node.plugin" :uuid="node.id"/>
    </div>
    <div v-if="node.ports.length > 0" v-for="(port) in node.ports"
         class="flowchart-port shadow"
         :class="{'flowchart-port-in': port.type === 0, 'flowchart-port-out': port.type === 1}"
         :style="{top: `${computePortY(port)}px`}"
         @mousedown="e => avocado.handleMouseDownOnPort(e, {node, port})"
         @mouseup="e => avocado.handleMouseUpOnPort(e, {node, port})"
    ></div>
  </div>
  <div v-if="avocado.frame.active" class="active-frame" :style="{
      left: `${avocado.frame.x}px`, top: `${avocado.frame.y}px`,
      width: `${avocado.frame.width}px`, height: `${avocado.frame.height}px`
  }"></div>
</template>

<style scoped>

</style>
