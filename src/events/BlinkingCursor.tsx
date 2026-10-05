import { useEffect, useState } from "react";

export default function BlinkingCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setVisible((value) => !value), 530);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      aria-hidden="true"
      className={`ml-1 inline-block h-8 w-2 bg-[#00ff41] align-middle md:h-12 md:w-3 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
