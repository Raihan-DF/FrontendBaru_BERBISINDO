"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function TestTeacherAccessPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const { user, userRole } = useAuth()

  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      })
    }
  }, [user, userRole])

  const testTeacherAccess = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setTestResult({
          success: false,
          message: "No token found",
        })
        return
      }

      const response = await fetch("http://localhost:8000/api/test/teacher-access", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (error) {
      console.error("Error testing teacher access:", error)
      setTestResult({
        success: false,
        message: "Error testing teacher access",
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const testStudentProgress = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setTestResult({
          success: false,
          message: "No token found",
        })
        return
      }

      const response = await fetch("http://localhost:8000/api/teacher/students/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json().catch(() => "No JSON response")
      setTestResult({
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (error) {
      console.error("Error testing student progress:", error)
      setTestResult({
        success: false,
        message: "Error testing student progress",
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const testUserInfo = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setTestResult({
          success: false,
          message: "No token found",
        })
        return
      }

      const response = await fetch("http://localhost:8000/api/debug/user-role", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (error) {
      console.error("Error testing user info:", error)
      setTestResult({
        success: false,
        message: "Error testing user info",
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test Teacher Access</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current User Info</CardTitle>
          <CardDescription>Information about the currently logged in user</CardDescription>
        </CardHeader>
        <CardContent>
          {userInfo ? (
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {userInfo.id}
              </p>
              <p>
                <strong>Name:</strong> {userInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p>
                <strong>Role:</strong> {userInfo.role}
              </p>
              <p>
                <strong>Token:</strong> {localStorage.getItem("token") ? "Present" : "Missing"}
              </p>
            </div>
          ) : (
            <p>No user information available</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button onClick={testTeacherAccess} disabled={loading}>
          {loading ? "Testing..." : "Test Teacher Access"}
        </Button>
        <Button onClick={testStudentProgress} disabled={loading}>
          {loading ? "Testing..." : "Test Student Progress API"}
        </Button>
        <Button onClick={testUserInfo} disabled={loading}>
          {loading ? "Testing..." : "Test User Info"}
        </Button>
      </div>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
            <CardDescription>Response from the API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
