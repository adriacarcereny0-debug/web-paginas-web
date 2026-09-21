"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function WhatsAppButton({ phone, brandName }: { phone: string; brandName: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!phone) return null;
  const clean = phone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(`Hola ${brandName}, me gustaría información sobre una página web.`);

  return (
    <a
      href={`https://wa.me/${clean}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className={`fixed bottom-5 right-5 z-40 print:hidden grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-card transition-colors duration-200 hover:bg-emerald-700 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Icon name="whatsapp" size={26} strokeWidth={1.8} />
    </a>
  );
}
