import { Card as CardType } from '../types';
import { Card } from './Card';

interface CardSelectorProps {
  cards: CardType[];
  selectedCard: CardType | null;
  onSelectCard: (card: CardType) => void;
  removedCards: CardType[];
}

export function CardSelector({
  cards,
  selectedCard,
  onSelectCard,
  removedCards,
}: CardSelectorProps) {
  const removedCardIds = new Set(removedCards.map(c => c.id));

  return (
    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 rounded-lg">
      {cards.map((card) => {
        const isRemoved = removedCardIds.has(card.id);
        const isSelected = selectedCard?.id === card.id;
        
        return (
          <div
            key={card.id}
            onClick={() => !isRemoved && onSelectCard(card)}
            className={`
              cursor-pointer transition-all
              ${isRemoved ? 'opacity-30' : ''}
              ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-400'}
            `}
          >
            <Card card={card} size="small" />
          </div>
        );
      })}
    </div>
  );
}
