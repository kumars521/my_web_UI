import { useEffect, useState } from "react";
import { onLoadingChange, getLoadingCount } from "../api/loadingService";

export default function useLoading(key = null) {
  const [count, setCount] = useState(getLoadingCount(key));

  useEffect(() => {
    const unsubscribe = onLoadingChange((info) => {
      if (key) {
        setCount(info.key === key ? info.keyCount : getLoadingCount(key));
      } else {
        setCount(info.total);
      }
    });

    return unsubscribe;
  }, [key]);

  return { loadingCount: count, isLoading: count > 0 };
}
