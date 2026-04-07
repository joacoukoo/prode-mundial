"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";

interface PlayerAvatarProps {
  userId: string;
  displayName: string;
  avatarColor: string;
  size?: number;
  editable?: boolean;
  photoOverride?: string; // for leaderboard (pre-fetched photo)
}

export function PlayerAvatar({
  userId,
  displayName,
  avatarColor,
  size = 36,
  editable = false,
  photoOverride,
}: PlayerAvatarProps) {
  const { photo: ownPhoto, uploadPhoto, removePhoto } = useProfilePhoto(userId);
  const photo = photoOverride ?? ownPhoto;
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const initials = displayName.slice(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.36);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      onMouseEnter={() => editable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar circle */}
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-white ring-2 ring-white/10"
        style={{ background: photo ? "transparent" : avatarColor, fontSize }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="uppercase">{initials}</span>
        )}
      </div>

      {/* Edit overlay (only when editable and hovered) */}
      {editable && hovered && (
        <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer z-10"
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={size * 0.35} className="text-white" />
        </div>
      )}

      {/* Remove button */}
      {editable && photo && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); removePhoto(); }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border border-background flex items-center justify-center z-20 hover:bg-red-400 transition-colors"
        >
          <X size={10} className="text-white" />
        </button>
      )}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadPhoto(file);
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
}
