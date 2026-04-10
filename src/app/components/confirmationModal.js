"use client";

import { motion, AnimatePresence } from "framer-motion";
import Button from "./button";

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-500 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute backdrop-blur-xs"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-black">{title}</h3>
                        <p className="mt-2 text-black">{message}</p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="CTA"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}