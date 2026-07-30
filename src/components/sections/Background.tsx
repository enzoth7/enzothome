import Image from "next/image";

const DEBUG_NO_OVERLAY = false;

type BackgroundProps = {
  variant?: "default" | "wallpaper";
};

export default function Background({ variant = "default" }: BackgroundProps) {
  if (variant === "wallpaper") {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0">
          <Image
            src="/wallpaper.webp"
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoKAAYAAUAmJbACdLoAArl9lNJgAP7xuhf859s6HyD82Pg+Bv7e9eiWk/b4Z5EnavD3/6Gh9+MwUcn2NAA="
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[#0f172a]/70" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 72% 22%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 18%), linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.25) 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[#f8fafc]" />

      {!DEBUG_NO_OVERLAY && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(15,23,42,0.09)_0%,rgba(248,250,252,0)_28%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(15,23,42,0.05)_0%,rgba(248,250,252,0)_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(248,250,252,0.08)_32%,rgba(15,23,42,0.06)_100%)]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(23,23,23,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,23,23,0.025) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(6,78,59,0.03) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(23,23,23,0)_56%,rgba(23,23,23,0.04)_100%)]" />
    </div>
  );
}
