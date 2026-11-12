import { useId, useState } from "react";

export function useListbox(options, onPick, onClose) {
  const listId = useId();
  const [active, setActive] = useState(-1);
  const current = active < options.length ? active : -1;
  const optionId = (i) => `${listId}-${i}`;

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(current + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(current - 1, -1));
    } else if (e.key === "Enter" && current >= 0) {
      e.preventDefault();
      setActive(-1);
      onPick(options[current]);
    } else if (e.key === "Escape") {
      setActive(-1);
      onClose();
    }
  };

  return {
    active: current,
    reset: () => setActive(-1),
    inputProps: {
      role: "combobox",
      "aria-expanded": options.length > 0,
      "aria-controls": listId,
      "aria-autocomplete": "list",
      "aria-activedescendant": current >= 0 ? optionId(current) : undefined,
      onKeyDown,
    },
    listProps: { id: listId, role: "listbox" },
    optionProps: (i) => ({
      id: optionId(i),
      role: "option",
      "aria-selected": i === current,
      ref:
        i === current
          ? (el) => el?.scrollIntoView?.({ block: "nearest" })
          : undefined,
    }),
  };
}
