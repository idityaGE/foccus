import { useEffect, useRef, useState } from "react";

interface FlipDigitProps {
  digit: string;
}

export default function FlipDigit({ digit }: FlipDigitProps) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (digit !== displayDigit && !flipping) {
      // Start flip: front shows old (displayDigit), rear shows new (digit)
      setNextDigit(digit);
      setFlipping(true);

      timeoutRef.current = setTimeout(() => {
        // Flip done: update static halves, reset leaf
        setDisplayDigit(digit);
        setFlipping(false);
      }, 400);
    } else if (digit !== displayDigit && flipping) {
      // Digit changed again mid-flip: let current flip finish,
      // then it'll re-trigger from the useEffect since displayDigit !== digit
      setNextDigit(digit);
    }
  }, [digit, displayDigit, flipping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="rotor">
      {/* Static top half - shows NEW digit (revealed when flap flips away) */}
      <div className="rotor-top">
        <span>{nextDigit}</span>
      </div>

      {/* Static bottom half - shows OLD digit (covered by rear after flip) */}
      <div className="rotor-bottom">
        <span>{displayDigit}</span>
      </div>

      {/* Animated leaf / flap */}
      <div className={`rotor-leaf${flipping ? " flipping" : ""}`}>
        {/* Front: top half of OLD digit (visible before flip) */}
        <div className="rotor-leaf-front">
          <span>{displayDigit}</span>
        </div>
        {/* Rear: bottom half of NEW digit (revealed after flip) */}
        <div className="rotor-leaf-rear">
          <span>{nextDigit}</span>
        </div>
      </div>
    </div>
  );
}
