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
          className="fixed bottom-0 left-0 right-0 bg-white z-50 p-6 pb-10 rounded-t-2xl shadow-xl w-full max-h-[60%] touch-pan-y"
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
          <h2 className="text-center font-bold text-lg mb-6">Sort by</h2>
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === option.value
                      ? "bg-blue-500 border-blue-500"
                      : "border-blue-500"
                  }`}
                >
                  {selected === option.value && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
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
