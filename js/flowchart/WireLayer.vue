<script setup lang="ts">

import {Point, Port, useAvocado, Wire} from "./avocado.js";
import {pathd} from "./jlib.js";

const avocado = useAvocado()

function computePointCoordination(port: Port): Point {
  const node = port.node
  return {
    x: node.x + (port.type === 1 ? node.width : 0),
    y: node.y + port.offsetY
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

function generateActivePath(port: Port, p1: Point) {
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

</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${avocado.palette.width} ${avocado.palette.height}`">
    <path v-for="(wire) in avocado.wires" :key="wire.id"
          stroke="#333" fill="none"
          class="hover-pointer"
          @mousedown="e => avocado.handleMouseDownOnWire(e, wire)"
          :d="generatePath(wire)"/>

    <path v-if="avocado.activeWire.active"
          stroke="#333" fill="none"
          :d="generateActivePath(avocado.activeWire.start, avocado.activeWire.p1)"/>
  </svg>
</template>

<style scoped>

.hover-pointer:hover {
  cursor: pointer;
}

</style>
