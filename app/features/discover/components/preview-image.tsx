import { useState } from "react";

export function PreviewImage({ src, fallback }: { src?: string | null; fallback?: string }) {
  const [imageError, setImageError] = useState(false);
  return (
    <img
      className="aspect-[2/1] w-full rounded-xl bg-white object-cover filter transition-all group-hover:shadow dark:brightness-[85%]"
      src={
        imageError || !src
          ? fallback ||
            "https://res.cloudinary.com/dsr37ut2z/image/upload/f_auto,q_auto,w_300/assets/backgrounds/dashboard-bg.png"
          : src
      }
      alt=""
      onError={() => {
        setImageError(true);
      }}
    />
  );
}
