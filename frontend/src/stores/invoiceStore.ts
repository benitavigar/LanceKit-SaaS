import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoiceService, type Invoice } from '../services/api';

export const useInvoiceStore = defineStore('invoice', () => {
    const invoices = ref<Invoice[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const totalRevenue = computed(() => {
        return invoices.value
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    });

    const recentInvoices = computed(() => {
        return [...invoices.value]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    });

    const pendingCount = computed(() => {
        return invoices.value.filter(inv => inv.status === 'PENDING' || inv.status === 'DRAFT').length;
    });

    async function fetchInvoices() {
        loading.value = true;
        try {
            invoices.value = await invoiceService.findAll();
        } catch (e) {
            error.value = 'Failed to load invoices';
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function createInvoice(invoiceData: any) {
        loading.value = true;
        try {
            const newInvoice = await invoiceService.create(invoiceData);
            await fetchInvoices();
            return newInvoice;
        } catch (e) {
            error.value = 'Failed to create invoice';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function removeInvoice(id: string) {
        try {
            await invoiceService.remove(id);
            invoices.value = invoices.value.filter(i => i.id !== id);
        } catch (e) {
            error.value = 'Failed to delete invoice';
            console.error(e);
        }
    }

    async function updateInvoice(id: string, data: any) {
        try {
            const updated = await invoiceService.update(id, data);
            const index = invoices.value.findIndex(i => i.id === id);
            if (index !== -1) {
                invoices.value[index] = updated;
            }
            return updated;
        } catch (e) {
            error.value = 'Failed to update invoice';
            throw e;
        }
    }

    return {
        invoices,
        loading,
        error,
        totalRevenue,
        pendingCount,
        recentInvoices,
        fetchInvoices,
        createInvoice,
        updateInvoice,
        removeInvoice
    };
});
