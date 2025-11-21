"use client";

import { useState } from "react";
import CookiePreferenceToggle from "./CookiePreferenceToggle";
import { setCookieConsent } from "@/lib/cookies";

type Props = {
    onClose: () => void;
};

export default function CookiePreferencesModal({ onClose }: Props) {
    const [analytics, setAnalytics] = useState<boolean>(false);
    const [onsiteMarketing, setOnsiteMarketing] = useState<boolean>(false);
    const [offsiteMarketing, setOffsiteMarketing] = useState<boolean>(false);

    const saveChoices = () => {
        setCookieConsent({
            necessary: true,
            analytics,
            marketing: onsiteMarketing || offsiteMarketing,
        });

        onClose();  // CLOSE ALL
    };


    const allowAll = () => {
        setCookieConsent({
            necessary: true,
            analytics: true,
            marketing: true,
        });

        onClose(); // CLOSE ALL
    };


    return (
        <>
            {/* DARK BACKDROP */}
            <div className="fixed inset-0 bg-black/60 z-[9998]" />

            {/* MODAL */}
            <div className="fixed inset-0 flex items-center justify-center px-4 z-[9999]">
                <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-8 max-h-[85vh] overflow-y-auto">

                    {/* TITLE */}
                    <h2 className="text-2xl font-semibold text-center">Cookie Preference Center</h2>

                    <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                        Cookies are used to store or retrieve information from your browser or device.
                        This information may be about you, your preferences, your device or your settings
                        and is used to allow our website to function securely.
                    </p>

                    <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                        Cookies also help add functionality, improve performance, personalise your experience
                        and ensure adverts shown to you are relevant. You can manage your preferences below.
                    </p>

                    <p className="mt-4 text-sm text-[var(--text-secondary)]">
                        Read our{" "}
                        <a href="/cookies-policy" target="_blank" className="underline text-[var(--brand-primary)]">
                            Privacy & Cookie Policy
                        </a>.
                    </p>

                    {/* SECTIONS */}
                    <div className="mt-10 space-y-10">

                        {/* STRICTLY NECESSARY */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Strictly Necessary Cookies</h3>
                                <span className="text-[var(--brand-primary)] font-medium">Always Active</span>
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                These cookies are essential for the website to function and cannot be turned off.
                                They ensure the security of your session, allow account login, order processing
                                and keep your shopping basket functional. Blocking these in your browser
                                may cause parts of the site to break.
                            </p>
                        </div>

                        {/* FUNCTIONAL */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Functional Cookies</h3>
                                <span className="text-[var(--brand-primary)] font-medium">Always Active</span>
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                These cookies enable enhanced functionality such as remembering your preferences,
                                saved items, language choices or personal settings. They do not track your behaviour
                                but help provide a smoother experience.
                            </p>
                        </div>

                        {/* PERFORMANCE & ANALYTICS */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Performance & Analytics</h3>
                                <CookiePreferenceToggle
                                    checked={analytics}
                                    onChange={() => setAnalytics(!analytics)}
                                />
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                These cookies help us monitor site performance, understand how visitors use our
                                website, which pages are popular and identify any issues. This data is anonymous
                                and used only to improve user experience.
                            </p>
                        </div>

                        {/* ONSITE TARGETING */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">On-Site Targeting: Marketing & Personalisation</h3>
                                <CookiePreferenceToggle
                                    checked={onsiteMarketing}
                                    onChange={() => setOnsiteMarketing(!onsiteMarketing)}
                                />
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                These cookies are used by GAZAARABIA to personalise your experience while browsing
                                our website — for example, seeing products or content relevant to your interests based
                                on what you have viewed previously.
                            </p>
                        </div>

                        {/* OFF-SITE TARGETING */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Off-Site Targeting: Marketing & Personalisation</h3>
                                <CookiePreferenceToggle
                                    checked={offsiteMarketing}
                                    onChange={() => setOffsiteMarketing(!offsiteMarketing)}
                                />
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                                These cookies are set by our trusted advertising partners (including social networks).
                                They help us show you more relevant ads on other websites and prevent showing you
                                repetitive adverts.
                            </p>

                            <p className="mt-2 text-sm text-gray-600">
                                Turning these off means you will still see ads from us online, but they will not be targeted.
                            </p>
                        </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="mt-10 flex flex-col gap-3">
                        <button
                            onClick={allowAll}
                            className="w-full py-3 bg-[var(--brand-primary)] text-white rounded-md font-semibold"
                        >
                            ALLOW ALL COOKIES
                        </button>

                        <button
                            onClick={saveChoices}
                            className="w-full py-3 bg-black text-white rounded-md font-semibold"
                        >
                            CONFIRM MY CHOICES
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
