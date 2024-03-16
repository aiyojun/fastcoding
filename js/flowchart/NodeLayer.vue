<script setup lang="ts">
import {useAvocado, Node, plugin, Port} from "./avocado.js";

const avocado = useAvocado()

function computePortY(port: Port) {
  return port.offsetY - 6
}

</script>

<template>
  <div v-for="(node) in avocado.nodes" :key="node.id"
       @mousedown="e => avocado.handleMouseDownOnNode(e, node)"
       class="flowchart-node shadow"
       :style="{left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px`}">
    <div class="absolute w-full h-full hidden">
      <component :is="plugin(node)" :key="node.id+node.plugin" :uuid="node.id"/>
    </div>
    <div v-if="node.ports.length > 0" v-for="(port) in node.ports"
         class="flowchart-port shadow"
         :class="{'flowchart-port-in': port.type === 0, 'flowchart-port-out': port.type === 1}"
         :style="{top: `${computePortY(port)}px`}"
         @mousedown="e => avocado.handleMouseDownOnPort(e, port)"
         @mouseup="e => avocado.handleMouseUpOnPort(e, port)"
    ></div>
  </div>
  <div v-if="avocado.activeFrame.active" class="active-frame" :style="{
      left: `${avocado.activeFrame.x}px`, top: `${avocado.activeFrame.y}px`,
      width: `${avocado.activeFrame.width}px`, height: `${avocado.activeFrame.height}px`
  }"></div>
</template>

<style scoped>

</style>
