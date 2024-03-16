<script setup lang="ts">

import {useAvocado} from "./avocado.js";
import {stopPropagation} from "../utils.js";
const avocado = useAvocado()

</script>

<template>

  <div class="avocado-barrier relative"
       :class="{'noneffective-events': avocado.cursor.task > -1}"
       @mousedown="stopPropagation" @mouseup="stopPropagation" @mousemove="stopPropagation" @click="stopPropagation">
    <slot></slot>
  </div>

</template>

<style scoped>

</style>
