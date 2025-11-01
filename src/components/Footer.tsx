// "use client";

// import Link from "next/link";
// import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";

// export default function Footer() {
//     return (
//         <footer className="bg-[var(--foreground)] text-white">
//             {/* TOP FOOTER */}
//             <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-3 lg:gap-2">
//                 {/* Column 1 - Delivery & Returns */}
//                 <div>
//                     <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
//                         Delivery & Returns
//                     </h3>
//                     <ul className="space-y-2 text-sm">
//                         <li className="hover:underline cursor-pointer">
//                             Free shipping for orders over £120
//                         </li>
//                         <li className="hover:underline cursor-pointer"><Link href="/shipping-and-delivery">Shipping Information</Link></li>
//                         <li className="hover:underline cursor-pointer"><Link href="/shipping-and-delivery">Delivery</Link></li>
//                         <li className="hover:underline cursor-pointer">Returns & Exchanges</li>
//                     </ul>
//                 </div>

//                 {/* Column 2 - About Us */}
//                 <div>
//                     <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
//                         About Us
//                     </h3>
//                     <ul className="space-y-2 text-sm">
//                         <li className="hover:underline cursor-pointer"><Link href="/about">Our Story</Link></li>
//                         <li className="hover:underline cursor-pointer">Visit us</li>
//                         <li className="hover:underline cursor-pointer">Careers</li>
//                         <li className="hover:underline cursor-pointer"><Link href="/blogs/journal">Journal</Link></li>
//                         <li className="hover:underline cursor-pointer">  <Link href="/loyalty">Loyalty</Link></li>
//                     </ul>
//                 </div>

//                 {/* Column 3 - Customer Care */}
//                 <div className="md:ml-[-10px] lg:ml-[-20px]">
//                     <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
//                         Customer Care
//                     </h3>
//                     <ul className="space-y-2 text-sm">
//                         <li className="hover:underline cursor-pointer">Gift Card</li>
//                         <li className="hover:underline cursor-pointer">Size guide</li>
//                         <li className="hover:underline cursor-pointer">Care & Repair</li>
//                         <li className="hover:underline cursor-pointer"><Link href="/faq">Frequently asked questions</Link></li>
//                         <li className="hover:underline cursor-pointer"><Link href="/contact">Contact us</Link></li>
//                         <li className="hover:underline cursor-pointer"><Link href="/privacy-policy">Privacy policy</Link></li>
//                         <li className="hover:underline cursor-pointer"><Link href="/terms-and-conditions">Terms & conditions</Link></li>
//                     </ul>
//                 </div>

//                 {/* Column 4 - Get in Touch */}
//                 <div>
//                     <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
//                         Get in touch
//                     </h3>
//                     <ul className="space-y-3 text-sm">
//                         <li>
//                             <p>Call us Mon–Fri 10am–3pm</p>
//                             <p className="hover:underline cursor-pointer">+44 (0) 203 823 7768</p>
//                         </li>
//                         <li>
//                             <p>Talk to us on Whatsapp</p>
//                             <p className="hover:underline cursor-pointer">+44 (0) 203 823 7768</p>
//                         </li>
//                         <li>
//                             <p>Email us</p>
//                             <p className="hover:underline cursor-pointer break-words">
//                                 admin@aabcollection.com
//                             </p>
//                         </li>
//                     </ul>
//                 </div>

//                 {/* Column 5 - Join Our Community */}
//                 <div>
//                     <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
//                         Join our community
//                     </h3>
//                     <p className="text-sm mb-4 leading-relaxed">
//                         Exclusive offers and sneak peeks are reserved for those on our mailing list.
//                     </p>
//                     <div className="flex w-full border border-white overflow-hidden mb-6">
//                         <input
//                             type="email"
//                             placeholder="ENTER YOUR EMAIL"
//                             className="flex-1 px-3 py-2 text-sm outline-none bg-transparent placeholder:text-white"
//                         />
//                         <button className="bg-white text-black text-sm px-4 py-2 uppercase whitespace-nowrap hover:bg-gray-200">
//                             Sign Up
//                         </button>
//                     </div>

