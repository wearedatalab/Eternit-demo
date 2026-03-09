/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Trash2, Download, Loader2, Eraser, PenTool } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const TILE_OPTIONS = [
  { 
    id: 'stone-gray', 
    name: 'Piedra Gris', 
    prompt: 'grey stone floor texture', 
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'marble-cream', 
    name: 'Mármol Crema', 
    prompt: 'cream beige marble floor tiles', 
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'plain-beige', 
    name: 'Liso Beige', 
    prompt: 'plain light beige floor texture', 
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'brick-red', 
    name: 'Ladrillo Rojo', 
    prompt: 'red brick floor pattern', 
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'brick-gray', 
    name: 'Ladrillo Gris', 
    prompt: 'grey brick floor pattern', 
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'brick-beige', 
    name: 'Ladrillo Beige', 
    prompt: 'light beige brick floor pattern', 
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'stone-irregular', 
    name: 'Piedra Irregular', 
    prompt: 'irregular beige stone floor paving', 
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'wood-beige', 
    name: 'Madera Beige', 
    prompt: 'light beige wood floor planks', 
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'wood-vertical', 
    name: 'Madera Vertical', 
    prompt: 'vertical light beige wood floor planks', 
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'stripes-vertical', 
    name: 'Listones Verticales', 
    prompt: 'vertical striped floor pattern', 
    image: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'stripes-dark', 
    name: 'Listones Oscuros', 
    prompt: 'dark brown vertical striped floor pattern', 
    image: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'tiles-red', 
    name: 'Baldosas Rojas', 
    prompt: 'red square floor tiles', 
    image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'tiles-beige', 
    name: 'Baldosas Beige', 
    prompt: 'light beige square floor tiles', 
    image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=400&q=80' 
  },
];

