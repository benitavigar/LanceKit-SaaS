<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sidebarOpen = ref(true);
const user = ref<any>({ name: '', email: '' });

import { onMounted } from 'vue';
import { authService } from '../services/api';

onMounted(async () => {
    try {
        // Fetch latest user profile from the database
        const profile = await authService.getProfile();
        // Ensure user has name and email to avoid display issues
        user.value = {
            ...profile,
            name: profile.name || 'User',
            email: profile.email || ''
        };
        localStorage.setItem('user', JSON.stringify(user.value));
    } catch (e) {
        console.error('Failed to fetch user profile', e);
        // Fallback to local storage if API fails (offline) or redirect to login
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user.value = JSON.parse(storedUser);
        } else {
            // Token might be invalid
            router.push('/login');
        }
    }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside 
      class="bg-gradient-to-b from-indigo-900 to-purple-900 text-white w-64 flex-shrink-0 transition-all duration-300 flex flex-col shadow-2xl z-20"
      :class="{ '-ml-64': !sidebarOpen }"
    >
      <div class="h-16 flex items-center justify-center border-b border-indigo-800 bg-indigo-950">
        <h1 class="text-xl font-bold tracking-wider flex items-center">
          <span class="text-indigo-400 mr-2">⚡</span> LanceKit SaaS
        </h1>
      </div>
      
      <div class="p-4">
        <router-link
          to="/invoices/new"
          class="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-all transform hover:scale-[1.02] font-medium"
        >
          <span class="mr-2 text-xl">+</span> New Invoice
        </router-link>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 mt-2">
        <router-link
          to="/"
          class="flex items-center px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors"
          active-class="bg-indigo-800 text-white shadow-inner"
        >
          <span class="mr-3 text-lg">🏠</span>
          Dashboard
        </router-link>
         <router-link
          to="/clients"
          class="flex items-center px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors"
          active-class="bg-indigo-800 text-white shadow-inner"
        >
          <span class="mr-3 text-lg">👥</span>
          Clients
        </router-link>
      </nav>

      <div class="p-4 border-t border-indigo-800 bg-indigo-950">
        <button 
          @click="logout" 
          class="flex items-center w-full px-4 py-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
        >
          <span class="mr-3">➜</span>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
        <button @click="sidebarOpen = !sidebarOpen" class="text-gray-500 hover:text-gray-700 focus:outline-none">
          <span class="text-2xl">☰</span>
        </button>
        
        <div class="flex items-center space-x-4">
          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <span class="text-gray-700 font-medium">{{ user.name || 'User' }}</span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
