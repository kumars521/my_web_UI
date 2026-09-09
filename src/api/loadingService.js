const emitter = new EventTarget();

let total = 0;
const keys = new Map();

const emit = (changedKey = null) => {
  const detail = {
    total,
    key: changedKey,
    keyCount: changedKey ? keys.get(changedKey) || 0 : undefined,
  };
  emitter.dispatchEvent(new CustomEvent("loading", { detail }));
};

export const startLoading = (key) => {
  if (key) {
    keys.set(key, (keys.get(key) || 0) + 1);
  }
  total += 1;
  emit(key);
};

export const stopLoading = (key) => {
  if (key) {
    const current = keys.get(key) || 0;
    if (current <= 1) keys.delete(key); else keys.set(key, current - 1);
  }
  total = Math.max(0, total - 1);
  emit(key);
};

export const getLoadingCount = (key) => (key ? keys.get(key) || 0 : total);

export const onLoadingChange = (cb) => {
  const handler = (e) => cb(e.detail);
  emitter.addEventListener("loading", handler);
  return () => emitter.removeEventListener("loading", handler);
};

export default {
  startLoading,
  stopLoading,
  getLoadingCount,
  onLoadingChange,
};
