import { useState, useEffect } from 'react';
import { tutorialSlides } from '../config/tutorialConfig';
import './Tutorial.css';

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = tutorialSlides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === tutorialSlides.length - 1;

  const goBack = () => {
    if (isFirst) {
      onClose();
    } else {
      setSlideIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    if (isLast) {
      onClose();
    } else {
      setSlideIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        if (slideIndex === 0) onClose();
        else setSlideIndex((i) => i - 1);
      }
      if (e.key === 'ArrowRight') {
        if (slideIndex === tutorialSlides.length - 1) onClose();
        else setSlideIndex((i) => i + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideIndex, onClose]);

  return (
    <div
      className="tutorial-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-content"
      onClick={onClose}
    >
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-header">
          <h2 id="tutorial-title" className="tutorial-title">
            {slide.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="tutorial-close"
            aria-label="Close tutorial"
          >
            ×
          </button>
        </div>

        <div id="tutorial-content" className="tutorial-content">
          <p className="tutorial-body">{slide.content}</p>
        </div>

        <div className="tutorial-footer">
          <span className="tutorial-progress" aria-live="polite">
            {slideIndex + 1} of {tutorialSlides.length}
          </span>
          <div className="tutorial-nav">
            <button
              type="button"
              onClick={goBack}
              className="tutorial-btn tutorial-btn-secondary"
            >
              {isFirst ? 'Back to Menu' : 'Back'}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="tutorial-btn tutorial-btn-primary"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
