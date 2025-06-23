import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const LoadingDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
};

const BeforeView = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <p className="absolute top-6 text-sm text-gray-300">SÊ BEM-VINDO</p>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          students<span className="text-sky-300">@</span>DigiMedia
        </h1>
      </div>

      <img src={logo} alt="DigiMedia logo" className="w-28 mt-8 mb-8" />

      <p className="text-lg tracking-wider">
        AGUARDA<LoadingDots />
      </p>
    </div>
  );
};

export default BeforeView;
