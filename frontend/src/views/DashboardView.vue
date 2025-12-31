<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useInvoiceStore } from '../stores/invoiceStore';
import { clientService } from '../services/api';

const store = useInvoiceStore();
const clientCount = ref(0);
// Mock user name if not globally available, or fetch from localStorage
const userName = ref(JSON.parse(localStorage.getItem('user') || '{}')?.name || 'User');

onMounted(async () => {
  store.fetchInvoices();
  try {
      const clients = await clientService.findAll();
      clientCount.value = clients.length;
  } catch (e) {
      console.error(e);
  }
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function updateStatus(id: string, newStatus: string) {
    // Cleaner confirmation or direct update? Let's keep it safe.
    if(!confirm(`Update status to ${newStatus}?`)) return;
    try {
        await store.updateInvoice(id, { status: newStatus });
    } catch (e) {
        console.error(e);
        alert('Failed to update status');
    }
}
</script>

<template>
  <div class="space-y-8 px-2 py-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p class="mt-1 text-gray-500">Welcome back, {{ userName }}. Here's what's happening.</p>
      </div>
      <div class="flex gap-3">
        <button 
            @click="store.fetchInvoices()" 
            class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
        >
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
        </button>
        <router-link
            to="/invoices/new"
            class="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
            <span class="mr-2 text-lg">+</span> New Invoice
        </router-link>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Revenue Card -->
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:-translate-y-1">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                <h3 class="text-4xl font-extrabold mt-2">{{ formatCurrency(store.totalRevenue) }}</h3>
            </div>
            <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-100">
             <span class="bg-white/20 px-2 py-0.5 rounded text-white font-bold mr-2">Paid Only</span>
             <span>Lifetime earnings</span>
        </div>
      </div>
      
      <!-- Pending Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
             <div>
                <p class="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Invoices</p>
                <h3 class="text-4xl font-extrabold text-gray-900 mt-2">{{ store.pendingCount }}</h3>
            </div>
            <div class="p-3 bg-orange-50 rounded-xl">
                 <svg class="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
        <div class="mt-4 text-sm text-gray-500">
            Awaiting payment or draft
        </div>
      </div>

       <!-- Clients Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
             <div>
                <p class="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Clients</p>
                <h3 class="text-4xl font-extrabold text-gray-900 mt-2">{{ clientCount }}</h3>
            </div>
            <div class="p-3 bg-blue-50 rounded-xl">
                 <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
        </div>
        <div class="mt-4 text-sm text-gray-500">
            Across all projects
        </div>
      </div>
    </div>

    <!-- Recent Invoices Table -->
    <div class="bg-white shadow-lg shadow-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
      <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
            <h3 class="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p class="text-sm text-gray-500">Latest invoices and their status</p>
        </div>
        <router-link to="/invoices/new" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          View All &rarr;
        </router-link>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="store.loading">
                <td colspan="5" class="px-8 py-12 text-center text-gray-400">Loading data...</td>
            </tr>
            <tr v-else-if="store.invoices.length === 0">
                 <td colspan="5" class="px-8 py-12 text-center text-gray-400">
                     <p>No invoices found.</p>
                     <router-link to="/invoices/new" class="text-indigo-600 font-medium mt-2 inline-block">Create your first invoice</router-link>
                 </td>
            </tr>
            <tr v-for="invoice in store.recentInvoices" :key="invoice.id" class="group hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-5 whitespace-nowrap">
                <router-link :to="'/invoices/' + invoice.id" class="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                  {{ invoice.invoiceNo }}
                </router-link>
              </td>
              <td class="px-6 py-5 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                        {{ invoice.client?.name?.charAt(0).toUpperCase() || '?' }}
                    </div>
                    <div>
                         <div class="text-sm font-medium text-gray-900">{{ invoice.client?.name || 'Unknown' }}</div>
                         <div class="text-xs text-gray-500">{{ invoice.client?.company }}</div>
                    </div>
                </div>
              </td>
              <td class="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.createdAt) }}
              </td>
              <td class="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                {{ formatCurrency(Number(invoice.totalAmount)) }}
              </td>
              <td class="px-6 py-5 whitespace-nowrap">
                  <div class="relative">
                      <select 
                        :value="invoice.status"
                        @change="(e) => updateStatus(invoice.id, (e.target as HTMLSelectElement).value)"
                        class="appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-bold rounded-full border-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        :class="{
                          'bg-green-100 text-green-800 hover:bg-green-200': invoice.status === 'PAID',
                          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': invoice.status === 'PENDING',
                          'bg-gray-100 text-gray-700 hover:bg-gray-200': invoice.status === 'DRAFT'
                        }"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
