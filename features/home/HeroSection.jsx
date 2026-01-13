import Image from "next/image";
export default function HeroSection() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        <Image
          src="/banner.webp"
          alt="PC Adviser Banner"
          fill
          priority
          style={{
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}


