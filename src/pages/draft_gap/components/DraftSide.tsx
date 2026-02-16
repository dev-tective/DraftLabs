import { DraftSlot } from "../../../stores/draftStore";
import { DraftSlotCard } from "./DraftSlotCard";

interface Props {
    className?: string;
    draftSlots: DraftSlot[];
}

export const DraftSide = ({ className, draftSlots }: Props) => {
    return (
        <div className={`grid grid-cols-1 grid-rows-5 h-screen flex-1 border-t-2 border-slate-700 ${className}`}>
            {draftSlots.map((slot) => (
                <DraftSlotCard key={slot.id} draftSlot={slot} />
            ))}
        </div>
    );
}