const ImageResult = ({ before, after }: { before: string, after: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none rounded-3xl overflow-hidden cursor-ew-resize bg-stone-100 flex items-center justify-center"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseDown={(e) => { setIsDragging(true); handleMove(e); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e); }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Before Image (Bottom Layer) */}
      <img 
        src={before} 
        alt="Original" 
        className="w-full h-full object-contain pointer-events-none" 
        draggable={false} 
      />
      
      {/* After Image (Top Layer, Clipped from left) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <img 
          src={after} 
          alt="Simulación" 
          className="w-full h-full object-contain" 
          draggable={false} 
        />
      </div>
      
      {/* Slider Line & Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-stone-200">
          <div className="flex -space-x-1">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase pointer-events-none">
        Original
      </div>
      <div className="absolute top-4 right-4 bg-[#E3000F]/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase pointer-events-none">
        Simulación
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [customTile, setCustomTile] = useState<{ image: string, mimeType: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (step === 3 && imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      const resizeCanvas = () => {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      };

      if (img.complete) {
        resizeCanvas();
      } else {
        img.onload = resizeCanvas;
      }
      
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [step, originalImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 99, 33, 0.5)'; // Orange highlight
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setMimeType(file.type);
      setGeneratedImage(null);
      setError(null);
      setStep(3); // Go to mask step
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage || !selectedTile || !mimeType) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      let parts: any[] = [
        {
          inlineData: {
            data: originalImage.split(',')[1],
            mimeType: mimeType,
          },
        }
      ];

      let hasMask = false;
      if (canvasRef.current) {
        const maskDataUrl = canvasRef.current.toDataURL('image/png');
        const ctx = canvasRef.current.getContext('2d');
        const pixels = ctx?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
        hasMask = pixels?.some(p => p !== 0) || false;
        
        if (hasMask) {
          parts.push({
            inlineData: {
              data: maskDataUrl.split(',')[1],
              mimeType: 'image/png',
            }
          });
        }
      }

      if (selectedTile === 'custom') {
        if (!customTile) throw new Error("Por favor sube una imagen de baldosa.");
        parts.push({
          inlineData: {
            data: customTile.image.split(',')[1],
            mimeType: customTile.mimeType,
          }
        });
        
        const prompt = hasMask
          ? "Tienes 3 imágenes: 1. La imagen original del espacio. 2. Una máscara con trazos que indican la zona a editar. 3. La textura de la nueva baldosa. INSTRUCCIÓN CRÍTICA: Debes reemplazar ÚNICAMENTE la zona pintada en la máscara con la textura de la baldosa. TODO el resto de la imagen original (muebles, paredes, sombras, objetos fuera de la zona pintada) DEBE permanecer EXACTAMENTE IGUAL, sin ninguna alteración."
          : "Rediseña el piso de la imagen con el diseño de la baldosa proporcionada. Mantén las paredes, muebles e iluminación exactamente igual. Haz que se vea muy realista y perfectamente integrado.";
          
        parts.push({ text: prompt });
      } else {
        const tile = TILE_OPTIONS.find(t => t.id === selectedTile);
        if (!tile) throw new Error("Tile not found");
        
        const prompt = hasMask
          ? `Tienes 2 imágenes: 1. La imagen original del espacio. 2. Una máscara con trazos que indican la zona a editar. INSTRUCCIÓN CRÍTICA: Debes reemplazar ÚNICAMENTE la zona pintada en la máscara con este diseño: ${tile.prompt}. TODO el resto de la imagen original (muebles, paredes, sombras, objetos fuera de la zona pintada) DEBE permanecer EXACTAMENTE IGUAL, sin ninguna alteración.`
          : `Change the floor to ${tile.prompt}. Keep the walls, furniture, and lighting exactly the same. Make it look highly realistic and seamlessly integrated.`;
          
        parts.push({ text: prompt });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts,
        },
      });

      let foundImage = false;
      let textResponse = "";
      
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts || []) {
          if (part.inlineData) {
            setGeneratedImage(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          } else if (part.text) {
            textResponse += part.text + " ";
          }
        }
      }
      
      if (!foundImage) {
        throw new Error(`La IA no devolvió una imagen. Respuesta: ${textResponse || 'Sin detalles'}`);
      }
      
      setStep(4); // Go to results
    } catch (err: any) {
      console.error("Error de generación:", err);
      setError(err.message || "Ocurrió un error desconocido al generar la imagen.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'simulacion-piso.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetWizard = () => {
    setStep(0);
    setOriginalImage(null);
    setGeneratedImage(null);
    setSelectedTile(null);
    setCustomTile(null);
    setError(null);
    setUserData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-stone-900 font-sans selection:bg-stone-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetWizard}>
          <div className="w-10 h-10 bg-[#E3000F] rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#E3000F] leading-none">Eternit</h1>
            <p className="text-xs text-stone-500 font-medium mt-1 uppercase tracking-wider">Simulador de Espacios</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? 'bg-[#E3000F] text-white' : 
                step > s ? 'bg-stone-300 text-stone-600' : 'bg-stone-200 text-stone-400'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-8 h-1 mx-1 rounded-full ${step > s ? 'bg-stone-300' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>

        {step === 4 && generatedImage && (
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm font-medium bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
        )}
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col">
        
        {/* STEP 0: Welcome & Data Capture */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto w-full">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 border border-stone-100">
              <Sparkles className="w-12 h-12 text-[#E3000F]" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4 text-center">Bienvenido a la herramienta de Eternit</h2>
            <p className="text-stone-500 text-center mb-8">Descubre el hogar de tus sueños por medio de Inteligencia Artificial. Ingresa tus datos para comenzar.</p>
            
            <form 
              className="w-full space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (userData.name && userData.email) setStep(1);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E3000F] focus:border-transparent transition-all"
                  placeholder="Ej. Juan Pérez"
                  value={userData.name}
                  onChange={e => setUserData({...userData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Correo electrónico</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E3000F] focus:border-transparent transition-all"
                  placeholder="ejemplo@correo.com"
                  value={userData.email}
                  onChange={e => setUserData({...userData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono (Opcional)</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E3000F] focus:border-transparent transition-all"
                  placeholder="+57 300 000 0000"
                  value={userData.phone}
                  onChange={e => setUserData({...userData, phone: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#E3000F] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#C8000D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4"
              >
                Comenzar Simulación
              </button>
            </form>
          </div>
        )}

        {/* STEP 1: Select Tile */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Paso 1: Selecciona tu estilo</h2>
              <p className="text-stone-500">Elige una baldosa de nuestro catálogo o sube tu propio diseño.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <label
                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 text-center transition-all cursor-pointer ${
                  selectedTile === 'custom' 
                    ? 'border-stone-900 bg-stone-50 shadow-md' 
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCustomTile({ image: reader.result as string, mimeType: file.type });
                      setSelectedTile('custom');
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {customTile ? (
                  <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden bg-stone-200">
                    <img src={customTile.image} alt="Custom Tile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-2xl mb-3 flex flex-col items-center justify-center bg-stone-100 text-stone-500 border border-stone-200 border-dashed">
                    <Upload className="w-8 h-8 mb-2 text-stone-400" />
                    <span className="text-sm font-medium">Subir Diseño</span>
                  </div>
                )}
                <span className="font-semibold text-stone-900">Personalizado</span>
                {selectedTile === 'custom' && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-[#E3000F] rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </label>

              {TILE_OPTIONS.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => setSelectedTile(tile.id)}
                  className={`relative flex flex-col items-start p-4 rounded-3xl border-2 text-left transition-all ${
                    selectedTile === tile.id 
                      ? 'border-stone-900 bg-stone-50 shadow-md' 
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="w-full aspect-square rounded-2xl mb-3 overflow-hidden bg-stone-200">
                    <img src={tile.image} alt={tile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-semibold text-stone-900 leading-tight">{tile.name}</span>
                  {selectedTile === tile.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#E3000F] rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-auto">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTile}
                className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all ${
                  !selectedTile
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#E3000F] text-white hover:bg-[#C8000D] hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                Siguiente Paso
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Upload Room Image */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Paso 2: Sube la foto de tu espacio</h2>
              <p className="text-stone-500">Sube una foto clara de la habitación que deseas remodelar.</p>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-200 p-8 flex flex-col items-center justify-center mb-8">
              <label className="w-full max-w-2xl aspect-video border-2 border-dashed border-stone-300 rounded-3xl flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden"
                />
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-stone-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Haz clic o arrastra tu foto aquí</h3>
                <p className="text-stone-500 text-center max-w-sm">
                  Formatos soportados: JPG, PNG. Asegúrate de que el piso esté bien iluminado.
                </p>
              </label>
            </div>

            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 text-stone-600 hover:bg-stone-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Select Zone (Masking) */}
        {step === 3 && originalImage && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Paso 3: Selecciona la zona</h2>
              <p className="text-stone-500">Pinta sobre el piso que deseas cambiar. Esto ayuda a la IA a ser más precisa.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-4 mb-6 flex flex-col items-center">
              {/* Toolbar */}
              <div className="flex items-center gap-4 mb-4 bg-stone-100 p-2 rounded-2xl">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`p-3 rounded-xl flex items-center gap-2 transition-colors ${!isEraser ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <PenTool className="w-5 h-5" />
                  Pintar
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`p-3 rounded-xl flex items-center gap-2 transition-colors ${isEraser ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  <Eraser className="w-5 h-5" />
                  Borrar
                </button>
                <div className="w-px h-8 bg-stone-300 mx-2" />
                <div className="flex items-center gap-3 px-2">
                  <span className="text-sm font-medium text-stone-500">Tamaño:</span>
                  <input 
                    type="range" 
                    min="10" max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-24 accent-stone-900"
                  />
                </div>
                <div className="w-px h-8 bg-stone-300 mx-2" />
                <button
                  onClick={clearMask}
                  className="p-3 rounded-xl flex items-center gap-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Limpiar
                </button>
              </div>

              {/* Canvas Container */}
              <div className="relative inline-block rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 select-none touch-none">
                <img 
                  ref={imageRef}
                  src={originalImage} 
                  alt="Original" 
                  className="max-h-[50vh] w-auto object-contain pointer-events-none"
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                  style={{ touchAction: 'none' }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-auto">
              <button
                onClick={() => setStep(2)}
                disabled={isGenerating}
                className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 text-stone-600 hover:bg-stone-200 transition-all disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all ${
                  isGenerating
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    : 'bg-[#E3000F] text-white hover:bg-[#C8000D] hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando magia...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar Simulación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === 4 && generatedImage && originalImage && (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 mb-2">¡Aquí tienes tu nuevo espacio!</h2>
              <p className="text-stone-500">Desliza la barra central para comparar con el original.</p>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-200 p-4 mb-8">
              <ImageResult before={originalImage} after={generatedImage} />
            </div>

            <div className="flex justify-center mt-auto">
              <button
                onClick={resetWizard}
                className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 bg-[#E3000F] text-white hover:bg-[#C8000D] hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Crear otra simulación
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
