import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { listCustomersForAdmin } from "@/server/modules/customer.service";
import { PeopleSearch } from "@/components/admin/people-search";
import { CustomerManager } from "@/components/admin/customer-manager";

export const metadata: Metadata = { title: "Khách hàng" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin("/admin/khach-hang");
  const { q } = await searchParams;
  const customers = await listCustomersForAdmin(q);

  const withCard = customers.filter((c) => c.membershipCount > 0).length;
  const verified = customers.filter((c) => c.emailVerified).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Quản trị</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Khách hàng</h1>
          <p className="mt-1 text-[13px] text-ink/50">
            {customers.length} khách hàng · {withCard} đã có thẻ · {verified} đã xác thực email
          </p>
        </div>
        <PeopleSearch
          defaultValue={q}
          placeholder="Tìm tên, số điện thoại, email..."
          action="/admin/khach-hang"
        />
      </div>

      <CustomerManager key={q ?? "all"} initialCustomers={customers} />
    </div>
  );
}
