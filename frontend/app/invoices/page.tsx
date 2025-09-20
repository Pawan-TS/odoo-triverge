import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { InvoiceForm } from "@/components/forms/invoice-form"

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />
        <main className="flex-1">
          <InvoiceForm />
        </main>
      </div>
    </div>
  )
}
