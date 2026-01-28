import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export const useSuperLikeAnimation = () => {
  const triggerSuperLikeEffect = useCallback(() => {
    // Star burst from center
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#A855F7']
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      });
    };

    // Multiple bursts for dramatic effect
    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);

    // Hearts/stars from sides
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#FFD700', '#FF6B9D', '#C084FC']
    });

    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#FFD700', '#FF6B9D', '#C084FC']
    });
  }, []);

  return { triggerSuperLikeEffect };
};

export default useSuperLikeAnimation;
