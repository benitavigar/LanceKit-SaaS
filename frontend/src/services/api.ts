import axios from 'axios';

// --- Configuration ---
const API_URL = 'https://lancekit-saas.onrender.com';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to attach JWT token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Types (Based on Swagger) ---

export interface RegisterDto {
    email: string;
    password: string;
    name?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt?: string;
}

export interface CreateClientDto {
    name: string;
    email: string;
    company?: string;
}

export interface UpdateClientDto {
    name?: string;
    email?: string;
    company?: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
    userId: string;
    createdAt: string;
    invoices?: Invoice[];
}

export interface CreateInvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateInvoiceDto {
    invoiceNo: string;
    status: 'DRAFT' | 'PENDING' | 'PAID';
    dueDate: string;
    clientId: string;
    items: CreateInvoiceItemDto[];
}

export interface UpdateInvoiceDto {
    invoiceNo?: string;
    status?: 'DRAFT' | 'PENDING' | 'PAID';
    dueDate?: string;
    clientId?: string;
    items?: CreateInvoiceItemDto[];
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    invoiceId: string;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    status: 'DRAFT' | 'PENDING' | 'PAID';
    dueDate: string;
    totalAmount: number;
    clientId: string;
    userId: string;
    createdAt: string;
    items: InvoiceItem[];
    client?: Client;
}

// --- API Methods ---

export const authService = {
    async register(data: RegisterDto): Promise<AuthResponse> {
        const res = await api.post('/auth/register', data);
        return res.data;
    },

    async login(data: LoginDto): Promise<AuthResponse> {
        const res = await api.post('/auth/login', data);
        return res.data;
    },

    async getProfile(): Promise<User> {
        const res = await api.get('/auth/me');
        return res.data;
    },
};

export const clientService = {
    async findAll(): Promise<Client[]> {
        const res = await api.get('/clients');
        return res.data;
    },

    async findOne(id: string): Promise<Client> {
        const res = await api.get(`/clients/${id}`);
        return res.data;
    },

    async create(data: CreateClientDto): Promise<Client> {
        const res = await api.post('/clients', data);
        return res.data;
    },

    async update(id: string, data: UpdateClientDto): Promise<Client> {
        const res = await api.patch(`/clients/${id}`, data);
        return res.data;
    },

    async remove(id: string): Promise<Client> {
        const res = await api.delete(`/clients/${id}`);
        return res.data;
    },
};

export const invoiceService = {
    async findAll(): Promise<Invoice[]> {
        const res = await api.get('/invoices');
        return res.data;
    },

    async findOne(id: string): Promise<Invoice> {
        const res = await api.get(`/invoices/${id}`);
        return res.data;
    },

    async create(data: CreateInvoiceDto): Promise<Invoice> {
        const res = await api.post('/invoices', data);
        return res.data;
    },

    async update(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
        const res = await api.patch(`/invoices/${id}`, data);
        return res.data;
    },

    async remove(id: string): Promise<Invoice> {
        const res = await api.delete(`/invoices/${id}`);
        return res.data;
    },
};
