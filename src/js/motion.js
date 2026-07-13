export const premiumEase = [0.16, 1, 0.3, 1];
export const snappyEase = [0.2, 0, 0, 1];

export const fadeUp = (delay = 0, y = 18) => ({
  initial: { opacity: 0, y },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.34,
      delay,
      ease: premiumEase,
    },
  },
});

export const premiumSpring = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
  mass: 0.9,
};

export const hoverSpring = {
  type: 'spring',
  stiffness: 520,
  damping: 34,
  mass: 0.7,
};

export const panelSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 34,
  mass: 1,
};
