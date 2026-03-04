import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const FINDING_TOOLTIPS: Record<string, string> = {
  strategic_silence: "Perusahaan sama sekali tidak menyebut topik tertentu — ketiadaan informasi itu sendiri adalah bukti.",
  hedging_language: "Bahasa yang tidak mengikat secara hukum, seperti 'kami berupaya' atau 'kami bertujuan' — terdengar seperti komitmen tapi sebenarnya bukan.",
  franchise_firewall: "Komitmen hanya berlaku untuk restoran/toko milik perusahaan, bukan franchise — sehingga mayoritas operasi tidak tercakup.",
  geographic_exclusion: "Komitmen 'global' yang diam-diam mengecualikan wilayah tertentu, terutama Asia Tenggara.",
  availability_clause: "Syarat seperti 'tergantung ketersediaan pasokan lokal' — celah keluar bawaan yang memungkinkan penundaan tanpa batas.",
  timeline_deferral: "Terus menunda tenggat waktu: 2025 menjadi 2030, lalu 2035 — tanpa konsekuensi.",
  silent_delisting: "Diam-diam menghapus negara yang sebelumnya termasuk dalam program — lebih buruk dari tidak pernah berkomitmen.",
  corporate_ghosting: "Tidak ada mekanisme akuntabilitas — tidak ada audit pihak ketiga, tidak ada pelaporan progres.",
  commitment_downgrade: "Melemahkan bahasa komitmen dari tahun sebelumnya — dari 'kami akan' menjadi 'kami menuju'.",
  binding_commitment: "Bahasa yang mengikat secara hukum dengan tenggat waktu spesifik — tanda komitmen yang genuine.",
};

interface FindingTypeTooltipProps {
  findingType: string;
  children: React.ReactNode;
}

export default function FindingTypeTooltip({ findingType, children }: FindingTypeTooltipProps) {
  const tooltip = FINDING_TOOLTIPS[findingType];
  if (!tooltip) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-0.5 cursor-help">
          {children}
          <Info className="h-3 w-3 text-muted-foreground shrink-0" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px]">
        <p className="font-body text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
