import { AnimatePresence, motion } from 'framer-motion';

export default function LoadingScreen({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 grid place-items-center bg-cream"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.span
              initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="grid h-16 w-16 place-items-center rounded-full bg-apple"
            >
              <svg width="30" height="33" viewBox="0 0 20 22" fill="none" stroke="#F8F5F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 6c-3-3-8-1-8 5 0 5 3 9 5.5 9 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2.5 0 5.5-4 5.5-9 0-6-5-8-8-5z" />
                <path d="M10 6V2" />
                <path d="M10 3c2-1 4 0 4 2" />
              </svg>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-xl font-semibold text-wood"
            >
              Biohof Tambke
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
