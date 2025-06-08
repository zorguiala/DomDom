import * as React from "react";
import { format, isSameDay } from "date-fns";

interface DatePickerProps {
  /**
   * @deprecated Use 'date' instead for consistency with form usage
   */
  value?: Date;
  /**
   * @deprecated Use 'setDate' instead for consistency with form usage
   */
  onChange?: (date: Date) => void;
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

// Simple calendar grid for the current month
function getDaysInMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  for (let d = 1; d <= end.getDate(); d++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), d));
  }
  return days;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  date,
  setDate,
  minDate,
  maxDate,
  disabled,
  className = "",
}) => {
  // Prefer new props, fallback to deprecated
  const selectedDate = date ?? value;
  const handleDateChange = setDate ?? onChange;
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(selectedDate || new Date());
  const days = getDaysInMonth(month);

  const handleSelect = (day: Date) => {
    if (disabled) return;
    if (minDate && day < minDate) return;
    if (maxDate && day > maxDate) return;
    handleDateChange?.(day);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="border rounded px-3 py-2 bg-white text-sm w-full text-left"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
      >
        {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "Select date"}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 bg-white border rounded shadow p-2 w-64">
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              className="px-2 py-1 text-xs"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              &lt;
            </button>
            <span className="font-semibold">{format(month, "MMMM yyyy")}</span>
            <button
              type="button"
              className="px-2 py-1 text-xs"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center font-medium text-gray-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(month.getDay())
              .fill(null)
              .map((_, i) => (
                <div key={i} />
              ))}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDisabled =
                (minDate && day < minDate) ||
                (maxDate && day > maxDate) ||
                disabled;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`rounded p-1 w-8 h-8 text-center ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-blue-100"
                  }`}
                  onClick={() => handleSelect(day)}
                  disabled={isDisabled}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = "DatePicker";
