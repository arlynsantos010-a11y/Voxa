import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VideoActionsProps {
  likes: number;
  comments: number;
  shares: number;
  isLikedInitial?: boolean;
}

export function VideoActions({ likes, comments, shares, isLikedInitial = false }: VideoActionsProps) {
  const [isLiked, setIsLiked] = useState<boolean>(isLikedInitial);
  const [likesCount, setLikesCount] = useState<number>(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className="flex flex-col items-center gap-6 absolute right-4 bottom-24 text-white drop-shadow-md z-20">
      {/* Profile Avatar */}
      <div className="w-[42px] h-[42px] rounded-full border-2 border-white bg-slate-800 overflow-hidden mb-2 shadow-lg cursor-pointer hover:scale-105 transition">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${likes}`} alt="avatar" />
      </div>

      <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
        <div className="p-3 bg-black/40 rounded-full group-hover:bg-black/60 transition backdrop-blur-md">
          <Heart className={cn("w-6 h-6 transition-transform group-active:scale-90", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
        </div>
        <span className="text-xs font-bold drop-shadow-md">{likesCount}</span>
      </button>

      <button className="flex flex-col items-center gap-1 group">
        <div className="p-3 bg-black/40 rounded-full group-hover:bg-black/60 transition backdrop-blur-md">
          <MessageCircle className="w-6 h-6 text-white transition-transform group-active:scale-90" />
        </div>
        <span className="text-xs font-bold drop-shadow-md">{comments}</span>
      </button>

      <button className="flex flex-col items-center gap-1 group">
        <div className="p-3 bg-black/40 rounded-full group-hover:bg-black/60 transition backdrop-blur-md">
          <Share2 className="w-6 h-6 text-white transition-transform group-active:scale-90" />
        </div>
        <span className="text-xs font-bold drop-shadow-md">{shares}</span>
      </button>

       <button className="flex flex-col items-center gap-1 group mt-2">
        <div className="p-2 bg-black/40 rounded-full group-hover:bg-black/60 transition backdrop-blur-md">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </div>
      </button>
    </div>
  );
}
