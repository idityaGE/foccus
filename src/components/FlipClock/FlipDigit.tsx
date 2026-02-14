import { useEffect, useRef, useState } from "react";

interface FlipDigitProps {
  digit: string;
}

export default function FlipDigit({ digit }: FlipDigitProps) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const leafRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (digit !== currentDigit) {
      // Set up the new digit on hidden faces
      setNextDigit(digit);
      setFlipping(true);

      const timeout = setTimeout(() => {
        setFlipping(false);
        setCurrentDigit(digit);
        setNextDigit(digit);
      }, 400); // matches CSS transition duration

      return () => clearTimeout(timeout);
    }
  }, [digit, currentDigit]);

  return (
    <div className="rotor">
      {/* Static top - shows the NEW digit (revealed when flap flips away) */}
      <div className="rotor-top">
        <span>{nextDigit}</span>
      </div>

      {/* Static bottom - shows the OLD digit (covered by flap rear after flip) */}
      <div className="rotor-bottom">
        <span>{currentDigit}</span>
      </div>

      {/* Animated leaf / flap */}
      <div
        ref={leafRef}
        className={`rotor-leaf${flipping ? " flipping" : ""}`}
      >
        {/* Front: top half of OLD digit */}
        <div className="rotor-leaf-front">
          <span>{currentDigit}</span>
        </div>
        {/* Rear: bottom half of NEW digit */}
        <div className="rotor-leaf-rear">
          <span>{nextDigit}</span>
        </div>
      </div>
    </div>
  );
}
