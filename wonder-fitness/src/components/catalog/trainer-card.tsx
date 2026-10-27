import { Award, MapPin, Star } from "lucide-react";

export type TrainerCardData = {
  trainerId: number;
  fullName: string;
  specialization: string;
  certificates: string | null;
  photoUrl: string | null;
  rating: number;
  experience: number;
  branch?: { branchName: string } | null;
};

export function TrainerCard({ trainer }: { trainer: TrainerCardData }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {trainer.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.photoUrl}
            alt={trainer.fullName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl">🏋️</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent p-4 pt-12">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
            <MapPin className="h-3 w-3 text-brand" />
            {trainer.branch?.branchName ?? "Wonder Fitness"}
          </div>
          <h3 className="mt-1 text-base font-bold text-white">{trainer.fullName}</h3>
          <p className="text-xs text-white/70">{trainer.specialization}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="inline-flex items-center gap-1.5 text-[12px] text-ink/60">
          <Award className="h-3.5 w-3.5 text-brand" />
          {trainer.certificates ?? "HLV Wonder"}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-ink/45">
          <span>{trainer.experience} năm KN</span>
          <span className="inline-flex items-center gap-1 font-semibold text-ink/65">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {trainer.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
