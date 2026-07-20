<script setup lang="ts">
import { ref } from 'vue';
import { exportSave, importSave, resetGame } from '../../composables/useGame';
import ConfirmModal from '../ConfirmModal.vue';

// NOTE: this local ref is intentionally NOT derived from a computed() over
// the reactive game state. The 1s game tick mutates state.resources etc.,
// but Vue only patches DOM bindings that actually changed — since this
// textarea's content lives in its own local ref, updated only on explicit
// button clicks, the tick loop never touches it and the generated code
// is never wiped out from under the player.
const code = ref('');
const message = ref('');
const messageIsError = ref(false);
const showResetConfirm = ref(false);

function generate() {
  code.value = exportSave();
  message.value = 'Code de sauvegarde généré ci-dessous. Copiez-le en lieu sûr.';
  messageIsError.value = false;
}

function load() {
  if (!code.value.trim()) {
    message.value = 'Collez un code de sauvegarde avant de charger.';
    messageIsError.value = true;
    return;
  }
  const ok = importSave(code.value);
  message.value = ok ? 'Sauvegarde chargée avec succès.' : 'Ce code de sauvegarde est invalide.';
  messageIsError.value = !ok;
}

function doReset() {
  resetGame();
  code.value = '';
  message.value = 'Votre grimoire a été réduit en cendres. Une nouvelle histoire commence.';
  messageIsError.value = false;
  showResetConfirm.value = false;
}
</script>

<template>
  <section class="tab-panel">
    <div class="section-title">
      <h2>Sauvegarde</h2>
      <span class="hint">Votre progression est sauvegardée automatiquement dans ce navigateur. Utilisez le code ci-dessous pour l'emporter ailleurs.</span>
    </div>
    <div class="card">
      <textarea
        v-model="code"
        class="save-textarea"
        placeholder="Votre code de sauvegarde apparaîtra ici…"
        spellcheck="false"
      ></textarea>
      <div class="save-actions">
        <button class="btn" @click="generate">Générer le code</button>
        <button class="btn" @click="load">Charger depuis ce code</button>
        <button class="btn btn-danger" @click="showResetConfirm = true">Réinitialiser le grimoire</button>
      </div>
      <p v-if="message" class="save-message" :class="{ error: messageIsError }">{{ message }}</p>
    </div>

    <ConfirmModal
      v-if="showResetConfirm"
      title="Réinitialiser le grimoire ?"
      text="Toute votre progression sera définitivement perdue. Cette action est irréversible."
      confirm-label="Tout effacer"
      @confirm="doReset"
      @cancel="showResetConfirm = false"
    />
  </section>
</template>
