// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import {
//   User,
//   LogOut,
//   Edit,
//   Trash2,
//   Plus,
//   Package,
//   Heart,
//   Gift,
// } from "lucide-react";
// import NoData from "@/components/NoData";
// import { authService } from "@/lib/services/authService";
// import { addressService } from "@/lib/services/front-end/addressService";
// import AddressForm from "@/components/AddressForm";
// import AlertMessage from "@/components/AlertMessage";
// import PopupAlert from "@/components/PopupAlert";
// import Loader from "@/components/Loader";
// import { ROUTES } from "@/constants/routes";

// export default function MyAccountPage() {
//   const router = useRouter();

//   const { data: session, status } = useSession();

//   // Redirect non-customer users
//   useEffect(() => {
//     if (status === "loading") return;
//     if (status === "unauthenticated") {
//       router.replace(ROUTES.USER.LOGIN);
//     } else if (status === "authenticated" && session?.user?.role !== "customer") {
//       router.replace(ROUTES.HOME);
//     }
//     console.log('user:>', session?.user)
//   }, [status, session, router]);

//   const [activeTab, setActiveTab] = useState("details");
//   const [isEditing, setIsEditing] = useState(false);
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [addresses, setAddresses] = useState<any[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<any>(null);
//   const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
//     isOpen: false,
//     type: "",
//     message: "",
//   });
//   const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
//     isOpen: false,
//     id: null,
//   });
//   const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

//   // 🔸 State for logout confirmation
//   const [confirmLogout, setConfirmLogout] = useState(false);

//   // 🧭 Fetch user profile
//   useEffect(() => {
//     if (status !== "authenticated") return;
//     const fetchProfile = async () => {
//       try {
//         const data = await authService.getProfile(session?.user?.token);
//         setProfile(data.user);
//       } catch (err: any) {
//         setAlert({ isOpen: true, type: "error", message: err.message || "Failed to load profile." });
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [status]);

//   // 🏡 Load addresses
//   useEffect(() => {
//     if (status !== "authenticated") return;
//     const fetchAddresses = async () => {
//       try {
//         const data = await addressService.getAll(session?.user?.token);
//         setAddresses(data);
//       } catch (err: any) {
//         setAlert({ isOpen: true, type: "error", message: err.message });
//       }
//     };
//     fetchAddresses();
//   }, [status]);

//   // 🧭 Add / Edit Address
//   const handleSaveAddress = async (data: any) => {
//     try {
//       if (selectedAddress) {
//         await addressService.update(session?.user?.token, selectedAddress.id, data);
//       } else {
//         await addressService.create(session?.user?.token, data);
//       }
//       const updated = await addressService.getAll(session?.user?.token);
//       setAddresses(updated);
//       setIsEditing(false);
//       setSelectedAddress(null);
//     } catch (err: any) {
//       setAlert({ isOpen: true, type: "error", message: err.message || "Failed to save address" });
//     }
//   };

//   // Delete Address
//   const handleDeleteAddress = async (id: number) => {
//     setDeleteLoading(id);
//     try {
//       await addressService.remove(session?.user.token, id);
//       setAddresses((prev) => prev.filter((a) => a.id !== id));
//       setAlert({ isOpen: true, type: "success", message: "Address deleted successfully!" });
//     } catch (err: any) {
//       setAlert({ isOpen: true, type: "error", message: err.message || "Failed to delete address." });
//     } finally {
//       setDeleteLoading(null);
//       setConfirmDelete({ isOpen: false, id: null });
//     }
//   };

//   // 🚪 Handle logout after confirmation
//   const handleLogout = async () => {
//     setConfirmLogout(false);
//     await signOut({ callbackUrl: ROUTES.USER.LOGIN });
//   };

//   const menuItems = [
//     { key: "orders", label: "Orders", icon: <Package size={18} /> },
//     { key: "details", label: "My Details", icon: <User size={18} /> },
//     { key: "rewards", label: "Rewards", icon: <Gift size={18} /> },
//     { key: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
//     { key: "signout", label: "Sign Out", icon: <LogOut size={18} /> },
//   ];

//   return (
//     <>
//       {(status === "loading" || (status === "authenticated" && loading)) && <Loader />}

//       <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pt-20 pb-16 px-4 md:px-16 lg:px-24">
//         {/* Alert */}
//         {alert.isOpen && alert.type && (
//           <AlertMessage
//             type={alert.type}
//             message={alert.message}
//             onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
//           />
//         )}

//         {/* Page Header */}
//         <div className="max-w-6xl mx-auto mb-12">
//           <h1 className="text-3xl font-bold tracking-wide mb-2">My Account</h1>
//           <p className="text-[var(--text-muted)] text-base">
//             Manage your personal information, orders, and addresses
//           </p>
//         </div>

