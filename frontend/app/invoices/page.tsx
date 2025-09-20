import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { InvoiceForm } from "@/components/forms/invoice-form"

export default function InvoicesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <InvoiceForm />
        </main>
      </div>
    </div>
  )
}
