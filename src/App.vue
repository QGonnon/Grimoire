<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { startGameLoop, stopGameLoop } from './composables/useGame';
import AppHeader from './components/AppHeader.vue';
import Sidebar from './components/Sidebar.vue';
import JournalSidebar from './components/JournalSidebar.vue';
import EventModal from './components/EventModal.vue';
import ProfileTab from './components/tabs/ProfileTab.vue';
import TasksTab from './components/tabs/TasksTab.vue';
import SkillsTab from './components/tabs/SkillsTab.vue';
import ClassesTab from './components/tabs/ClassesTab.vue';
import DungeonsTab from './components/tabs/DungeonsTab.vue';
import SaveTab from './components/tabs/SaveTab.vue';

type TabId = 'profile' | 'tasks' | 'skills' | 'classes' | 'dungeons' | 'save';

const tabs: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'tasks', label: 'Tâches' },
  { id: 'skills', label: 'Compétences' },
  { id: 'classes', label: 'Classes' },
  { id: 'dungeons', label: 'Donjons' },
  { id: 'save', label: 'Sauvegarde' },
];

const activeTab = ref<TabId>('tasks');

onMounted(startGameLoop);
onUnmounted(stopGameLoop);
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <div class="app-main">
      <Sidebar />
      <main class="content">
        <nav class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>

        <!--
          All tab panels stay mounted at all times (v-show, never v-if) so that
          local component state — most importantly the generated save code in
          SaveTab — is never destroyed by a tab switch or by the 1s game tick
          updating unrelated reactive state elsewhere on the page.
        -->
        <div v-show="activeTab === 'profile'"><ProfileTab /></div>
        <div v-show="activeTab === 'tasks'"><TasksTab /></div>
        <div v-show="activeTab === 'skills'"><SkillsTab /></div>
        <div v-show="activeTab === 'classes'"><ClassesTab /></div>
        <div v-show="activeTab === 'dungeons'"><DungeonsTab /></div>
        <div v-show="activeTab === 'save'"><SaveTab /></div>
      </main>
      <JournalSidebar />
    </div>
    <EventModal />
  </div>
</template>
