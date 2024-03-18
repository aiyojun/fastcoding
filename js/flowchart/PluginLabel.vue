<script setup lang="ts">

import {useAvocadoContext} from "./avocado.js";

const props = defineProps<{uuid: string}>()
// const avocado = useAvocado()
const context = useAvocadoContext(props.uuid)

</script>

<template>
  <div class="relative w-full h-full shadow plugin-label flex-row hidden">
    <div class="absolute w-full" style="height: 5px; background-color: orange"></div>
    {{ context['label'] }}
  </div>
</template>

<style scoped>

.plugin-label { border-radius: 8px; box-sizing: border-box; padding: 1rem; }

</style>
