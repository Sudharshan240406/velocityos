"use client";

import React from "react";
import { useFocusStore } from "../store/focusStore";
import dynamic from "next/dynamic";

const AuroraWallpaper = dynamic(() => import("./wallpapers/AuroraWallpaper"), { ssr: false });
const CyberCityWallpaper = dynamic(() => import("./wallpapers/CyberCityWallpaper"), { ssr: false });
const F1GarageWallpaper = dynamic(() => import("./wallpapers/F1GarageWallpaper"), { ssr: false });
const NeonTokyoWallpaper = dynamic(() => import("./wallpapers/NeonTokyoWallpaper"), { ssr: false });
const SpaceNebulaWallpaper = dynamic(() => import("./wallpapers/SpaceNebulaWallpaper"), { ssr: false });

export default function BackgroundScene() {
  const { wallpaper } = useFocusStore();

  switch (wallpaper) {
    case "cybercity":   return <CyberCityWallpaper />;
    case "f1garage":    return <F1GarageWallpaper />;
    case "neontokyo":   return <NeonTokyoWallpaper />;
    case "spacenebula": return <SpaceNebulaWallpaper />;
    case "aurora":
    default:            return <AuroraWallpaper />;
  }
}
