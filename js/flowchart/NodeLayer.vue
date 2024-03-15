<script setup lang="ts">
import {
  Node, Point, useAvocado
  // , handleMouseDownOnLayer, handleMouseDownOnNode, handleMouseMoveOnLayer, handleMouseUpOnLayer
} from "./avocado.js";
import {reactive} from "vue";
import {ignore, stopPropagation} from "../utils.ts";
import {acceptHMRUpdate} from "pinia";

function coordination(e: MouseEvent): Point {
  return {x: e.clientX - avocado.palette.offsetX, y: e.clientY - avocado.palette.offsetY}
}

const cursor = reactive({
  task: -1,
  startPoint: {x: 0, y: 0},
  holdNode: null,
  holdNodeStartPoint: {x: 0, y: 0},
})

function handleMouseDownOnLayer(e: MouseEvent) {
  ignore(e)
  cursor.holdNode = null
  Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
  Object.assign(avocado.activeFrame, {...coordination(e), width: 0, height: 0})
  cursor.task = 0
  avocado.activeFrame.active = true
}

function handleMouseUpOnLayer(e: MouseEvent) {
  ignore(e)
  cursor.holdNode = null
  cursor.task = -1
  avocado.activeFrame.active = false
  avocado.activeWire.active = false
}

function handleMouseDownOnNode(e: MouseEvent, node: Node) {
  ignore(e)
  cursor.holdNode = node
  Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
  Object.assign(cursor.holdNodeStartPoint, {x: node.x, y: node.y})
  cursor.task = 1
}

function handleMouseMoveOnLayer(e: MouseEvent) {
  ignore(e)
  if (e.buttons === 1 && cursor.holdNode !== null && cursor.task === 1) {
    Object.assign(cursor.holdNode, {
      x: e.clientX - cursor.startPoint.x + cursor.holdNodeStartPoint.x,
      y: e.clientY - cursor.startPoint.y + cursor.holdNodeStartPoint.y
    })
  } else if (e.buttons === 1 && cursor.holdNode === null && cursor.task === 0) {
    Object.assign(avocado.activeFrame, {
      width : e.clientX - cursor.startPoint.x,
      height: e.clientY - cursor.startPoint.y
    })
  } else if (e.buttons === 1 && cursor.task === 2) {
    avocado.activeWire.p1 = coordination(e)
  }
}

function handleMouseDownOnPort(e: MouseEvent, node: Node, i: number, out: boolean = true) {
  ignore(e)
  cursor.task = 2
  avocado.activeWire.active = true
  Object.assign(avocado.activeWire.startPort, {node, out, i})
  avocado.activeWire.p1 = coordination(e)
}

function handleMouseUpOnPort(e: MouseEvent) {
  ignore(e)
  avocado.activeWire.active = false
}


const avocado = useAvocado()

</script>

<template>
  <div class="absolute w-full h-full"
       @mousedown="handleMouseDownOnLayer"
       @mousemove="handleMouseMoveOnLayer"
       @mouseup="handleMouseUpOnLayer">
    <div v-for="(node) in avocado.nodes" :key="node.id"
         @mousedown="e => handleMouseDownOnNode(e, node)"
         draggable="false"
         class="flowchart-node shadow"
         :style="{left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px`}">
<!--      <div class="w-full" style="height: 32px; background-color: #40c9fa; margin-top: .5rem;"-->
<!--           :class="{'noneffective-events': cursor.task === 1}"-->
<!--           @mousedown="stopPropagation" @mouseup="stopPropagation" @mousemove="stopPropagation" @click="stopPropagation">-->
<!--        <input />-->
<!--      </div>-->
      <div v-if="node.ip > 0" v-for="(_, i) in new Array(node.ip).fill(0)"
           class="flowchart-port flowchart-port-in shadow"
           :style="{top: `${Math.floor(node.height / (node.ip + 1)) * (i + 1) - 6}px`}"
           @mousedown="e => handleMouseDownOnPort(e, node, i, false)"
           @mouseup="handleMouseUpOnPort"
      ></div>
      <div v-if="node.op > 0" v-for="(_, i) in new Array(node.op).fill(0)"
           class="flowchart-port flowchart-port-out shadow"
           :style="{top: `${Math.floor(node.height / (node.ip + 1)) * (i + 1) - 6}px`}"
           @mousedown="e => handleMouseDownOnPort(e, node, i, true)"
           @mouseup="handleMouseUpOnPort"
      ></div>
    </div>
    <div v-if="avocado.activeFrame.active" class="active-frame" :style="{
      left: `${avocado.activeFrame.x}px`, top: `${avocado.activeFrame.y}px`,
      width: `${avocado.activeFrame.width}px`, height: `${avocado.activeFrame.height}px`
    }"></div>
  </div>
</template>

<style scoped>


</style>
