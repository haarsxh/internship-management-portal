import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="mx-auto flex max-w-[1024px] flex-col md:flex-row">
      <Sidebar />
      <main className="min-h-[calc(100vh-48px)] flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
