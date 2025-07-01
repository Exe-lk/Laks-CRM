"use client";
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setImageURL(null);
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please draw your signature first.");
      return;
    }
    const dataURL = sigCanvas.current?.getCanvas().toDataURL("image/png");
    if (dataURL) {
      setImageURL(dataURL);
    }
  };
  

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "border border-gray-400 rounded-lg bg-white",
        }}
      />

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Finish
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear
        </button>
      </div>

      {imageURL && (
        <div className="mt-4 text-center">
          <p className="mb-2 font-semibold">Saved Signature (.png):</p>
          <img src={imageURL} alt="signature" className="border rounded shadow" />
          <a
            href={imageURL}
            download="signature.png"
            className="block mt-2 text-blue-600 underline"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
