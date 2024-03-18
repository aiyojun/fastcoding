<script setup lang="ts">

import {reactive} from "vue";
import {NodePort, Point, Wire, useAvocado} from "./avocado.js";
import {pathd} from "./jlib.js";
import iconCutWire from './cut-wire.svg'

const avocado = useAvocado()

function computePointCoordination({node, port}): Point {
  return {
    x: node.x + (port.type === 1 ? (node.width * avocado.palette.scale) : 0),
    y: node.y + (port.offsetY * avocado.palette.scale)
  }
}

function generatePath(wire: Wire) {
  const p0 = computePointCoordination(wire.src)
  const p1 = computePointCoordination(wire.dst)
  return pathd({
    ...{p1x: p0.x, p1y: p0.y, p2x: p1.x, p2y: p1.y}, ...{
      p1dir: 'right',
      p2dir: 'left',
      scale: 1,
      delta: 30,
      wire: 'curve',
      edge: 6
    }
  })
}

function generateActivePath(port: NodePort, p1: Point) {
  const p0 = computePointCoordination(port)
  return pathd({
    ...{p1x: p0.x, p1y: p0.y, p2x: p1.x, p2y: p1.y}, ...{
      p1dir: 'right',
      p2dir: 'left',
      scale: 1,
      delta: 30,
      wire: 'curve',
      edge: 6
    }
  })
}

const cursor = reactive({x: 0, y: 0, visible: false, id: null})

function handleMouseEnter(e: MouseEvent, id) {
  cursor.visible = true
  Object.assign(cursor, {...avocado.coordination(e), id})
}

function handleMouseMove(e: MouseEvent) {
  Object.assign(cursor, avocado.coordination(e))
}

function handleMouseLeave() {
  cursor.visible = false
  cursor.id = null
}


</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg"
       :viewBox="`0 0 ${avocado.palette.width} ${avocado.palette.height}`"
       stroke="#333" fill="none" :stroke-width="`${1.6 * avocado.palette.scale}`">
    <path v-for="(wire) in avocado.wires" :key="wire.id"
          class="hover-pointer"
          @mouseenter="e => handleMouseEnter(e, wire.id)"
          @mouseleave="handleMouseLeave"
          @mousemove="handleMouseMove"
          @mousedown="e => avocado.handleMouseDownOnWire(e, wire)"
          :d="generatePath(wire)"/>

    <path v-if="avocado.activeWire.active"
          stroke="#333" fill="none"
          :d="generateActivePath(avocado.activeWire.start, avocado.activeWire.p1)"/>

    <image v-if="cursor.visible && cursor.id !== null && avocado.wires.filter(e => e.id === cursor.id).length > 0"
           :x="`${cursor.x + 12}`" :y="`${cursor.y - 16}`"
           width="32" height="32" :href="iconCutWire"/>
  </svg>
</template>

<style scoped>

.hover-pointer:hover { /* cursor: pointer; */ }

</style>
