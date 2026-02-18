"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          data-rating={rating}
          disabled={disabled}
          onClick={() => onChange(rating)}
          className={cn(
            "transition-colors",
            disabled ? "cursor-default" : "cursor-pointer hover:text-primary"
          )}
        >
          <Star
            className={cn(
              "h-6 w-6",
              rating <= value
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={cn(
            "h-4 w-4",
            rating <= value
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