//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
//           {/* Sidebar Navigation */}
//           <aside className="md:col-span-1 border-r border-[var(--soft-gray)] pr-4 sticky top-24 self-start h-fit">
//             <nav className="space-y-1">
//               {menuItems.map((item) => (
//                 <button
//                   key={item.key}
//                   onClick={() => {
//                     if (item.key === "signout") {
//                       setConfirmLogout(true);
//                     } else {
//                       setActiveTab(item.key);
//                     }
//                   }}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium transition text-left ${activeTab === item.key
//                     ? "bg-[var(--brand-primary)] text-white shadow-sm"
//                     : "text-[var(--text-secondary)] hover:bg-[var(--soft-gray)]"
//                     }`}
//                 >
//                   {item.icon}
//                   {item.label}
//                 </button>
//               ))}
//             </nav>
//           </aside>

//           {/* Main Content */}
//           <main className="md:col-span-3 space-y-8">
//             {activeTab === "details" && (
//               <>
//                 <div className="bg-white border border-[var(--soft-gray)] p-6 md:p-8 rounded-xl shadow-sm">
//                   <h2 className="text-lg font-semibold mb-4">Account Information</h2>
//                   {profile ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--text-secondary)]">
//                       <div>
//                         <p className="text-sm text-[var(--text-muted)]">Full Name</p>
//                         <p className="font-medium">{profile.name}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-[var(--text-muted)]">Email Address</p>
//                         <p className="font-medium">{profile.email}</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-[var(--text-muted)] text-sm">No profile found.</p>
//                   )}
//                 </div>

//                 {/* Address Section */}
//                 <div className="bg-white border border-[var(--soft-gray)] p-6 md:p-8 rounded-xl shadow-sm">
//                   <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-lg font-semibold">Saved Addresses</h2>
//                     <button
//                       onClick={() => {
//                         setSelectedAddress(null);
//                         setIsEditing(true);
//                       }}
//                       className="flex items-center gap-2 bg-[var(--btn-secondary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
//                     >
//                       <Plus size={18} />
//                       Add Address
//                     </button>
//                   </div>
//                   <div className="space-y-4">
//                     {addresses.length > 0 ? (
//                       addresses.map((address) => (
//                         <div key={address.id} className="flex justify-between p-4 border rounded-lg">
//                           <div>
//                             <p className="font-medium">
//                               {address.firstName} {address.lastName}
//                             </p>
//                             <p>
//                               {address.address1}, {address.city}, {address.country}
//                             </p>
//                             <p className="text-sm text-[var(--text-muted)]">{address.phone}</p>
//                           </div>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setSelectedAddress(address);
//                                 setIsEditing(true);
//                               }}
//                               className="w-9 h-9 flex items-center justify-center bg-[var(--light-blue)] text-[var(--navy-blue)] rounded-full hover:bg-[var(--navy-blue)] hover:text-white transition"
//                               disabled={deleteLoading !== null}
//                             >
//                               <Edit size={18} />
//                             </button>
//                             <button
//                               onClick={() => setConfirmDelete({ isOpen: true, id: address.id })}
//                               className={`w-9 h-9 flex items-center justify-center rounded-full transition ${deleteLoading === address.id
//                                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                 : "bg-[var(--soft-pink)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
//                                 }`}
//                               disabled={deleteLoading !== null}
//                             >
//                               {deleteLoading === address.id ? (
//                                 <span className="animate-spin border-2 border-t-transparent border-[var(--brand-primary)] rounded-full w-4 h-4"></span>
//                               ) : (
//                                 <Trash2 size={18} />
//                               )}
//                             </button>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <NoData message="You have no saved address." />
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </main>
//         </div>

//         {/* Address Modal */}
//         {isEditing && (
//           <AddressForm
//             initialData={selectedAddress}
//             onCancel={() => {
//               setIsEditing(false);
//               setSelectedAddress(null);
//             }}
//             onSave={handleSaveAddress}
//           />
//         )}

//         {/* Delete confirmation */}
//         {confirmDelete.isOpen && (
//           <PopupAlert
//             type="warning"
//             message="Are you sure you want to delete this address?"
//             confirmText={deleteLoading ? "Deleting..." : "Yes, Delete"}
//             cancelText="Cancel"
//             onConfirm={() => handleDeleteAddress(confirmDelete.id as number)}
//             onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
//             show={confirmDelete.isOpen}
//           />
//         )}

//         {/* Logout confirmation */}
//         {confirmLogout && (
//           <PopupAlert
//             type="warning"
//             message="Are you sure you want to sign out?"
//             confirmText="Yes, Sign Out"
//             cancelText="Cancel"
//             onConfirm={handleLogout}
//             onCancel={() => setConfirmLogout(false)}
//             show={confirmLogout}
//           />
//         )}
//       </div>
//     </>
//   );
// }


import { redirect } from "next/navigation";

export default function AccountPage() {
  redirect("/account/details");
}
