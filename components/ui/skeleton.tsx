// shadcn 스타일 기본 Skeleton 컴포넌트.
// 로딩 상태에서 컨텐츠 placeholder 로 사용한다.
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
      aria-hidden="true"
    />
  );
}
