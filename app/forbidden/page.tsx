"use client"
// app/forbidden/page.tsx
export default function ForbiddenPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-600">403 - Access Denied</h1>
      <p className="mt-2">You do not have permission to access this page.</p>
    </main>
  );
}
