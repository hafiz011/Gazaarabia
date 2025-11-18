"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import NoData from "@/components/NoData";
import { authService } from "@/lib/services/authService";
import { addressService } from "@/lib/services/front-end/addressService";
import AddressForm from "@/components/AddressForm";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import Loader from "@/components/Loader";

export default function AccountDetailsPage() {
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  //  Load profile
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const data = await authService.getProfile(session?.user?.token);
        setProfile(data.user);
      } catch (err: any) {
        setAlert({ isOpen: true, type: "error", message: err.message || "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session]);

  //  Load addresses
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const data = await addressService.getAll(session?.user?.token);
        setAddresses(data);
      } catch (err: any) {
        setAlert({ isOpen: true, type: "error", message: err.message });
      }
    })();
  }, [status, session]);

  //  Add or Update Address
  const handleSaveAddress = async (data: any) => {
    try {
      if (selectedAddress) {
        await addressService.update(session?.user?.token, selectedAddress.id, data);
      } else {
        await addressService.create(session?.user?.token, data);
      }
      const updated = await addressService.getAll(session?.user?.token);
      setAddresses(updated);
      setIsEditing(false);
      setSelectedAddress(null);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message || "Failed to save address" });
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: number) => {
    setDeleteLoading(id);
    try {
      await addressService.remove(session?.user?.token, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setAlert({ isOpen: true, type: "success", message: "Address deleted successfully!" });
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message || "Failed to delete address." });
    } finally {
      setDeleteLoading(null);
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="space-y-8">
      {alert.isOpen && alert.type && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
        />
      )}

      {/*  Profile Info */}
      <div className="bg-white border border-[var(--soft-gray)] p-6 md:p-8 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        {profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--text-secondary)]">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Full Name</p>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Email Address</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">No profile found.</p>
        )}
      </div>

      {/*  Saved Addresses */}
      <div className="bg-white border border-[var(--soft-gray)] p-6 md:p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved Addresses</h2>
          <button
            onClick={() => {
              setSelectedAddress(null);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-[var(--btn-secondary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={18} />
            Add Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <div key={index} className="flex justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>
                    {address.address1}, {address.city}, {address.country}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{address.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedAddress(address);
                      setIsEditing(true);
                    }}
                    className="w-9 h-9 flex items-center justify-center bg-[var(--light-blue)] text-[var(--navy-blue)] rounded-full hover:bg-[var(--navy-blue)] hover:text-white transition"
                    disabled={deleteLoading !== null}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ isOpen: true, id: address.id })}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition ${deleteLoading === address.id
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[var(--soft-pink)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
                      }`}
                    disabled={deleteLoading !== null}
                  >
                    {deleteLoading === address.id ? (
                      <span className="animate-spin border-2 border-t-transparent border-[var(--brand-primary)] rounded-full w-4 h-4"></span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <NoData message="You have no saved addresses." />
          )}
        </div>
      </div>

      {/*  Address Modal */}
      {isEditing && (
        <AddressForm
          initialData={selectedAddress}
          onCancel={() => {
            setIsEditing(false);
            setSelectedAddress(null);
          }}
          onSave={handleSaveAddress}
        />
      )}

      {/*  Delete Confirmation */}
      {confirmDelete.isOpen && (
        <PopupAlert
          type="warning"
          message="Are you sure you want to delete this address?"
          confirmText={deleteLoading ? "Deleting..." : "Yes, Delete"}
          cancelText="Cancel"
          onConfirm={() => handleDeleteAddress(confirmDelete.id as number)}
          onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
          show={confirmDelete.isOpen}
        />
      )}
    </div>
  );
}
