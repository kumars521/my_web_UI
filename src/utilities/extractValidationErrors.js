export function extractValidationErrors(err) {
  try {
    const data = err?.response?.data;
    if (!data) return err?.message || String(err);

    if (data.errors && typeof data.errors === "object") {
      const msgs = [];
      Object.keys(data.errors).forEach((k) => {
        const v = data.errors[k];
        if (Array.isArray(v)) msgs.push(...v.filter(Boolean));
        else if (typeof v === "string") msgs.push(v);
      });
      if (msgs.length) return msgs.join("; ");
    }

    if (data.message) return data.message;
    if (data.title) return data.title;

    return JSON.stringify(data);
  } catch (e) {
    return err?.message || String(err);
  }
}
