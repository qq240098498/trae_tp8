const API_BASE = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const result = (await res.json()) as ApiResponse<T>

  if (!result.success) {
    throw new Error(result.error || '请求失败')
  }

  return result.data as T
}

export const api = {
  drivers: {
    list: (params?: { status?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').Driver[]>(`/drivers?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').Driver>(`/drivers/${id}`),
    create: (data: Partial<import('@/types').Driver>) =>
      request<import('@/types').Driver>('/drivers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').Driver>) =>
      request<import('@/types').Driver>(`/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/drivers/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id: number, status: string) =>
      request<import('@/types').Driver>(`/drivers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  vehicles: {
    list: (params?: { status?: string; vehicleType?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.vehicleType) query.set('vehicleType', params.vehicleType)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').Vehicle[]>(`/vehicles?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').Vehicle>(`/vehicles/${id}`),
    create: (data: Partial<import('@/types').Vehicle>) =>
      request<import('@/types').Vehicle>('/vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').Vehicle>) =>
      request<import('@/types').Vehicle>(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/vehicles/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id: number, status: string) =>
      request<import('@/types').Vehicle>(`/vehicles/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  orders: {
    list: (params?: { status?: string; dateFrom?: string; dateTo?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.dateFrom) query.set('dateFrom', params.dateFrom)
      if (params?.dateTo) query.set('dateTo', params.dateTo)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').Order[]>(`/orders?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').Order>(`/orders/${id}`),
    getVehicles: (id: number) =>
      request<import('@/types').OrderVehicleDetail[]>(`/orders/${id}/vehicles`),
    create: (data: Partial<import('@/types').Order> & { vehicles?: Array<Partial<import('@/types').OrderVehicle>> }) =>
      request<import('@/types').Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').Order> & { vehicles?: Array<Partial<import('@/types').OrderVehicle> & { id?: number }> }) =>
      request<import('@/types').Order>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/orders/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id: number, status: string) =>
      request<import('@/types').Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    checkConflict: (data: { weddingDate: string; vehicleIds?: number[]; driverIds?: number[]; excludeOrderId?: number }) =>
      request<{ hasConflict: boolean; conflictVehicles: import('@/types').Vehicle[]; conflictDrivers: import('@/types').Driver[] }>(
        '/orders/check-conflict',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ),
    getAvailable: (date: string) =>
      request<{ vehicles: import('@/types').Vehicle[]; drivers: import('@/types').Driver[] }>(
        `/orders/schedule/available?date=${date}`,
      ),
    depart: (id: number, data?: { vehicleIds?: number[]; departureTime?: string; actualMileage?: number }) =>
      request<import('@/types').Order>(`/orders/${id}/depart`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    return: (id: number, data?: { vehicleIds?: number[]; returnTime?: string; actualMileages?: number[] }) =>
      request<import('@/types').Order>(`/orders/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
  },

  settlements: {
    list: (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.dateFrom) query.set('dateFrom', params.dateFrom)
      if (params?.dateTo) query.set('dateTo', params.dateTo)
      return request<import('@/types').Settlement[]>(`/settlements?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').Settlement>(`/settlements/${id}`),
    create: (orderId: number) =>
      request<import('@/types').Settlement>(`/settlements/${orderId}`, {
        method: 'POST',
      }),
    update: (id: number, data: Partial<import('@/types').Settlement>) =>
      request<import('@/types').Settlement>(`/settlements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    pay: (id: number) =>
      request<import('@/types').Settlement>(`/settlements/${id}/pay`, {
        method: 'POST',
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/settlements/${id}`, {
        method: 'DELETE',
      }),
  },

  stats: {
    overview: () => request<import('@/types').StatsOverview>('/stats/overview'),
    ordersByMonth: (year?: number) => {
      const query = year ? `?year=${year}` : ''
      return request<import('@/types').MonthlyData[]>(`/stats/orders-by-month${query}`)
    },
    ordersByStatus: () => request<import('@/types').StatusData[]>('/stats/orders-by-status'),
    revenueSummary: () => request<import('@/types').RevenueSummary>('/stats/revenue-summary'),
    topDrivers: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : ''
      return request<import('@/types').DriverRanking[]>(`/stats/top-drivers${query}`)
    },
    topVehicles: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : ''
      return request<import('@/types').VehicleRanking[]>(`/stats/top-vehicles${query}`)
    },
    vehicleTypeDistribution: () =>
      request<import('@/types').VehicleTypeDistribution[]>('/stats/vehicle-type-distribution'),
  },
}
