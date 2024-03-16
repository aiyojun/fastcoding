<script setup lang="ts">

import {useAvocado} from "./avocado";

const props = defineProps<{uuid: string}>()
const avocado = useAvocado()
const node = avocado.nodes.filter(e => e.id === props.uuid)[0]

</script>

<template>
  <div class="relative w-full h-full shadow plugin-label flex-row hidden">
    <div class="absolute w-full" style="height: 5px; background-color: orange"></div>
    {{ node.context['label'] }}
  </div>
</template>

<style scoped>

.plugin-label { border-radius: 8px; background-color: white; box-sizing: border-box; padding: 0.5rem; }

</style>
