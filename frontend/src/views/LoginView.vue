<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    const response = await authService.login({
      email: email.value,
      password: password.value
    });
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    router.push('/');
  } catch (e: any) {
    console.error(e);
    // Show specific message if available
    error.value = e.response?.data?.message || 'Invalid email or password';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-xl border border-white/50">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span class="text-2xl font-bold text-white">F</span>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back
        </h2>
        <p class="mt-2 text-sm text-gray-500">
          Sign in to your CRM dashboard
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-pulse">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700 font-medium">{{ error }}</p>
                </div>
            </div>
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
                <input
                id="email"
                name="email"
                type="email"
                required
                v-model="email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="you@example.com"
                />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
                <input
                id="password"
                name="password"
                type="password"
                required
                v-model="password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="••••••••"
                />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-indigo-400 group-hover:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div class="text-center mt-4">
             <p class="text-sm text-gray-600">
                 Don't have an account? 
                 <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                     Sign up now
                 </router-link>
             </p>
        </div>
      </form>
    </div>
  </div>
</template>
