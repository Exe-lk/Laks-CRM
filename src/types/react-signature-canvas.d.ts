declare module 'react-signature-canvas' {
  import React from 'react';

  interface SignatureCanvasProps {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    dotSize?: number | (() => number);
    penColor?: string;
    throttle?: number;
    backgroundColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataURL: string, options?: { ratio?: number; width?: number; height?: number }): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromData(data: Array<{ x: number; y: number; time: number }>): void;
    toData(): Array<{ x: number; y: number; time: number }>;
    off(): void;
    on(): void;
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
  }
}

