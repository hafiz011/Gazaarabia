"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Eye, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { contactUsService } from "@/lib/services/contactUsService";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";

interface ContactUs {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function ContactUsListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<ContactUs[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState<ContactUs | null>(null);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const token = session?.user?.token;

  // 🛡️ Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  // ✅ Fetch contact messages
  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await contactUsService.getAll(token);
      setMessages(res.data || []);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch contact messages.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ✅ Search + pagination
  const filteredMessages = useMemo(() => {
    return messages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  const totalPages = Math.ceil(filteredMessages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + pageSize);

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Contact Messages</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-5 text-left w-[60px]">Sn.</th>
                <th className="py-3 px-5 text-left">Name</th>
                <th className="py-3 px-5 text-left">Email</th>
                <th className="py-3 px-5 text-left">Subject</th>
                <th className="py-3 px-5 text-left">Received At</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.length > 0 ? (
                paginatedMessages.map((msg, idx) => (
                  <tr
                    key={msg.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5 text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-5 font-medium text-gray-800">
                      {msg.name}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{msg.email}</td>
                    <td className="py-3 px-5 text-gray-600">{msg.subject}</td>
                    <td className="py-3 px-5 text-gray-600">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        title="View Message"
                        className="text-[var(--brand-primary)] bg-transparent hover:bg-[var(--soft-gray)] 
                                   p-2 rounded-full transition-all duration-200 
                                   hover:scale-110 hover:shadow-sm focus:outline-none 
                                   focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-500 text-sm"
                  >
                    No messages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {!loading && filteredMessages.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMessages.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ✅ Message Popup */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative p-6 border border-gray-200">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[var(--brand-primary)] transition"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Message Details
            </h2>

            <div className="space-y-3 text-gray-700">
              <p><strong>Name:</strong> {selectedMessage.name}</p>
              <p><strong>Email:</strong> {selectedMessage.email}</p>
              <p><strong>Subject:</strong> {selectedMessage.subject}</p>
              <div>
                <p className="font-semibold text-[var(--brand-primary)] mb-1">Message:</p>
                <p className="bg-gray-50 border border-gray-200 p-3 rounded-md whitespace-pre-line">
                  {selectedMessage.message}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Received on {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Alert Popup */}
      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
        cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
        onConfirm={popUpAlertData.onConfirm}
        onCancel={popUpAlertData.onCancel}
        show={popUpAlertData.isOpen}
      />
    </div>
  );
}
