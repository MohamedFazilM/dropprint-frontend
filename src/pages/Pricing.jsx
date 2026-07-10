import { useState } from "react";
import { Link } from "react-router-dom";

function Pricing() {
  const baseApparel = [
    { id: "1", name: "Base Tee", desc: "Everyday comfort t-shirt template.", price: 249, tag: "Essential" },
    { id: "2", name: "Heavyweight Oversized Tee", desc: "Premium drop-shoulder fit heavyweight cotton.", price: 349, tag: "Oversized Fit" },
    { id: "3", name: "Luxury Streetwear Tee", desc: "Ultra premium fabric and fit.", price: 449, tag: "Premium" },
  ];

  const printStyles = [
    { id: "text", name: "Text Only", area: "Front/Back", desc: "Simple slogans, names, or numbers.", price: 99 },
    { id: "single", name: "Single Color Print", area: "A4 Size", desc: "Line art, minimalist shapes, or solid logos.", price: 99 },
    { id: "dtf", name: "Full Color (DTF)", area: "A4 Size", desc: "High-res photos, colorful graphics, or gradients.", price: 199 },
    { id: "full", name: "Full Front & Back Print", area: "Full Coverage", desc: "Complete coverage print on both sides.", price: 299 },
  ];

  const faqs = [
    {
      q: "Is there a minimum order quantity (MOQ)?",
      a: "Nope! You can order just one single t-shirt. But if you're ordering for a group or event, bulk discounts start from 6 units."
    },
    {
      q: "How do bulk discounts work?",
      a: "It's automatic! Get 5% off for 6+ tees, 10% off for 20+ tees, 15% off for 50+ tees, and 25% off if you order 100+ tees. The discount is applied to the total cost."
    },
    {
      q: "What file format should I upload for my design?",
      a: "For best results, upload a PNG with a transparent background at 300 DPI. High-quality SVGs work great too! Try to avoid blurry or low-res images."
    },
    {
      q: "What is DTF printing and does it last?",
      a: "DTF stands for Direct-to-Film. Your design is printed onto a special film and then heat-pressed onto the t-shirt. This creates a detailed, stretchable print that won't crack or fade over time."
    },
    {
      q: "How is the pricing calculated in the studio?",
      a: "As you add designs, text, or pockets in the studio, the price updates on your screen in real-time. No surprises at checkout!"
    }
  ];

  const [selectedApparel, setSelectedApparel] = useState(baseApparel[0]);
  const [selectedPrint, setSelectedPrint] = useState(printStyles[2]); // Default to DTF
  const [quantity, setQuantity] = useState(1);
  const [activeFaq, setActiveFaq] = useState(null);

  const getDiscountTier = (qty) => {
    if (qty >= 100) return { pct: 25, label: "25% Bulk Discount Applied!" };
    if (qty >= 50) return { pct: 15, label: "15% Bulk Discount Applied!" };
    if (qty >= 20) return { pct: 10, label: "10% Bulk Discount Applied!" };
    if (qty >= 6) return { pct: 5, label: "5% Bulk Discount Applied!" };
    return { pct: 0, label: "No discount" };
  };

  const discountInfo = getDiscountTier(quantity);
  const baseCostPerUnit = selectedApparel.price;
  const printCostPerUnit = selectedPrint.price;
  const originalCostPerUnit = baseCostPerUnit + printCostPerUnit;

  const discountPct = discountInfo.pct;
  const finalCostPerUnit = Math.round(originalCostPerUnit * (1 - discountPct / 100));

  const totalOriginalPrice = originalCostPerUnit * quantity;
  const totalFinalPrice = finalCostPerUnit * quantity;
  const totalSavings = totalOriginalPrice - totalFinalPrice;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }} className="bg-white min-h-screen">
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeUpReveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUpReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>

      {/* ── HERO HEADER ── */}
      <section className="relative overflow-hidden py-24 px-6 bg-zinc-50 border-b border-zinc-200/50">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#cc0000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-block text-[10px] font-bold tracking-[3px] uppercase text-[#cc0000] mb-3 opacity-0 animate-fade-up">
            OUR PRICING
          </span>
          <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl text-zinc-900 tracking-tight mb-6 opacity-0 animate-fade-up delay-100">
            Simple pricing. <span className="text-[#cc0000]">Huge bulk discounts.</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up delay-200">
            Choose your t-shirt, pick a printing style, and set your quantity. Bulk discounts apply automatically.
          </p>
        </div>
      </section>

      {/* ── CALCULATOR SECTION ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* LEFT: Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-10">

              {/* Step 1: Apparel Type */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-7 h-7 rounded-full bg-red-50 text-[#cc0000] flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="font-extrabold text-lg text-zinc-900 uppercase tracking-wide">Choose Your T-shirt</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baseApparel.map((apparel) => {
                    const isSelected = selectedApparel.id === apparel.id;
                    return (
                      <button
                        key={apparel.id}
                        onClick={() => setSelectedApparel(apparel)}
                        className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 relative group cursor-pointer ${isSelected
                          ? "border-[#cc0000] bg-red-50/10 shadow-[0_4px_20px_rgba(204,0,0,0.04)]"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}
                      >
                        <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          {apparel.tag}
                        </div>
                        <div className="text-[#cc0000] mb-4">
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m3.813-5.096L15 21m-3-5h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-extrabold text-zinc-900 mb-1 text-base">{apparel.name}</h4>
                        <p className="text-xs text-zinc-400 mb-4 font-medium leading-relaxed">{apparel.desc}</p>
                        <div className="font-black text-lg text-zinc-950">₹{apparel.price}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Print Style */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-7 h-7 rounded-full bg-red-50 text-[#cc0000] flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-extrabold text-lg text-zinc-900 uppercase tracking-wide">Choose Print Style</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {printStyles.map((style) => {
                    const isSelected = selectedPrint.id === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedPrint(style)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected
                          ? "border-[#cc0000] bg-red-50/10 shadow-[0_4px_20px_rgba(204,0,0,0.04)]"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            {style.area}
                          </span>
                          <span className="font-extrabold text-[#cc0000] text-sm">+₹{style.price}</span>
                        </div>
                        <h4 className="font-extrabold text-zinc-900 mb-1 text-sm">{style.name}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{style.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Quantity */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-7 h-7 rounded-full bg-red-50 text-[#cc0000] flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-extrabold text-lg text-zinc-900 uppercase tracking-wide">How many do you need?</h3>
                </div>
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Quantity</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Bulk discounts start at 6 units</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 p-2.5 text-center font-extrabold text-zinc-800 border border-zinc-200 rounded-xl focus:border-[#cc0000] focus:ring-0 outline-none bg-white transition-all text-sm"
                    />
                  </div>

                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={quantity > 150 ? 150 : quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#cc0000]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-2 px-1 uppercase tracking-wider">
                      <span>1 Unit</span>
                      <span>20</span>
                      <span>50</span>
                      <span>100</span>
                      <span>150+ units</span>
                    </div>
                  </div>

                  {/* Quantity Shortcuts */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[1, 5, 12, 30, 75, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => setQuantity(val)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${quantity === val
                          ? "bg-[#cc0000] text-white"
                          : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                          }`}
                      >
                        {val === 100 ? "100+ (25% off)" : `${val} ${val === 1 ? "tee" : "tees"}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Estimated Quote Box (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-zinc-950 text-white rounded-3xl p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
                {/* Background neon glow overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#cc0000]/10 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="font-extrabold text-xl tracking-wide mb-6 uppercase text-zinc-300">Estimated Pricing</h3>

                {/* Breakdowns */}
                <div className="space-y-4 text-xs border-b border-zinc-850 pb-6 mb-6 font-medium">
                  <div className="flex justify-between text-zinc-400">
                    <span>{selectedApparel.name}</span>
                    <span className="font-bold text-white">₹{baseCostPerUnit} × {quantity}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>{selectedPrint.name} print</span>
                    <span className="font-bold text-white">₹{printCostPerUnit} × {quantity}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">₹{(originalCostPerUnit * quantity).toLocaleString()}</span>
                  </div>

                  {/* Bulk discount indicator */}
                  {discountPct > 0 && (
                    <div className="flex justify-between text-green-400 bg-green-500/10 px-3.5 py-2.5 rounded-xl border border-green-500/20 font-bold">
                      <span>{discountInfo.label}</span>
                      <span>-{discountPct}%</span>
                    </div>
                  )}
                </div>

                {/* Final Price Estimate */}
                <div className="space-y-3 mb-8">
                  {discountPct > 0 && (
                    <div className="flex justify-between items-center text-zinc-400 text-xs font-semibold">
                      <span>Total Savings</span>
                      <span className="font-bold text-green-400">-₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Estimated Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-white tracking-tight">
                        ₹{totalFinalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-900 pt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span>Price Per Tee</span>
                    <span className="text-white text-xs font-black">₹{finalCostPerUnit} / unit</span>
                  </div>
                </div>

                <Link
                  to="/design-studio"
                  className="w-full flex items-center justify-center gap-2 bg-[#cc0000] hover:bg-[#b30000] text-white py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all duration-300 cursor-pointer"
                >
                  Open Design Studio
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                <p className="text-center text-[10px] text-zinc-500 mt-4 leading-relaxed font-semibold">
                  Taxes and shipping are calculated at checkout. Real-time pricing is shown in the studio.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRINT QUALITY SHOWCASE ── */}
      <section className="py-24 px-6 bg-zinc-50 border-t border-b border-zinc-200/50 relative overflow-hidden">
        {/* Decorative background grids */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#cc0000]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-zinc-900/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#cc0000] text-[9px] font-black uppercase tracking-wider mb-4 border border-red-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000] animate-pulse"></span>
              PRINT QUALITY
            </span>
            <h2 className="font-extrabold text-3xl md:text-4xl text-zinc-900 tracking-tight mb-4">
              How We Print Your Designs
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              We use industry-leading printing methods so your tees look sharp and stay vibrant wash after wash.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Technique 1: DTF */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: "16px",
                padding: "32px 28px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "between",
                overflow: "hidden",
                transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "rgba(204,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#cc0000"
                  }}>
                    <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-black text-[#cc0000] bg-red-50 border border-red-100 rounded-full px-2.5 py-1 uppercase tracking-widest shadow-sm">
                    Vibrancy Focus
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 10px",
                }}>Direct-to-Film (DTF)</h3>
                <p style={{
                  fontSize: "14px",
                  color: "#888",
                  lineHeight: 1.6,
                  margin: "0 0 32px",
                }}>
                  Our most popular print. Perfect for colorful designs, gradients, and high-res photos. The prints are soft, stretchable, and won't crack after washing.
                </p>
              </div>

              <ul style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }} className="space-y-3 border-t border-zinc-150 pt-5">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Vibrant color details</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Long-lasting (no cracking)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Feels premium & soft</span>
                </li>
              </ul>
            </div>

            {/* Technique 2: Single Color Print */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: "16px",
                padding: "32px 28px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "between",
                overflow: "hidden",
                transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#111"
                  }}>
                    <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-black text-zinc-700 bg-zinc-100 border border-zinc-200/60 rounded-full px-2.5 py-1 uppercase tracking-widest shadow-sm">
                    Vector Focus
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 10px",
                }}>Single Color Print</h3>
                <p style={{
                  fontSize: "14px",
                  color: "#888",
                  lineHeight: 1.6,
                  margin: "0 0 32px",
                }}>
                  Great for bold quotes, logos, and clean line art. The ink blends into the t-shirt, giving it a lightweight, screen-print finish.
                </p>
              </div>

              <ul style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }} className="space-y-3 border-t border-zinc-150 pt-5">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Sharp details & crisp lines</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Super long-lasting print</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Feather-light on fabric</span>
                </li>
              </ul>
            </div>

            {/* Technique 3: Text Only */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: "16px",
                padding: "32px 28px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "between",
                overflow: "hidden",
                transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <div style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#111"
                  }}>
                    <svg className="w-6 h-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-.313 3.733-1.78 7.15-4.14 10" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 bg-zinc-50 border border-zinc-150 rounded-full px-2.5 py-1 uppercase tracking-widest shadow-sm">
                    Typography Focus
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 10px",
                }}>Text Only</h3>
                <p style={{
                  fontSize: "14px",
                  color: "#888",
                  lineHeight: 1.6,
                  margin: "0 0 32px",
                }}>
                  Perfect for simple text, quotes, or numbers on the front, back, or sleeves. Quick and budget-friendly.
                </p>
              </div>

              <ul style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }} className="space-y-3 border-t border-zinc-150 pt-5">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Perfect for quotes & jerseys</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Crisp, easily readable text</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[9px] font-black">✓</span>
                  <span>Saves time & money</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#cc0000] text-[10px] font-bold tracking-[3px] uppercase block mb-3">FAQ</span>
            <h2 className="font-extrabold text-3xl md:text-4xl text-zinc-900 tracking-tight">Got questions? We've got answers.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-zinc-200/80 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-zinc-50/30 text-left font-extrabold text-zinc-900 text-sm md:text-base transition-all duration-200 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#cc0000]" : ""}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-zinc-100" : "max-h-0"
                      }`}
                  >
                    <div className="p-6 bg-zinc-550/10 text-xs text-zinc-500 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6 bg-zinc-950 text-white text-center relative overflow-hidden">
        {/* Background glow lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h2 className="font-extrabold text-3xl md:text-4xl tracking-tight">Ready to create your custom tee?</h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-sm mx-auto leading-relaxed font-semibold">
            Open the Design Studio to upload your artwork, add custom text, and order your custom fit.
          </p>
          <div className="pt-4">
            <Link
              to="/design-studio"
              className="inline-flex items-center gap-2.5 bg-white text-zinc-950 hover:bg-zinc-100 py-4 px-8 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all duration-300 hover:scale-[1.01] shadow-xl cursor-pointer"
            >
              Start Designing
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing;