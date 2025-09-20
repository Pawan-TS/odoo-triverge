import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CustomerForm } from "@/components/forms/customer-form"

export default function CustomersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <CustomerForm />
        </main>
      </div>
    </div>
  )
}
