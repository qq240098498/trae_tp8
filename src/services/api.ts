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
    checkConflict: (data: { weddingDate: string; departureTime: string; returnTime: string; vehicleIds?: number[]; driverIds?: number[]; excludeOrderId?: number }) =>
      request<{ hasConflict: boolean; conflictVehicles: Array<import('@/types').Vehicle & { conflictOrders?: { orderId: number; orderNo: string; timeRange: string }[] }>; conflictDrivers: import('@/types').Driver[] }>(
        '/orders/check-conflict',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ),
    getAvailable: (date: string, departureTime?: string, returnTime?: string) => {
      const query = new URLSearchParams()
      query.set('date', date)
      if (departureTime) query.set('departureTime', departureTime)
      if (returnTime) query.set('returnTime', returnTime)
      return request<{ vehicles: import('@/types').Vehicle[]; drivers: import('@/types').Driver[] }>(
        `/orders/schedule/available?${query.toString()}`,
      )
    },
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

  maintenance: {
    list: (params?: { vehicleId?: string | number; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.vehicleId) query.set('vehicleId', String(params.vehicleId))
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').MaintenanceRecord[]>(`/maintenance?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').MaintenanceRecord>(`/maintenance/${id}`),
    create: (data: Partial<import('@/types').MaintenanceRecord>) =>
      request<import('@/types').MaintenanceRecord>('/maintenance', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').MaintenanceRecord>) =>
      request<import('@/types').MaintenanceRecord>(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/maintenance/${id}`, {
        method: 'DELETE',
      }),
  },

  insurance: {
    list: (params?: { vehicleId?: string | number; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.vehicleId) query.set('vehicleId', String(params.vehicleId))
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').InsuranceRecord[]>(`/insurance?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').InsuranceRecord>(`/insurance/${id}`),
    create: (data: Partial<import('@/types').InsuranceRecord>) =>
      request<import('@/types').InsuranceRecord>('/insurance', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').InsuranceRecord>) =>
      request<import('@/types').InsuranceRecord>(`/insurance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/insurance/${id}`, {
        method: 'DELETE',
      }),
  },

  inspection: {
    list: (params?: { vehicleId?: string | number; keyword?: string; result?: string }) => {
      const query = new URLSearchParams()
      if (params?.vehicleId) query.set('vehicleId', String(params.vehicleId))
      if (params?.keyword) query.set('keyword', params.keyword)
      if (params?.result) query.set('result', params.result)
      return request<import('@/types').InspectionRecord[]>(`/inspection?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').InspectionRecord>(`/inspection/${id}`),
    create: (data: Partial<import('@/types').InspectionRecord>) =>
      request<import('@/types').InspectionRecord>('/inspection', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').InspectionRecord>) =>
      request<import('@/types').InspectionRecord>(`/inspection/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/inspection/${id}`, {
        method: 'DELETE',
      }),
  },

  flowerPackages: {
    list: (params?: { status?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').FlowerPackage[]>(`/flower-packages?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').FlowerPackage>(`/flower-packages/${id}`),
    create: (data: Partial<import('@/types').FlowerPackage>) =>
      request<import('@/types').FlowerPackage>('/flower-packages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').FlowerPackage>) =>
      request<import('@/types').FlowerPackage>(`/flower-packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/flower-packages/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id: number, status: string) =>
      request<import('@/types').FlowerPackage>(`/flower-packages/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  carDecorations: {
    list: (params?: { status?: string; decorationType?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.decorationType) query.set('decorationType', params.decorationType)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').CarDecoration[]>(`/car-decorations?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').CarDecoration>(`/car-decorations/${id}`),
    create: (data: Partial<import('@/types').CarDecoration>) =>
      request<import('@/types').CarDecoration>('/car-decorations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').CarDecoration>) =>
      request<import('@/types').CarDecoration>(`/car-decorations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/car-decorations/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id: number, status: string) =>
      request<import('@/types').CarDecoration>(`/car-decorations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  repairOrders: {
    list: (params?: { vehicleId?: string | number; status?: string; keyword?: string }) => {
      const query = new URLSearchParams()
      if (params?.vehicleId) query.set('vehicleId', String(params.vehicleId))
      if (params?.status) query.set('status', params.status)
      if (params?.keyword) query.set('keyword', params.keyword)
      return request<import('@/types').RepairOrder[]>(`/repair-orders?${query.toString()}`)
    },
    get: (id: number) => request<import('@/types').RepairOrder>(`/repair-orders/${id}`),
    create: (data: Partial<import('@/types').RepairOrder>) =>
      request<import('@/types').RepairOrder>('/repair-orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<import('@/types').RepairOrder>) =>
      request<import('@/types').RepairOrder>(`/repair-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/repair-orders/${id}`, {
        method: 'DELETE',
      }),
    assign: (id: number, data: { assignee?: string; serviceProvider?: string; estimatedCost?: number; startDate?: string }) =>
      request<import('@/types').RepairOrder>(`/repair-orders/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    start: (id: number) =>
      request<import('@/types').RepairOrder>(`/repair-orders/${id}/start`, {
        method: 'PATCH',
      }),
    complete: (id: number, data?: { actualCost?: number; completeDate?: string; repairItems?: string; remark?: string }) =>
      request<import('@/types').RepairOrder>(`/repair-orders/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify(data || {}),
      }),
    cancel: (id: number) =>
      request<import('@/types').RepairOrder>(`/repair-orders/${id}/cancel`, {
        method: 'PATCH',
      }),
  },
}
