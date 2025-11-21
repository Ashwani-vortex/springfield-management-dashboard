import { TOKENS } from "../data";

// FIX: Added default values ({ columns = [], data = [] }) to props
export const Table = ({ columns = [], data = [] }) => {
  
  // Safety Check: If columns is somehow null/undefined despite default, return null or empty div
  if (!columns || !Array.isArray(columns)) {
    console.warn("Table: 'columns' prop is missing or not an array");
    return null; 
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: TOKENS.muted }}>
            {columns.map((col, index) => (
              <th 
                key={col.key || col.header || index} 
                className="py-2 pr-4 font-normal"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Safety Check: Render a message if data is empty */}
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t"
                style={{ borderColor: TOKENS.border }}
              >
                {columns.map((col, colIndex) => {
                  // 1. Get the specific value for this column key
                  // Safety: Check if row exists
                  const rawValue = row ? row[col.key] : null;
                  
                  // 2. Render logic
                  const cellContent = col.render 
                    ? col.render(rawValue, row) 
                    : (rawValue === null || rawValue === undefined ? "-" : rawValue);

                  return (
                    <td key={`${rowIndex}-${colIndex}`} className="py-2 pr-4">
                       {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};