<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '../stores/invoiceStore';
import { clientService, type CreateInvoiceItemDto } from '../services/api';

const router = useRouter();
const store = useInvoiceStore();

// --- Form State ---
const loading = ref(false);
const submitting = ref(false);

// Clients (for select dropdown)
const clients = ref<any[]>([]);

// Local interface for UI state (needs ID for v-for)
interface FormInvoiceItem extends CreateInvoiceItemDto {
    tempId: number;
}

onMounted(async () => {
    loading.value = true;
    try {
        clients.value = await clientService.findAll();
    } finally {
        loading.value = false;
    }
});

const form = reactive({
  invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
  clientId: '',
  dueDate: new Date().toISOString().split('T')[0],
  status: 'DRAFT' as const,
  items: [
    { tempId: Date.now(), description: '', quantity: 1, unitPrice: 0 }
  ] as FormInvoiceItem[]
});

// Computed Total
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

// Actions
function addItem() {
  form.items.push({
    tempId: Date.now(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
}

function removeItem(index: number) {
  form.items.splice(index, 1);
}

async function handleSubmit() {
    if (!form.clientId) {
        alert('Please select a client');
        return;
    }

    submitting.value = true;
    try {
        // Strip tempIds before sending to API
        const { items, ...rest } = form;
        const apiItems = items.map(({ tempId, ...item }) => ({
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice)
        }));
        
        // Ensure date is ISO-8601 compatible for backend
        const payload = {
            ...rest,
            dueDate: new Date(form.dueDate).toISOString(),
            items: apiItems
        };

        await store.createInvoice(payload);
        router.push('/');
    } catch (e: any) {
        console.error(e);
        const msg = e.response?.data?.message || e.message || 'Failed to save invoice';
        alert(`Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-8">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">New Invoice</h1>
        <p class="mt-2 text-sm text-gray-500">Create and configure a new invoice for your clients.</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="router.back()"
          class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          Cancel
        </button>
        <button 
          @click="handleSubmit"
          :disabled="submitting"
          class="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform hover:scale-[1.02] transition-all"
        >
          <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ submitting ? 'Processing...' : 'Save Invoice' }}
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8 bg-white p-8 shadow-lg rounded-2xl border border-gray-100">
        
        <!-- Top Section: Client & Meta -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-100">
            <div class="lg:col-span-1">
                 <label class="block text-sm font-semibold text-gray-700 mb-2">Client Details</label>
                 <div class="relative">
                   <select 
                      v-model="form.clientId" 
                      required 
                      class="appearance-none block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                   >
                       <option value="" disabled>Select a client...</option>
                       <option v-for="client in clients" :key="client.id" :value="client.id">
                           {{ client.name }} ({{ client.company }})
                       </option>
                   </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                     <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                     </svg>
                   </div>
                 </div>
                 <p class="mt-2 text-xs text-gray-500">Select the recipient for this invoice.</p>
            </div>
            
            <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                    <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">#</span>
                      </div>
                      <input 
                          v-model="form.invoiceNo" 
                          type="text" 
                          required
                          class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 py-3 text-sm border-gray-300 rounded-xl bg-gray-50 border"
                          placeholder="INV-001"
                      />
                    </div>
                 </div>
                 <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                    <input 
                        v-model="form.dueDate" 
                        type="date" 
                        required
                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 py-3 text-sm border-gray-300 rounded-xl bg-gray-50 border"
                    />
                 </div>
            </div>
        </div>

        <!-- Line Items -->
        <div>
            <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Line Items</h3>
                  <p class="text-sm text-gray-500">Add services or products to this invoice.</p>
                </div>
                 <button 
                    type="button" 
                    @click="addItem"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Add Item
                </button>
            </div>
            
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
                 <!-- Header Row (Hidden on mobile) -->
                <div class="hidden sm:grid sm:grid-cols-12 gap-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    <div class="col-span-6">Description</div>
                    <div class="col-span-2">Qty</div>
                    <div class="col-span-3">Unit Price</div>
                    <div class="col-span-1 text-right">Action</div>
                </div>

                <transition-group name="list" tag="div" class="space-y-3">
                  <div 
                      v-for="(item, index) in form.items" 
                      :key="item.tempId"
                      class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-colors"
                  >
                      <!-- Description -->
                      <div class="md:col-span-6">
                          <label class="block md:hidden text-xs font-bold text-gray-500 mb-1">Description</label>
                          <input 
                              v-model="item.description" 
                              type="text" 
                              placeholder="e.g. Website Development"
                              required
                              class="block w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 transition-shadow"
                          />
                      </div>
                      
                      <!-- Qty -->
                      <div class="md:col-span-2">
                          <label class="block md:hidden text-xs font-bold text-gray-500 mb-1">Qty</label>
                          <input 
                              v-model.number="item.quantity" 
                              type="number" 
                              min="1"
                              required
                              class="block w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                          />
                      </div>
                      
                      <!-- Price -->
                      <div class="md:col-span-3">
                          <label class="block md:hidden text-xs font-bold text-gray-500 mb-1">Price</label>
                          <div class="relative rounded-lg shadow-sm">
                              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span class="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input 
                                  v-model.number="item.unitPrice" 
                                  type="number" 
                                  min="0" step="0.01"
                                  required
                                  class="block w-full pl-7 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5" 
                                  placeholder="0.00" 
                              />
                          </div>
                      </div>
                      
                      <!-- Remove Button -->
                      <div class="md:col-span-1 flex justify-end pt-2">
                          <button 
                              type="button" 
                              @click="removeItem(index)"
                              class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                              :disabled="form.items.length === 1"
                              title="Remove item"
                          >
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                          </button>
                      </div>
                  </div>
                </transition-group>
            </div>
            
            <!-- Dynamic Total -->
            <div class="mt-8 flex justify-end">
                <div class="bg-gray-900 text-white px-8 py-6 rounded-2xl shadow-lg flex flex-col items-end min-w-[300px]">
                    <span class="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Total Amount Due</span>
                    <span class="text-4xl font-extrabold tracking-tight">
                        {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount) }}
                    </span>
                    <p class="text-gray-400 text-xs mt-2">Calculated automatically based on items</p>
                </div>
            </div>
        </div>

    </form>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
