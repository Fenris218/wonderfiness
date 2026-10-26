"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type Message = {
  role: "bot" | "user";
  text: string;
  href?: string;
  linkLabel?: string;
};

type Script = {
  keywords: string[];
  reply: Omit<Message, "role">;
};

const HOTLINE = "0902 797 443";

const GREETING =
  "Xin chào! Mình là trợ lý Wonder Fitness. Bạn muốn hỏi về bảng giá, lịch Yoga/Zumba, chi nhánh hay HLV PT?";

const QUICK_REPLIES = ["Bảng giá", "Lịch Yoga/Zumba", "Chi nhánh", "HLV PT", "Hotline"];

const SCRIPTS: Script[] = [
  {
    keywords: ["yoga", "zumba", "lich lop", "lop nhom", "lich tap"],
    reply: {
      text: "Lịch Yoga và Zumba nằm ở tab “Lịch Yoga/Zumba” trên thanh menu. Lịch áp dụng tại cả 5 chi nhánh.",
      href: "/lich-yoga-zumba",
      linkLabel: "Xem lịch Yoga/Zumba",
    },
  },
  {
    keywords: ["pt", "hlv", "huan luyen", "trainer", "ca nhan", "1-1"],
    reply: {
      text: "Wonder có 8 HLV PT 1-1, học phí 350.000đ–550.000đ/buổi tuỳ HLV. Gói PT 12 buổi khoảng 4.200.000đ–6.600.000đ.",
      href: "/goi-tap?type=PT",
      linkLabel: "Xem HLV & chọn gói PT",
    },
  },
  {
    keywords: ["chi nhanh", "dia chi", "o dau", "duong", "google maps", "map"],
    reply: {
      text: "5 chi nhánh: Hòa Cường (Hải Châu), Ngũ Hành Sơn, Thanh Khê, Cẩm Lệ, Hòa Khánh (Liên Chiểu). Bấm vào chi nhánh để mở Google Maps.",
      href: "/chi-nhanh",
      linkLabel: "Xem chi nhánh & bản đồ",
    },
  },
  {
    keywords: ["gio", "mo cua", "dong cua", "may gio", "thoi gian"],
    reply: { text: "Tất cả chi nhánh mở cửa 05:30 – 21:30 hằng ngày, kể cả cuối tuần." },
  },
  {
    keywords: ["hotline", "lien he", "dien thoai", "so dt", "goi dien"],
    reply: {
      text: `Hotline Wonder Fitness: ${HOTLINE} (08:00–21:00). Bấm để gọi ngay.`,
      href: "tel:0902797443",
      linkLabel: `Gọi ${HOTLINE}`,
    },
  },
  {
    keywords: ["dang ky", "tai khoan", "dang nhap", "mua goi", "mua"],
    reply: {
      text: "Bạn tạo tài khoản miễn phí, sau đó mua gói online (VNPay/MoMo/VietQR mô phỏng) hoặc chọn thanh toán tại quầy.",
      href: "/dang-ky",
      linkLabel: "Tạo tài khoản",
    },
  },
  {
    keywords: ["thanh toan", "vnpay", "momo", "vietqr", "chuyen khoan"],
    reply: {
      text: "Wonder hỗ trợ thanh toán online mô phỏng qua VNPay/MoMo/VietQR, hoặc giữ đơn và trả tại quầy trong 48 giờ.",
    },
  },
  {
    keywords: ["tu van", "dat lich", "hen", "tu van mien phi"],
    reply: {
      text: "Bạn để lại họ tên + số điện thoại, nhân viên chi nhánh sẽ gọi tư vấn miễn phí.",
      href: "/tu-van",
      linkLabel: "Đặt lịch tư vấn",
    },
  },
  {
    keywords: ["gia", "bang gia", "hoc phi", "bao nhieu", "phi"],
    reply: {
      text: "Gym: 1 tháng 500.000đ · 6 tháng + tặng 2 tháng 2.500.000đ · 12 tháng + tặng 3 tháng 3.500.000đ. PT 1-1 12 buổi từ 4.200.000đ.",
      href: "/goi-tap",
      linkLabel: "Xem bảng giá",
    },
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function findReply(text: string): Omit<Message, "role"> {
  const normalized = normalize(text);
  const script = SCRIPTS.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  if (script) return script.reply;
  return {
    text: `Mình chưa có kịch bản cho câu này. Bạn thử hỏi về bảng giá, lịch Yoga/Zumba, chi nhánh, HLV PT, hoặc gọi hotline ${HOTLINE} nhé.`,
    href: "/tu-van",
    linkLabel: "Gửi yêu cầu tư vấn",
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: GREETING }]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function send(value?: string) {
    const text = (value ?? input).trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    const reply = findReply(text);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", ...reply }]);
    }, 320);
  }

  return (
    <>
      {open ? (
        <div
          className="fixed bottom-4 right-4 z-50 flex h-[540px] max-h-[calc(100vh-2rem)] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          role="dialog"
          aria-label="Trợ lý Wonder Fitness"
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">Trợ lý Wonder</p>
                <p className="text-[10.5px] text-white/45">Trả lời theo kịch bản</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng trợ lý"
              className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface/50 p-4">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                      : "max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-ink/75"
                  }
                >
                  <p>{message.text}</p>
                  {message.href ? (
                    message.href.startsWith("tel:") ? (
                      <a
                        href={message.href}
                        className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
                      >
                        {message.linkLabel}
                      </a>
                    ) : (
                      <Link
                        href={message.href}
                        className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
                      >
                        {message.linkLabel}
                      </Link>
                    )
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-line bg-white px-3 pt-2.5">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2">
              {QUICK_REPLIES.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => send(quick)}
                  className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium text-ink/60 transition hover:border-brand hover:text-brand"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-line bg-white p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi..."
              className="input h-10 flex-1 py-2 text-[13px]"
              aria-label="Câu hỏi cho trợ lý"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Gửi câu hỏi"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(255,77,28,.8)] transition hover:bg-brand-dark"
          aria-label="Mở trợ lý Wonder"
        >
          <MessageCircle className="h-5 w-5" />
          Hỏi Wonder
        </button>
      )}
    </>
  );
}
