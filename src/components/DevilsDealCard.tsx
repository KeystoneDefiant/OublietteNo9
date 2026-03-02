import { Card as CardType } from '../types';
import { Card } from './Card';
import { formatCredits } from '../utils/format';

interface DevilsDealCardProps {
  card: CardType;
  cost: number;
  quip: string;
  isHeld: boolean;
  isDisabled: boolean;
  onHold: () => void;
}

export function DevilsDealCard({
  card,
  cost,
  quip,
  isHeld,
  isDisabled,
  onHold,
}: DevilsDealCardProps) {
  const handleClick = () => {
    if (!isDisabled && onHold) {
      onHold();
    }
  };

  return (
    <div
      className={`flex flex-col items-center ${
        isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        position: 'absolute',
        left: 'calc(80%)',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20%',
      }}
      onClick={handleClick}
    >
      <div className="devil-deal-container flex flex-col items-center w-full">
        <div onClick={handleClick} className="w-full flex justify-center">
          <Card
            card={card}
            isHeld={isHeld}
            size="large"
            onClick={handleClick}
          />
        </div>
        <div
          className="mt-4 text-center w-full"
          style={{
            color: isHeld ? 'var(--game-accent-gold)' : 'var(--game-text-muted)',
            fontWeight: isHeld ? 700 : 400,
          }}
          onClick={handleClick}
        >
          <p className="text-base sm:text-lg font-semibold mb-2">{quip}</p>
          <p className="text-sm" style={{ color: 'var(--game-text-dim)' }}>
            Cost: {formatCredits(cost)} credits
          </p>
        </div>
      </div>
    </div>
  );
}
