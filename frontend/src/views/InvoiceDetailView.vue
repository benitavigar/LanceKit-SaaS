<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { invoiceService, type Invoice } from '../services/api';

const route = useRoute();
const router = useRouter();
const invoice = ref<Invoice | null>(null);
const loading = ref(true);

onMounted(async () => {
    const id = route.params.id as string;
    if (id) {
        try {
            invoice.value = await invoiceService.findOne(id);
        } catch (e) {
            console.error('Failed to fetch invoice', e);
            alert('Invoice not found');
            router.push('/');
        } finally {
            loading.value = false;
        }
    }
});

function formatDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
</script>

<template>
  <div v-if="loading" class="text-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
    <p class="mt-4 text-gray-500">Loading invoice...</p>
  </div>

  <div v-else-if="invoice" class="max-w-4xl mx-auto py-8 px-4">
    <!-- Header Actions -->
    <div class="mb-8 flex justify-between items-center no-print">
        <button 
           @click="router.back()"
           class="text-gray-600 hover:text-gray-900 flex items-center"
        >
           ← Back
        </button>
        <div class="space-x-4">
            <button 
                onclick="window.print()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
                Print
            </button>
             <span 
                class="px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wide"
                :class="{
                    'bg-green-100 text-green-800': invoice.status === 'PAID',
                    'bg-yellow-100 text-yellow-800': invoice.status === 'PENDING',
                    'bg-gray-100 text-gray-800': invoice.status === 'DRAFT'
                }"
            >
                {{ invoice.status }}
            </span>
        </div>
    </div>

    <!-- Invoice Paper -->
    <div id="printable-invoice" class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <!-- Top Banner -->
        <div class="bg-indigo-900 h-4 w-full"></div>
        
        <div class="p-8 sm:p-12">
            <!-- Header -->
            <div class="flex justify-between items-start mb-12">
                <div>
                     <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">INVOICE</h1>
                     <p class="mt-2 text-indigo-600 font-medium">#{{ invoice.invoiceNo }}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">Amount Due</p>
                    <p class="text-3xl font-bold text-gray-900 mt-1">{{ formatCurrency(Number(invoice.totalAmount)) }}</p>
                    <p class="text-sm text-gray-500 mt-2">Due {{ formatDate(invoice.dueDate) }}</p>
                </div>
            </div>

            <!-- Client & Meta -->
            <div class="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Billed To</h3>
                    <p class="text-lg font-bold text-gray-900">{{ invoice.client?.name }}</p>
                    <p class="text-gray-600">{{ invoice.client?.company }}</p>
                    <p class="text-gray-500 text-sm mt-1">{{ invoice.client?.email }}</p>
                </div>
                <div class="text-right">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Date Issued</h3>
                    <p class="text-gray-900 font-medium">{{ formatDate(invoice.createdAt) }}</p>
                </div>
            </div>

            <!-- Items -->
            <div class="border-t border-gray-100">
                <table class="w-full text-left">
                    <thead>
                        <tr>
                            <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Description</th>
                            <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Qty</th>
                            <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Price</th>
                            <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="item in invoice.items" :key="item.id">
                            <td class="py-4 text-gray-900 font-medium">{{ item.description }}</td>
                            <td class="py-4 text-gray-600 text-right">{{ item.quantity }}</td>
                            <td class="py-4 text-gray-600 text-right">{{ formatCurrency(Number(item.unitPrice)) }}</td>
                            <td class="py-4 text-gray-900 font-bold text-right">{{ formatCurrency(item.quantity * Number(item.unitPrice)) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer Total -->
            <div class="flex justify-end mt-8 pt-8 border-t border-gray-100">
                <div class="text-right">
                     <p class="text-sm text-gray-500 mb-1">Total</p>
                     <p class="text-4xl font-extrabold text-indigo-600">{{ formatCurrency(Number(invoice.totalAmount)) }}</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
    .no-print { display: none; }
    body { background: white; }
    .shadow-lg { box-shadow: none; border: none; }
}
</style>
