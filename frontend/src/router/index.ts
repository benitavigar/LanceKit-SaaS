// Basic components placeholders to avoid router errors
import { createRouter, createWebHistory } from 'vue-router';

// Lazy load views
const LoginView = () => import('../views/LoginView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const InvoiceBuilder = () => import('../views/InvoiceBuilder.vue');
const InvoiceDetailView = () => import('../views/InvoiceDetailView.vue');
const RegisterView = () => import('../views/RegisterView.vue');
const ClientsView = () => import('../views/ClientsView.vue');
const MainLayout = () => import('../layouts/MainLayout.vue');

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: LoginView,
            meta: { public: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: RegisterView,
            meta: { public: true }
        },
        {
            path: '/',
            component: MainLayout,
            children: [
                {
                    path: '',
                    name: 'Dashboard',
                    component: DashboardView
                },
                {
                    path: 'invoices/new',
                    name: 'CreateInvoice',
                    component: InvoiceBuilder
                },
                {
                    path: 'invoices/:id',
                    name: 'InvoiceDetail',
                    component: InvoiceDetailView
                },
                {
                    path: 'clients',
                    name: 'Clients',
                    component: ClientsView
                }
            ]
        }
    ]
});

export default router;
