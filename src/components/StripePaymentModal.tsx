"use client";

import { useEffect, useState } from "react";
import { loadStripe, PaymentIntent } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useSession } from "next-auth/react";
import { X, CreditCard } from "lucide-react";

import Loader from "./Loader";
import StripeCardForm from "./StripeCardForm";
import { stripeService } from "@/lib/services/front-end/stripeService";

interface StripePaymentModalProps {
    open: boolean;
    onClose: () => void;
    amount: number;
    customerId: string | null;
    onSuccess: (result: PaymentIntent) => void;
}

interface SavedCard {
    id: string;
    card: {
        brand: string;
        last4: number;
        exp_month: number;
        exp_year: number;
    };
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripePaymentModal(props: StripePaymentModalProps) {
    if (!props.open) return null;

    return <StripeWrapper {...props} />;
}

function StripeWrapper({
    open,
    onClose,
    amount,
    customerId,
    onSuccess,
}: StripePaymentModalProps) {
    const { data: session } = useSession();
    const userId = session?.user?.id ?? null;
    const token = session?.user?.token ?? null;
    const { update } = useSession();

    const [finalCustomerId, setFinalCustomerId] = useState(customerId);
    const [clientSecret, setClientSecret] = useState("");
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [selectedCard, setSelectedCard] = useState("new");

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");


    const isGuest = !session?.user;


    // Prevent background scroll
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);


    // ------------------------------------
    // 1) Create customer if missing
    // ------------------------------------
    useEffect(() => {
        const createCustomerIfMissing = async () => {
            try {
                if (!token) return;
                if (finalCustomerId) return;

                const res = await stripeService.createCustomer(token);

                if (res.error) {
                    setError(res.error || "Failed to create customer");
                    return;
                }

                if (res.customerId) {
                    setFinalCustomerId(res.customerId);
                    //  Update the user's session with new Stripe customer ID
                    await update({
                        user: {
                            ...session?.user,
                            stripeCustomerId: res.customerId
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Unexpected error while creating customer.");
            }
        };

        createCustomerIfMissing();
    }, [userId, finalCustomerId]);

    // ------------------------------------
    // 2) Load saved cards + PaymentIntent
    // ------------------------------------
    useEffect(() => {
        // if (!open || !finalCustomerId) return;
        if (!open) return;


        const init = async () => {
            try {
                setLoading(true);
                setError("");

                // Saved payment methods
                const pmRes = await stripeService.getSavedMethods(token);

                if (pmRes.error && pmRes.error != "Missing customerId") {
                    setError(pmRes.error);
                } else {
                    setSavedCards(pmRes.paymentMethods || []);
                }

                // PaymentIntent
                const piRes = await stripeService.createPaymentIntent(token, amount);

                if (piRes.error) {
                    setError(piRes.error);
                } else {
                    setClientSecret(piRes.clientSecret);
                }
            } catch (err) {
                console.error(err);
                setError("Unable to prepare payment.");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [open, finalCustomerId]);

    // ------------------------------------
    // 3) Pay with saved card
    // ------------------------------------
    const handleSavedCardPayment = async () => {
        try {
            setProcessing(true);
            setError("");

            const res = await stripeService.payWithSavedCard(
                token!,
                selectedCard,
                amount
            );

            if (res.error) {
                setError(res.error);
                setProcessing(false);
                return;
            }

            onSuccess(res.intent);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Payment failed. Try again.");
        } finally {
            setProcessing(false);
        }
    };

    { if (loading) return <Loader message="Preparing payment..." /> }



    return (
        <div
            className="
        fixed inset-0 bg-black/60 z-50 
        flex items-center justify-center px-4
        overflow-y-auto
        pointer-events-auto
    "
            style={{
                position: "fixed",
                zIndex: 50,
                backdropFilter: "blur(2px)"
            }}
        >
            <div
                className="
            bg-white 
            w-full 
            max-w-lg 
            rounded-2xl 
            p-6 
            shadow-2xl 
            relative
            my-10
            max-h-[90vh]
            overflow-y-auto
            z-50
        "
                style={{
                    position: "relative",
                    zIndex: 51
                }}
            >

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold text-center my-2">
                    Secure Card Payment
                </h2>

                {/* Global error */}
                {error && (
                    <p className="text-red-600 text-center text-sm mb-3">{error}</p>
                )}



                {!loading && (
                    <div className="space-y-4 mt-4">

                        {/* Saved cards list */}
                        {/* {savedCards.length > 0 && ( */}

                        {!isGuest && savedCards.length > 0 && (

                            <>
                                <p className="text-sm font-semibold">Saved Cards</p>

                                {savedCards.map((pm) => (
                                    <label
                                        key={pm.id}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer
                                            ${selectedCard === pm.id
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="card"
                                            checked={selectedCard === pm.id}
                                            onChange={() => setSelectedCard(pm.id)}
                                        />

                                        <CreditCard size={18} />

                                        <span>
                                            {pm.card.brand.toUpperCase()} •••• {pm.card.last4}
                                        </span>
                                    </label>
                                ))}
                            </>
                        )}

                        {/* Add new card */}
                        <label
                            className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer
                                ${selectedCard === "new" ? "border-blue-600 bg-blue-50" : "border-gray-300"}
                            `}
                        >
                            <input
                                type="radio"
                                name="card"
                                checked={selectedCard === "new"}
                                onChange={() => setSelectedCard("new")}
                            />
                            <CreditCard size={18} />
                            <span>Add a new card</span>
                        </label>

                        {/* Stripe Card Input */}
                        {selectedCard === "new" && clientSecret && (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripeCardForm amount={amount} onSuccess={onSuccess} />
                            </Elements>
                        )}

                        {/* Pay button for saved card */}
                        {selectedCard !== "new" && (
                            <button
                                className="w-full bg-black text-white py-3 rounded-lg font-semibold"
                                disabled={processing}
                                onClick={handleSavedCardPayment}
                            >
                                {processing ? "Processing..." : `Pay £${amount}`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
