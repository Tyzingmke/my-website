export const pageTransition = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const } };
export const modalTransition = { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.15 } };
export const listItem = { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.12 } };
