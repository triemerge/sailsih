import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export function useStockyards() {
  return useQuery({
    queryKey: ['stockyards'],
    queryFn: () => apiFetch('/stockyards/'),
  });
}

export function useCreateStockyard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiFetch('/stockyards/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockyards'] });
    },
  });
}

export function useUpdateStockyard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => apiFetch(`/stockyards/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockyards'] });
    },
  });
}

export function useDeleteStockyard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiFetch(`/stockyards/${id}/`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockyards'] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiFetch('/orders/'),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiFetch('/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => apiFetch(`/orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiFetch(`/orders/${id}/`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRunAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (constraints) => apiFetch('/automate/', {
      method: 'POST',
      body: JSON.stringify(constraints),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stockyards'] });
    },
  });
}

export function useAutomationData() {
  const stockyards = useStockyards();
  const orders = useOrders();

  return {
    stockyards: stockyards.data || [],
    orders: orders.data || [],
    isLoading: stockyards.isLoading || orders.isLoading,
    refetch: () => {
      stockyards.refetch();
      orders.refetch();
    },
  };
}

