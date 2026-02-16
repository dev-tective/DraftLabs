import { Icon } from "@iconify/react"
import { Alert, useAlertStore } from "@/stores/alertStore";

interface Props {
    copy?: string;
    field?: string;
    value: string;
    alert?: Partial<Alert>;
    icon?: boolean;
    className?: string;
}

export const Copy = ({ copy, field, value, alert, icon = false, className }: Props) => {
    const addAlert = useAlertStore((state) => state.addAlert);

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        if (alert) addAlert(alert as Alert);
    };

    return (
        <div
            onClick={() => handleCopy(value)}
            className={`
                    flex items-center justify-start
                    gap-2
                    text-base md:text-lg lg:text-xl
                    cursor-pointer transition-all
                    min-w-0
                    ${className}
                `}
        >
            <span className="truncate">
                {field}{copy}
            </span>
            {icon &&
                <Icon
                    icon="weui:copy-filled"
                    className="w-6 h-6 shrink-0"
                />
            }
        </div>
    )
}