<script setup lang="ts">

import {Point, useAvocado, Wire} from "./avocado.js";
import {pathd} from "./jlib.ts";

const avocado = useAvocado()


function computePointCoordination(node: Node, i: number, out: boolean): Point {
  return {x: node.x + (out ? node.width : 0), y: node.y + node.height / ((out ? node.op : node.ip) + 1) * (i + 1)}
}
function generatePath(wire: Wire) {
  const p0 = computePointCoordination(wire.src, wire.op, true)
  const p1 = computePointCoordination(wire.dst, wire.ip, false)
  return pathd({...{p1x: p0.x, p1y: p0.y, p2x: p1.x, p2y: p1.y}, ...{p1dir: 'right', p2dir: 'left', scale: 1, delta: 30, wire: 'curve', edge: 6}})
}

function generateActivePath(node: Node, i: number, out: boolean, p1: Point) {
  const p0 = computePointCoordination(node, i, out)
  return pathd({...{p1x: p0.x, p1y: p0.y, p2x: p1.x, p2y: p1.y}, ...{p1dir: 'right', p2dir: 'left', scale: 1, delta: 30, wire: 'curve', edge: 6}})
}

</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${avocado.palette.width} ${avocado.palette.height}`">
    <path v-for="(wire) in avocado.wires" :key="wire.id"
          stroke="#333" fill="none"
          :d="generatePath(wire)" />

    <path v-if="avocado.activeWire.active"
          stroke="#333" fill="none"
          :d="generateActivePath(avocado.activeWire.startPort.node, avocado.activeWire.startPort.i, avocado.activeWire.startPort.out, avocado.activeWire.p1)"/>
  </svg>
</template>

<style scoped>

</style>
