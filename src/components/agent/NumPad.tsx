import { useEffect } from "react";
import { Delete } from "lucide-react";

export function NumPad({ onPress, onBack }: { onPress: (s: string) => void; onBack: () => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (/^[0-9]$/.test(e.key)) {
        onPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPress, onBack]);

  return (
    <div role="group" aria-label="Amount keypad — you can also type digits" className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === "del" ? "Delete last digit" : `Digit ${k}`}
          onClick={() => (k === "del" ? onBack() : onPress(k))}
          className="min-h-14 rounded-xl border-2 border-border bg-card py-4 text-xl font-semibold transition hover:bg-cream active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {k === "del" ? <Delete className="mx-auto h-5 w-5" /> : k}
        </button>
      ))}
    </div>
  );
}
