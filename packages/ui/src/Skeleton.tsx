interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
}

export function Skeleton({ height = 20, width = "100%", borderRadius = 6 }: SkeletonProps) {
  return (
    <div
      className="ui-skeleton"
      style={{ height, width, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonTaskItem() {
  return (
    <div className="ui-skeleton-task">
      <div className="ui-skeleton-task__top">
        <Skeleton height={20} width={64} borderRadius={99} />
        <Skeleton height={14} width={80} />
      </div>
      <Skeleton height={18} width="70%" />
      <Skeleton height={14} width="45%" />
    </div>
  );
}
