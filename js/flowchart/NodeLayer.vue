<script setup lang="ts">
import {useAvocado, Node, plugin} from "./avocado.js";
// import Article from "./Article.vue";

const avocado = useAvocado()

function computePortY(type: number, i: number, node: Node) {
  return Math.floor(node.height / ((type === 0 ? node.ip : node.op) + 1)) * (i + 1) - 6
}

// const com = Article

</script>

<template>
  <div v-for="(node) in avocado.nodes" :key="node.id"
       @mousedown="e => avocado.handleMouseDownOnNode(e, node)"
       draggable="false"
       class="flowchart-node shadow"
       :style="{left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px`}">
    <div class="absolute w-full h-full hidden">
      <component :is="plugin(node)" :key="node.id+node.plugin" :uuid="node.id"/>
    </div>
    <!--      <div class="w-full" style="height: 32px; background-color: #40c9fa; margin-top: .5rem;"-->
    <!--           :class="{'noneffective-events': cursor.task === 1}"-->
    <!--           @mousedown="stopPropagation" @mouseup="stopPropagation" @mousemove="stopPropagation" @click="stopPropagation">-->
    <!--        <input />-->
    <!--      </div>-->
    <div v-if="node.ip > 0" v-for="(_, i) in new Array(node.ip).fill(0)"
         class="flowchart-port flowchart-port-in shadow"
         :style="{top: `${computePortY(0, i, node)}px`}"
         @mousedown="e => avocado.handleMouseDownOnPort(e, {node, type: 0, index: i})"
         @mouseup="e => avocado.handleMouseUpOnPort(e, {node, type: 0, index: i})"
    ></div>
    <div v-if="node.op > 0" v-for="(_, i) in new Array(node.op).fill(0)"
         class="flowchart-port flowchart-port-out shadow"
         :style="{top: `${computePortY(1, i, node)}px`}"
         @mousedown="e => avocado.handleMouseDownOnPort(e, {node, type: 1, index: i})"
         @mouseup="e => avocado.handleMouseUpOnPort(e, {node, type: 1, index: i})"
    ></div>
  </div>
  <div v-if="avocado.activeFrame.active" class="active-frame" :style="{
      left: `${avocado.activeFrame.x}px`, top: `${avocado.activeFrame.y}px`,
      width: `${avocado.activeFrame.width}px`, height: `${avocado.activeFrame.height}px`
  }"></div>
</template>

<style scoped>

</style>
