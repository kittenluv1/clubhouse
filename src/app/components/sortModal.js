"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function SortModal({
  open,
  onClose,
  selected,
  onSelect,
  sortOptions,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sort-modal"
          className="fixed right-0 bottom-0 left-0 z-50 max-h-[60%] w-full touch-pan-y rounded-t-2xl bg-white p-6 pb-10 shadow-xl"
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
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected === option.value
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
      )}
    </AnimatePresence>
  );
}
