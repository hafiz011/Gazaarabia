"use client";

type Props = {
    checked: boolean;
    onChange: () => void;
};

export default function ToggleSwitch({ checked, onChange }: Props) {
    return (
        <button
            onClick={onChange}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${checked ? "bg-[var(--brand-primary)]" : "bg-gray-300"
                }`}
        >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${checked ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </button>
    );
}
