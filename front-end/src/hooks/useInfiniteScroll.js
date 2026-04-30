import { useEffect, useRef } from 'react';

function useInfiniteScroll({ enabled = true, hasMore, loading, onLoadMore, rootMargin = '320px 0px' }) {
  const targetRef = useRef(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!loading) {
      lockedRef.current = false;
    }
  }, [loading]);

  useEffect(() => {
    const node = targetRef.current;

    if (!enabled || !node || loading || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry?.isIntersecting || lockedRef.current) {
          return;
        }

        lockedRef.current = true;
        onLoadMore();
      },
      {
        root: null,
        rootMargin,
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, hasMore, loading, onLoadMore, rootMargin]);

  return targetRef;
}

export default useInfiniteScroll;
