"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function SortModal({
  open,
  onClose,
  selected,
  onSelect,
  sortOptions,
  variant = "mobile",
}) {
  if (variant === "desktop") {
    return (
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={onClose}
            />
            <motion.div
              key="sort-dropdown"
              className="absolute top-full right-0 mt-2 z-50 min-w-[160px] rounded-lg bg-white py-2 shadow-lg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className={`cursor-pointer px-4 py-2 text-sm text-center hover:bg-gray-100 ${
                    selected === option.value ? "font-bold" : ""
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  {option.label}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop for outside tap to close */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={onClose}
          />

          <motion.div
            key="sort-modal"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[60%] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-10 shadow-xl"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 100) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />
            <h2 className="mb-6 text-center text-lg font-bold">Sort by</h2>

            <div className="space-y-4">
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center justify-between text-lg"
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <span>{option.label}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === option.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-blue-500"
                      }`}
                  >
                    {selected === option.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}