//                     <div className="flex gap-5 text-lg justify-center">
//                         <FaFacebookF className="cursor-pointer hover:opacity-70" />
//                         <FaInstagram className="cursor-pointer hover:opacity-70" />
//                         <FaYoutube className="cursor-pointer hover:opacity-70" />
//                         <FaPinterestP className="cursor-pointer hover:opacity-70" />
//                     </div>
//                 </div>
//             </div>

//             {/* COPYRIGHT ROW */}
//             <div className="border-t border-white/20">
//                 <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-center text-center text-xs text-white/80">
//                     © {new Date().getFullYear()} Gaza Arabia. All Rights Reserved.
//                 </div>
//             </div>
//         </footer>
//     );
// }


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";

export default function Footer() {
  // ✅ All hooks must be defined first
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  // ✅ Safe early return AFTER hooks
  if (!mounted) return null;

  return (
    <footer className="bg-[var(--foreground)] text-white">
      {/* 🔹 Top Footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-3 lg:gap-2">
        {/* Column 1 – Delivery & Returns */}
        <div>
          <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
            Delivery & Returns
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:underline cursor-pointer">
              Free shipping for orders over £120
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/shipping-and-delivery">Shipping Information</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/shipping-and-delivery">Delivery</Link>
            </li>
            <li className="hover:underline cursor-pointer">Returns & Exchanges</li>
          </ul>
        </div>

        {/* Column 2 – About Us */}
        <div>
          <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
            About Us
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:underline cursor-pointer">
              <Link href="/about">Our Story</Link>
            </li>
            {/* <li className="hover:underline cursor-pointer">Visit us</li> */}
            {/* <li className="hover:underline cursor-pointer">Careers</li> */}
            <li className="hover:underline cursor-pointer">
              <Link href="/blogs/journal">Journal</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/loyalty">Loyalty</Link>
            </li>
          </ul>
        </div>

        {/* Column 3 – Customer Care */}
        <div className="md:ml-[-10px] lg:ml-[-20px]">
          <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
            Customer Care
          </h3>
          <ul className="space-y-2 text-sm">
            {/* <li className="hover:underline cursor-pointer">Gift Card</li> */}
            {/* <li className="hover:underline cursor-pointer">Size Guide</li> */}
            {/* <li className="hover:underline cursor-pointer">Care & Repair</li> */}
            <li className="hover:underline cursor-pointer">
              <Link href="/faq">Frequently Asked Questions</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/contact">Contact Us</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/terms-and-conditions">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        {/* Column 4 – Get in Touch */}
        <div>
          <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
            Get in touch
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <p>Call us Mon–Fri 10am–3pm</p>
              <p className="hover:underline cursor-pointer">+44 (0) 203 823 7768</p>
            </li>
            <li>
              <p>Talk to us on WhatsApp</p>
              <p className="hover:underline cursor-pointer">+44 (0) 203 823 7768</p>
            </li>
            <li>
              <p>Email us</p>
              <p className="hover:underline cursor-pointer break-words">
                admin@aabcollection.com
              </p>
            </li>
          </ul>
        </div>

        {/* Column 5 – Join Our Community */}
        <div>
          <h3 className="font-semibold tracking-wide text-sm mb-4 uppercase">
            Join our community
          </h3>
          <p className="text-sm mb-4 leading-relaxed">
            Exclusive offers and sneak peeks are reserved for those on our mailing list.
          </p>

          {/* Newsletter Form */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full border border-white overflow-hidden mb-6"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL"
              className="flex-1 px-3 py-2 text-sm outline-none bg-transparent placeholder:text-white text-white"
            />
            <button
              type="submit"
              className="bg-white text-black text-sm px-4 py-2 uppercase whitespace-nowrap hover:bg-gray-200 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="flex gap-5 text-lg justify-center">
            <FaFacebookF className="cursor-pointer hover:opacity-70" />
            <FaInstagram className="cursor-pointer hover:opacity-70" />
            <FaYoutube className="cursor-pointer hover:opacity-70" />
            <FaPinterestP className="cursor-pointer hover:opacity-70" />
          </div>
        </div>
      </div>

      {/* Bottom Copyright Row */}
      <div className="border-t border-white/20">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-center text-center text-xs text-white/80">
          © {new Date().getFullYear()} Gaza Arabia. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
