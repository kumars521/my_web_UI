  import React from "react";
  const parseDateValue = (value) => {
    if (value === undefined || value === null || value === "") return null;

    if (typeof value === "number") {
      return new Date(value);
    }

    if (typeof value === "string") {
      const m = value.match(/\/Date\((-?\d+)\)\//);
      if (m) {
        return new Date(Number(m[1]));
      }

      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d;
      }

      const alt = new Date(value.replace(/-/g, "/"));
      if (!Number.isNaN(alt.getTime())) {
        return alt;
      }
    }

    return null;
  };

  export const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };