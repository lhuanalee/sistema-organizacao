import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minha Rotina Organizada",
    short_name: "Minha Rotina",
    description: "Organize suas tarefas e sua rotina em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#DFF0DC",
    theme_color: "#DFF0DC",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
