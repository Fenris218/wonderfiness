import { Clock, MapPin, Phone } from "lucide-react";

export type BranchCardData = {
  branchId: number;
  branchName: string;
  address: string;
  district: string;
  phone: string | null;
  openingTime: string;
  closingTime: string;
  mapUrl?: string | null;
};

export function BranchCard({ branch, index }: { branch: BranchCardData; index?: number }) {
  return (
    <article className="card card-hover flex gap-4 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-black text-brand">
        {String((index ?? branch.branchId) + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink">{branch.branchName}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] leading-snug text-ink/60">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          {branch.address}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink/50">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {branch.openingTime} – {branch.closingTime} hằng ngày
        </p>
        {branch.phone ? (
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink/50">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {branch.phone}
          </p>
        ) : null}
      </div>
    </article>
  );
}
