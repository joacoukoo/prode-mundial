"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { useAuth } from "@/context/AuthContext";

interface PlayerAvatarProps {
  userId: string;
  displayName: string;
  avatarColor: string;
  size?: number;
  editable?: boolean;
  photoUrl?: string; // URL from Supabase Storage (pre-fetched)
}

export function PlayerAvatar({
  userId,
  displayName,
  avatarColor,
  size = 36,
  editable = false,
  photoUrl,
}: PlayerAvatarProps) {
  const { profile } = useAuth();
  const { uploadPhoto } = useProfilePhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | undefined>(photoUrl);
  const isOwn = profile?.id === userId;
  const canEdit = editable && isOwn;

  const initials = displayName.slice(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.36);

  async function handleFile(file: File) {
    const url = await uploadPhoto(file);
    if (url) setLocalPhoto(url);
  }

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      onMouseEnter={() => canEdit && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-white ring-2 ring-white/10"
        style={{ background: localPhoto ? "transparent" : avatarColor, fontSize }}
      >
        {localPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localPhoto} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="uppercase">{initials}</span>
        )}
      </div>

      {canEdit && hovered && (
        <div
          className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer z-10"
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={size * 0.35} className="text-white" />
        </div>
      )}

      {canEdit && localPhoto && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); setLocalPhoto(undefined); }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border border-background flex items-center justify-center z-20 hover:bg-red-400 transition-colors"
        >
          <X size={10} className="text-white" />
        </button>
      )}

      {canEdit && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
}
