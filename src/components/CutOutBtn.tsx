import { Icon } from "@iconify/react";

interface Props {
    icon: string;
    text: string;
    onClick?: () => void;
}

export const CutOutBtn = ({ icon, text, onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            className="
                flex justify-center items-center
                w-full gap-2 py-4 px-5
                font-semibold text-nowrap
                border border-slate-700
                beveled-tr beveled-bl rounded-tr-2xl rounded-bl-2xl
                cursor-pointer transition-all
                hover:bg-cyan-950/70 hover:border-cyan-500
            "
        >
            <Icon
                icon={icon}
                className='text-xl md:text-2xl'
            />
            <span className="
                text-sm md:text-base text-slate-200
                uppercase tracking-widest
            ">
                {text}
            </span>
        </button>
    );
}

export const CutOutBtnPrimary = ({ icon, text, onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            className="
                flex justify-center items-center
                w-full gap-2 py-4 px-5
                text-slate-200 font-semibold text-nowrap
                border border-cyan-400
                bg-cyan-950/70
                beveled-tr beveled-bl rounded-tr-2xl rounded-bl-2xl
                cursor-pointer transition-all
                hover:bg-cyan-400 hover:text-slate-950
            "
        >
            <Icon
                icon={icon}
                className='text-xl md:text-2xl'
            />
            <span className="
                text-sm md:text-base
                uppercase tracking-widest
            ">
                {text}
            </span>
        </button>
    );
}