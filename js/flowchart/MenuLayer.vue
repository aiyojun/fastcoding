<script setup lang="ts">

import {useAvocado} from "./avocado.js";
import {stopPropagation} from "../utils.js";

const avocado = useAvocado()

</script>

<template>
  <div class="absolute flex-col shadow avocado-menu"
       v-if="avocado.menu.visible" :style="{left: `${avocado.menu.x}px`, top: `${avocado.menu.y}px`}">
    <template v-for="(item) in avocado.menu.items" :key="item.label">
      <div v-if="item.types.includes(avocado.menu.type)"
           class="menu-item ellipsis-text"
           @mousedown="(e) => {stopPropagation(e); item.listener(); avocado.closeMenu()}">
        {{item.label}}
      </div>
    </template>
  </div>
</template>

<style scoped>

.avocado-menu {
  width: 200px;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
}

.menu-item {
  cursor: pointer;
  height: 32px;
  line-height: 32px;
  padding: 0 .5rem;
}

.menu-item:hover {
  background-color: rgba(0,0,0,0.05);
}

</style>
