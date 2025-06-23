"use client"

import { useAuth } from "@/context/AuthContext"
import { useCallback } from "react"

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export const useApi = () => {
  const { token, logout, apiBaseUrl } = useAuth()

  const apiCall = useCallback(
    async (endpoint: string, options: ApiOptions = {}) => {
      const { requireAuth = true, ...fetchOptions } = options

      try {
        // Build headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        }

        // Add custom headers if provided
        if (fetchOptions.headers) {
          Object.assign(headers, fetchOptions.headers as Record<string, string>)
        }

        // Add authorization header if required and token exists
        if (requireAuth && token) {
          headers.Authorization = `Bearer ${token}`
        }

        // Build full URL
        const url = endpoint.startsWith("http") ? endpoint : `${apiBaseUrl}${endpoint}`

        console.log("🚀 API Call:", { url, method: fetchOptions.method || "GET" })

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        })

        // Handle unauthorized responses
        if (response.status === 401 && requireAuth) {
          logout()
          throw new Error("Session expired. Please login again.")
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        console.error("💥 API call failed:", error)
        throw error
      }
    },
    [token, logout, apiBaseUrl],
  )

  // Convenience methods
  const get = useCallback(
    (endpoint: string, options?: Omit<ApiOptions, "method">) => apiCall(endpoint, { ...options, method: "GET" }),
    [apiCall],
  )

  const post = useCallback(
    (endpoint: string, data?: any, options?: Omit<ApiOptions, "method" | "body">) =>
      apiCall(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall],
  )

  const put = useCallback(
    (endpoint: string, data?: any, options?: Omit<ApiOptions, "method" | "body">) =>
      apiCall(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiCall],
  )

  const del = useCallback(
    (endpoint: string, options?: Omit<ApiOptions, "method">) => apiCall(endpoint, { ...options, method: "DELETE" }),
    [apiCall],
  )

  return {
    get,
    post,
    put,
    delete: del,
    apiBaseUrl,
    buildUrl: (endpoint: string) => `${apiBaseUrl}${endpoint}`,
  }
}
