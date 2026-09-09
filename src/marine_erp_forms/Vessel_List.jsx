import React, { useState } from "react";

const createEmptyRow = () => ({
  newVesselName: "",
  oldVesselName: "",
  action: "",
  imo: "",
  spotVessel: "",
  vesselType: "",
  eac: "",
  rebate: ""
});

const VesselTable = () => {
  const [rows, setRows] = useState([createEmptyRow()]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/vessels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rows)
      });

      if (!res.ok) throw new Error("Failed to save");
      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  return (
    <div className="p-6">
      {/* <h2 className="font-bold text-lg mb-4">Vessel Details</h2> */}

      <div className="overflow-x-auto">
        <table className="border border-gray-400 w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">New Vessel Name</th>
              <th className="border p-2">Old Vessel Name (where applicable)</th>
              <th className="border p-2">Add/Change/Delete</th>
              <th className="border p-2">IMO/LRN No</th>
              <th className="border p-2">Spot Vessel</th>
              <th className="border p-2">Vessel Type</th>
              <th className="border p-2">EAC</th>
              <th className="border p-2">Rebate / Investment</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border p-1">
                  <input
                    value={row.newVesselName}
                    onChange={(e) =>
                      handleChange(i, "newVesselName", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.oldVesselName}
                    onChange={(e) =>
                      handleChange(i, "oldVesselName", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                <select
                    value={row.action}
                    onChange={(e) => handleChange(i, "action", e.target.value)}
                    className="w-full p-1"
                >
                    <option value="">Select Action</option>
                    <option value="Add-New">Add</option>
                    <option value="Change-Name">Change</option>
                    <option value="Delete-Temporary">Delete</option>

                </select>

                </td>

                <td className="border p-1">
                  <input
                    value={row.imo}
                    onChange={(e) =>
                      handleChange(i, "imo", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    value={row.spotVessel}
                    onChange={(e) =>
                      handleChange(i, "spotVessel", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.vesselType}
                    onChange={(e) =>
                      handleChange(i, "vesselType", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    value={row.eac}
                    onChange={(e) =>
                      handleChange(i, "eac", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>

                <td className="border p-1">
                  <input
                    type="number"
                    value={row.rebate}
                    onChange={(e) =>
                      handleChange(i, "rebate", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="mt-4 mr-3 px-4 py-2 bg-green-600 text-white rounded"
      >
        + Add Row
      </button>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-success text-white rounded"
      >
        Save Data
      </button>
    </div>
  );
};

export default VesselTable;