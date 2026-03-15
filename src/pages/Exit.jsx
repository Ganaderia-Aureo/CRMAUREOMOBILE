
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

export default function Exit() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [animal, setAnimal] = useState(null)
    const [confirming, setConfirming] = useState(false)

    // Scanner
    const [isScanning, setIsScanning] = useState(false)
    const scannerRef = useRef(null)

    const handleSearch = async (term) => {
        if (!term) return
        setAnimal(null)
        try {
            // Search by partial suffix match on Crotal or exact match
            // Since Supabase ILIKE with wildcards can be tricky without %
            const { data, error } = await supabase
                .from('animals')
                .select(`
                *,
                clients (fiscal_name)
            `)
                .ilike('crotal', `%${term}`)
                .eq('status', 'ACTIVE')
                .is('deleted_at', null)
                .limit(1)

            if (error) throw error
            if (data && data.length > 0) {
                setAnimal(data[0])
            } else {
                toast.error("No se encontró ningún animal activo con ese crotal.")
            }
        } catch (error) {
            console.error("Error searching:", error)
            toast.error(error.message)
        }
    }

    const handleConfirmExit = async () => {
        if (!animal) return
        setConfirming(true)
        try {
            const { error } = await supabase
                .from('animals')
                .update({
                    exit_date: new Date().toISOString().split('T')[0],
                    status: 'SOLD'
                })
                .eq('id', animal.id)

            if (error) throw error

            toast.success("Baja realizada correctamente.")
            setAnimal(null)
            setSearch('')
        } catch (error) {
            console.error("Error processing exit:", error)
            toast.error("Error al dar de baja: " + error.message)
        } finally {
            setConfirming(false)
        }
    }

    const startScanner = async () => {
        setIsScanning(true)
        // Delay longer on iOS Safari where DOM paint is slower
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader-exit", {
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE,
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.ITF,
                    ],
                    experimentalFeatures: { useBarCodeDetectorIfSupported: true },
                    verbose: false,
                });
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 300, height: 120 },
                    aspectRatio: 1.7777778,
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanFailure
                );
            } catch (err) {
                console.error("Error starting camera:", err);
                toast.error("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
                setIsScanning(false);
            }
        }, 500)
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
            scannerRef.current = null;
        }
        setIsScanning(false)
    }

    const onScanSuccess = (decodedText) => {
        setSearch(decodedText)
        stopScanner()
        handleSearch(decodedText)
    }

    const onScanFailure = (_) => { }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="text-[#181111] dark:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-tight">Baja Rápida</h1>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full px-4 pb-32">
                {/* Page Title */}
                <div className="pt-6 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Identifique al animal para procesar su salida.</p>
                </div>

                {/* Search Section */}
                <section className="py-4 space-y-4">
                    <div className="relative">
                        <label className="flex flex-col w-full h-14">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="text-gray-400 flex bg-white dark:bg-gray-900 items-center justify-center pl-4">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 border-none bg-white dark:bg-gray-900 text-[#181111] dark:text-white focus:ring-0 h-full placeholder:text-gray-400 px-3 text-lg font-medium"
                                    inputMode="numeric"
                                    placeholder="Últimos dígitos del Crotal"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
                                />
                                <button onClick={() => handleSearch(search)} className="bg-primary text-white px-4 font-bold">
                                    BUSCAR
                                </button>
                            </div>
                        </label>
                    </div>

                    {/* Scan Button */}
                    <button
                        onClick={startScanner}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-orange-500 text-white gap-3 shadow-lg active:scale-[0.98] transition-transform"
                    >
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        <span className="text-base font-bold tracking-wide uppercase">Escanear para Baja</span>
                    </button>
                </section>

                {/* Scanner Overlay */}
                {isScanning && (
                    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
                        <div id="reader-exit" className="w-full max-w-sm bg-white rounded-xl min-h-[300px]">
                            <p className="text-gray-500 animate-pulse text-center pt-8">Iniciando cámara...</p>
                        </div>
                        <button onClick={stopScanner} className="mt-4 bg-white text-black px-6 py-3 rounded-full font-bold">Cancelar</button>
                    </div>
                )}

                {/* Search Result (Computed) */}
                {animal && (
                    <section className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-[#181111] dark:text-white text-xs font-bold uppercase tracking-widest px-1 pb-3">Animal Identificado</h3>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="size-20 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-400">pets</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded w-fit uppercase mb-1">{animal.status}</span>
                                    <p className="text-[#181111] dark:text-white text-xl font-extrabold leading-tight break-all">{animal.crotal}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Cliente</p>
                                    <p className="text-[#181111] dark:text-gray-200 text-sm font-semibold">{animal.clients?.fiscal_name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Fecha Entrada</p>
                                    <p className="text-[#181111] dark:text-gray-200 text-sm font-semibold">{animal.entry_date}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Bottom Action Area */}
            {animal && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 max-w-md mx-auto w-full">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirmExit}
                            disabled={confirming}
                            className="w-full bg-red-600 hover:bg-red-700 text-white h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
                        >
                            {confirming ? 'Procesando...' : (
                                <>
                                    <span className="material-symbols-outlined">delete_forever</span>
                                    CONFIRMAR BAJA
                                </>
                            )}
                        </button>
                        <button onClick={() => setAnimal(null)} className="text-gray-500 font-medium py-2">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    )
}
