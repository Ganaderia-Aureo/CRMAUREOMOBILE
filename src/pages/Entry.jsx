
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

export default function Entry() {
    const navigate = useNavigate()

    // Sticky State (initialized from localStorage)
    const [clientId, setClientId] = useState(() => localStorage.getItem('last_client_id') || '')
    const [entryDate, setEntryDate] = useState(() => localStorage.getItem('last_entry_date') || new Date().toISOString().split('T')[0])

    // Animal Form State
    const [birthDate, setBirthDate] = useState('')
    const [crotal, setCrotal] = useState('')

    // Data State
    const [clients, setClients] = useState([])
    const [recentAnimals, setRecentAnimals] = useState([])
    const [saving, setSaving] = useState(false)

    // Scanner State
    const [isScanning, setIsScanning] = useState(false)
    const scannerRef = useRef(null)

    useEffect(() => {
        fetchClients()
    }, [])

    useEffect(() => {
        localStorage.setItem('last_client_id', clientId)
    }, [clientId])

    useEffect(() => {
        localStorage.setItem('last_entry_date', entryDate)
    }, [entryDate])

    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select('id, fiscal_name, initials').is('deleted_at', null).order('fiscal_name')
        if (data) setClients(data)
        if (error) console.error('Error fetching clients:', error)
    }

    const startScanner = async () => {
        setIsScanning(true)
        // Delay longer on iOS Safari where DOM paint is slower
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader", {
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
                toast.error("No se pudo acceder a la cámara. Asegúrate de dar permisos en el navegador y usar HTTPS.");
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
            } catch (error) {
                console.error("Failed to stop scanner: ", error);
            }
            scannerRef.current = null;
        }
        setIsScanning(false)
    }

    const onScanSuccess = (decodedText, decodedResult) => {
        // Handle the scanned code as you like, for example:
        console.log(`Code matched = ${decodedText}`, decodedResult);
        setCrotal(decodedText)
        stopScanner()
    }

    const onScanFailure = (_) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    const handleSave = async () => {
        if (!clientId || !crotal || !entryDate) {
            toast.error("Faltan datos obligatorios (Cliente, Crotal o Fecha Entrada)")
            return
        }

        setSaving(true)
        try {
            // Verificar si ya existe un animal activo con este crotal
            const { data: existing } = await supabase
                .from('animals')
                .select('id, crotal')
                .eq('crotal', crotal.trim())
                .eq('status', 'ACTIVE')
                .is('deleted_at', null)
                .limit(1)

            if (existing && existing.length > 0) {
                toast.error(`Ya existe un animal activo con el crotal "${crotal}". No se puede duplicar.`)
                setSaving(false)
                return
            }

            const { data, error } = await supabase
                .from('animals')
                .insert([
                    {
                        client_id: clientId,
                        crotal: crotal.trim(),
                        entry_date: entryDate,
                        birth_date: birthDate || null,
                        status: 'ACTIVE'
                    }
                ])
                .select()

            if (error) throw error

            // Add to recent list
            const newAnimal = data[0]
            // Find client name for display
            const clientName = clients.find(c => c.id === clientId)?.fiscal_name || "Cliente Desconocido"

            setRecentAnimals(prev => [{ ...newAnimal, client_name: clientName }, ...prev].slice(0, 3))

            // Clear per-animal fields only
            setCrotal('')
            setBirthDate('')
            // Keep entryDate and clientId

            // Feedback (Vibration if available)
            if (navigator.vibrate) navigator.vibrate(200);

        } catch (error) {
            console.error("Error saving animal:", error)
            toast.error("Error al guardar: " + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#111813] shadow-xl relative">
            {/* TopNavBar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f4f1] dark:border-[#1d2d21] px-6 py-4 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="text-[#111813] dark:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#111813] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Alta Rápida</h2>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-32">
                {/* SectionHeader: Configuración del Lote */}
                <div className="mt-4">
                    <h3 className="text-[#111813] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-6 pb-3">Configuración del Lote</h3>
                    <div className="px-6 space-y-4">

                        {/* TextField: Cliente */}
                        <label className="flex flex-col w-full">
                            <span className="text-[#111813] dark:text-white text-sm font-semibold pb-2">Cliente</span>
                            <div className="relative">
                                <select
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="appearance-none flex w-full rounded-lg text-[#111813] dark:text-white border border-[#dbe6de] dark:border-[#2d3d31] bg-white dark:bg-[#1d2d21] h-14 px-4 text-base font-normal focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                >
                                    <option value="" disabled>Seleccionar Cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.fiscal_name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>

                        {/* TextField: Fecha de Alta */}
                        <label className="flex flex-col w-full">
                            <span className="text-[#111813] dark:text-white text-sm font-semibold pb-2">Fecha de Alta</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={entryDate}
                                    onChange={(e) => setEntryDate(e.target.value)}
                                    className="flex w-full rounded-lg text-[#111813] dark:text-white border border-[#dbe6de] dark:border-[#2d3d31] bg-white dark:bg-[#1d2d21] h-14 px-4 text-base font-normal focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </label>
                    </div>
                </div>

                <div className="h-px bg-[#f0f4f1] dark:bg-[#1d2d21] mx-6 my-8"></div>

                {/* SectionHeader: Datos del Animal */}
                <div>
                    <h3 className="text-[#111813] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-6 pb-3">Datos del Animal</h3>
                    <div className="px-6 space-y-4">
                        {/* TextField: Fecha de Nacimiento */}
                        <label className="flex flex-col w-full">
                            <span className="text-[#111813] dark:text-white text-sm font-semibold pb-2">Fecha de Nacimiento (Opcional)</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="flex w-full rounded-lg text-[#111813] dark:text-white border border-[#dbe6de] dark:border-[#2d3d31] bg-white dark:bg-[#1d2d21] h-14 px-4 text-base font-normal focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </label>

                        {/* SCAN and Crotal Group */}
                        <div className="flex flex-col w-full gap-2">
                            <span className="text-[#111813] dark:text-white text-sm font-semibold">Crotal / Identificación</span>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={crotal}
                                        onChange={(e) => setCrotal(e.target.value)}
                                        className="flex w-full rounded-lg text-[#111813] dark:text-white border border-[#dbe6de] dark:border-[#2d3d31] bg-white dark:bg-[#1d2d21] h-16 px-4 text-xl font-bold tracking-wider placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                        placeholder="Ej: ES0123456789"
                                        inputMode="text"
                                    />
                                </div>
                                <button
                                    onClick={startScanner}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-lg shadow-primary/20 aspect-square"
                                >
                                    <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">SCAN</span>
                                </button>
                            </div>
                        </div>

                        {/* Scanner Container Area */}
                        {isScanning && (
                            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
                                <div id="reader" className="w-full max-w-sm bg-white rounded-xl min-h-[300px]">
                                    <p className="text-gray-500 animate-pulse text-center pt-8">Iniciando cámara...</p>
                                </div>
                                <button
                                    onClick={stopScanner}
                                    className="mt-4 bg-white text-black px-6 py-3 rounded-full font-bold"
                                >
                                    Cerrar Escáner
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Últimos 3 Animales Feed */}
                <div className="mt-8 px-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recientes (Sesión)</h4>
                    </div>
                    <div className="space-y-2">
                        {recentAnimals.map((animal, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#f6f8f6] dark:bg-[#16251a] border border-transparent hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#111813] dark:text-white">{animal.crotal}</p>
                                        <p className="text-[10px] text-gray-500">{animal.client_name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentAnimals.length === 0 && <p className="text-gray-400 text-sm italic">No hay animales guardados en esta sesión.</p>}
                    </div>
                </div>
            </main>

            {/* Floating Action Button Area */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-gradient-to-t from-white dark:from-[#111813] via-white/90 dark:via-[#111813]/90 to-transparent">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-[#0eab35] hover:bg-[#0c942d] text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-green-900/40 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? 'Guardando...' : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            GUARDAR ANIMAL
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
