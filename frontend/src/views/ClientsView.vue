<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { clientService, type Client } from '../services/api';

const clients = ref<Client[]>([]);
const loading = ref(false);
const showAddModal = ref(false);
const submitting = ref(false);
const searchQuery = ref('');

const newClient = ref({
    name: '',
    email: '',
    company: ''
});

// Computed Search
const filteredClients = computed(() => {
    if (!searchQuery.value) return clients.value;
    const q = searchQuery.value.toLowerCase();
    return clients.value.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        (c.company && c.company.toLowerCase().includes(q))
    );
});

async function fetchClients() {
    loading.value = true;
    try {
        clients.value = await clientService.findAll();
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function handleAddClient() {
    submitting.value = true;
    try {
        const created = await clientService.create(newClient.value);
        clients.value.push(created);
        showAddModal.value = false;
        newClient.value = { name: '', email: '', company: '' };
    } catch (e) {
        console.error(e);
        alert('Failed to create client');
    } finally {
        submitting.value = false;
    }
}

async function handleDelete(id: string) {
    if(!confirm('Are you sure you want to delete this client?')) return;
    try {
        await clientService.remove(id);
        clients.value = clients.value.filter(c => c.id !== id);
    } catch (e) {
        console.error(e);
        alert('Failed to delete client');
    }
}

function formatDate(dateString: string) {
    if(!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

onMounted(() => {
    fetchClients();
});
</script>

<template>
  <div class="px-8 py-8 h-full bg-gray-50/50">
    <!-- Header With Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Clients</h1>
        <p class="mt-1 text-sm text-gray-500">Manage your customer relationships.</p>
      </div>
      
      <div class="flex gap-3 w-full sm:w-auto">
         <div class="relative w-full sm:w-64">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
                v-model="searchQuery" 
                type="text" 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out" 
                placeholder="Search clients..." 
            />
         </div>
         <button 
            @click="showAddModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all hover:scale-105"
         >
            <span class="mr-2 text-lg">+</span> Add Client
         </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
        <svg class="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 animate-pulse">Loading clients...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredClients.length === 0" class="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <div class="mx-auto h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">No clients found</h3>
        <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery ? 'Try adjusting your search query.' : 'Get started by creating a new client.' }}
        </p>
         <button 
            v-if="!searchQuery"
            @click="showAddModal = true"
            class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
        >
            Add First Client
        </button>
    </div>

    <!-- Client Grid -->
    <div v-else class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div 
            v-for="client in filteredClients" 
            :key="client.id" 
            class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
            <!-- Hover Action Overlay (Edit/Delete) -->
             <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    @click="handleDelete(client.id)" 
                    class="p-2 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                    title="Delete Client"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div class="flex items-center space-x-4 mb-5">
                <!-- Avatar -->
                <div class="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {{ client.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900 truncate pr-6">{{ client.name }}</h3>
                    <p class="text-sm text-indigo-600 font-medium truncate">{{ client.company || 'Freelance' }}</p>
                </div>
            </div>

            <div class="space-y-3 pt-2">
                <div class="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="truncate">{{ client.email }}</span>
                </div>
                
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                     <div class="flex items-center space-x-1">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                             {{ client.invoices?.length || 0 }} Invoices
                        </span>
                     </div>
                     <span class="text-xs text-gray-400">Joined {{ formatDate(client.createdAt) }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Client Modal -->
    <Transition
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity backdrop-blur-sm" @click="showAddModal = false"></div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                  <div class="bg-indigo-600 h-2 w-full"></div>
                  <div class="bg-white px-8 pt-8 pb-6">
                      <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center" id="modal-title">
                           <span class="bg-indigo-100 text-indigo-600 rounded-lg p-2 mr-3">
                               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                           </span>
                           Add New Client
                      </h3>
                      
                      <div class="space-y-5">
                          <div>
                              <label class="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                              <input type="text" v-model="newClient.name" class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. John Doe">
                          </div>
                          <div>
                              <label class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                              <input type="email" v-model="newClient.email" class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition-colors" placeholder="john@company.com">
                          </div>
                          <div>
                              <label class="block text-sm font-semibold text-gray-700 mb-1">Company (Optional)</label>
                              <input type="text" v-model="newClient.company" class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition-colors" placeholder="Company Ltd.">
                          </div>
                      </div>
                  </div>
                  <div class="bg-gray-50 px-8 py-5 sm:flex sm:flex-row-reverse border-t border-gray-100">
                      <button 
                          @click="handleAddClient" 
                          :disabled="!newClient.name || !newClient.email || submitting"
                          type="button" 
                          class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                          {{ submitting ? 'Saving...' : 'Create Client' }}
                      </button>
                      <button 
                          @click="showAddModal = false" 
                          type="button" 
                          class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </Transition>
  </div>
</template>
