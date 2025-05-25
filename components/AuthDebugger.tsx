"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export default function AuthDebugger() {
  const { token, userRole, isAuthenticated, logout } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [tokenStatus, setTokenStatus] = useState<"loading" | "valid" | "invalid">("loading")
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Cek token
    if (!token) {
      setTokenStatus("invalid")
      return
    }

    // Ambil userData dari localStorage
    const storedUserData = localStorage.getItem("userData")
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }

    // Validasi token dengan permintaan ke endpoint user
    const validateToken = async () => {
      try {
        console.log("Validating token with user endpoint")
        const response = await fetch("http://localhost:8000/api/user", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("User endpoint response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          setTokenStatus("valid")
          setApiResponse(JSON.stringify(data, null, 2))
        } else {
          setTokenStatus("invalid")
          setApiResponse(`Error ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Token validation error:", error)
        setTokenStatus("invalid")
        setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    validateToken()
  }, [token])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-white p-2 rounded-md shadow-md"
      >
        Debug Auth
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Auth Debugger</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Authentication Status:</h4>
          <div className={isAuthenticated ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isAuthenticated ? "✓ Authenticated" : "✗ Not Authenticated"}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Token Status:</h4>
          {tokenStatus === "loading" ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
              <span>Checking...</span>
            </div>
          ) : tokenStatus === "valid" ? (
            <div className="text-green-600 font-medium">✓ Token Valid</div>
          ) : (
            <div className="text-red-600 font-medium">✗ Token Invalid or Missing</div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-1">User Role:</h4>
          <div className="bg-gray-100 p-2 rounded text-xs">{userRole || "No role found"}</div>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Token:</h4>
          <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
            {token ? (token.length > 40 ? token.substring(0, 40) + "..." : token) : "No token found"}
          </div>
        </div>

        {userData && (
          <div>
            <h4 className="font-semibold mb-1">User Data:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}

        {apiResponse && (
          <div>
            <h4 className="font-semibold mb-1">API Response:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">{apiResponse}</pre>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold">Actions:</h4>
          <div className="flex space-x-2">
            <button onClick={logout} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
              Logout
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
