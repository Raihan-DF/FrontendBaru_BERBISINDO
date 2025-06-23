"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { useApi } from "@/hooks/use-api"

export function DebugPanel() {
  const { token, user, apiBaseUrl, isAuthenticated } = useAuth()
  const { get } = useApi()
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    setTestResults([])
    const results: any[] = []

    // Test 1: Public endpoint
    try {
      const response = await fetch(`${apiBaseUrl}/api/test`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
      const data = await response.json()
      results.push({
        test: "Public Test Endpoint",
        success: true,
        status: response.status,
        data,
      })
    } catch (error: any) {
      results.push({
        test: "Public Test Endpoint",
        success: false,
        error: error.message,
      })
    }

    // Test 2: Protected endpoint dengan useApi
    if (token) {
      try {
        const data = await get("/api/protected-test")
        results.push({
          test: "Protected Test Endpoint (useApi)",
          success: true,
          data,
        })
      } catch (error: any) {
        results.push({
          test: "Protected Test Endpoint (useApi)",
          success: false,
          error: error.message,
        })
      }

      // Test 3: Exercises endpoint
      try {
        const data = await get("/api/exercises")
        results.push({
          test: "Exercises Endpoint",
          success: true,
          data: { count: data?.data?.length || 0, sample: data?.data?.[0] },
        })
      } catch (error: any) {
        results.push({
          test: "Exercises Endpoint",
          success: false,
          error: error.message,
        })
      }
    }

    setTestResults(results)
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <strong>API Base URL:</strong>
            <p className="text-sm text-muted-foreground break-all">{apiBaseUrl}</p>
          </div>
          <div>
            <strong>Authentication:</strong>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>
          <div>
            <strong>Token:</strong>
            <p className="text-sm text-muted-foreground break-all">
              {token ? `${token.substring(0, 30)}...` : "No token"}
            </p>
          </div>
          <div>
            <strong>User:</strong>
            <p className="text-sm text-muted-foreground">{user ? `${user.name} (${user.email})` : "No user data"}</p>
          </div>
        </div>

        {/* Test Button */}
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? "Running Tests..." : "Run API Tests"}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <Card key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{result.test}</CardTitle>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-40 bg-muted p-2 rounded">
                    {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
