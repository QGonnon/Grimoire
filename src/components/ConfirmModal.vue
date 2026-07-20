<script setup lang="ts">
defineProps<{
  title: string;
  text: string;
  confirmLabel?: string;
}>();
const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal-box">
      <h2>{{ title }}</h2>
      <p class="event-text">{{ text }}</p>
      <div class="modal-actions">
        <button class="btn" @click="emit('cancel')">Annuler</button>
        <button class="btn btn-danger" @click="emit('confirm')">{{ confirmLabel ?? 'Confirmer' }}</button>
      </div>
    </div>
  </div>
</template>
