
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ activeAnimals: 0, todayEntries: 0, todayExits: 0 })

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            const today = new Date().toISOString().split('T')[0]

            const { count: activeAnimals } = await supabase
                .from('animals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'ACTIVE')
                .is('deleted_at', null)

            const { count: todayEntries } = await supabase
                .from('animals')
                .select('*', { count: 'exact', head: true })
                .eq('entry_date', today)
                .is('deleted_at', null)

            const { count: todayExits } = await supabase
                .from('animals')
                .select('*', { count: 'exact', head: true })
                .eq('exit_date', today)
                .is('deleted_at', null)

            setStats({
                activeAnimals: activeAnimals || 0,
                todayEntries: todayEntries || 0,
                todayExits: todayExits || 0,
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <div className="mobile-container flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden relative">
            {/* Header Component */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f0f4f1] dark:border-white/10 bg-white dark:bg-[#1a2e1f] px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-3 text-[#111813] dark:text-white">
                    <div className="size-8 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h1 className="text-xl font-extrabold leading-tight tracking-tight">Ganadería Áureo</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-xl size-10 bg-[#f0f4f1] dark:bg-white/10 text-[#111813] dark:text-white transition-active active:scale-95"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white dark:bg-[#1a2e1f] border-b border-[#f0f4f1] dark:border-white/10">
                <div className="text-center">
                    <p className="text-2xl font-extrabold text-primary">{stats.activeAnimals}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Activos</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-extrabold text-green-600">{stats.todayEntries}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Altas Hoy</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-extrabold text-red-500">{stats.todayExits}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Bajas Hoy</p>
                </div>
            </div>

            {/* Main Content (Fat Finger Buttons) */}
            <main className="flex-1 flex flex-col justify-center gap-6 p-6">
                {/* Entrada (Alta) Button */}
                <button
                    onClick={() => navigate('/entry')}
                    className="flex flex-col items-center justify-center gap-4 flex-1 min-h-[160px] bg-primary hover:bg-[#0eb83a] text-[#111813] rounded-2xl shadow-lg active:scale-95 transition-transform duration-75"
                >
                    <span className="material-symbols-outlined text-5xl font-bold">download</span>
                    <div className="text-center">
                        <span className="block text-2xl font-extrabold tracking-wider uppercase">ENTRADA</span>
                        <span className="block text-sm font-semibold opacity-80 uppercase">(ALTA DE ANIMAL)</span>
                    </div>
                </button>

                {/* Salida (Baja) Button */}
                <button
                    onClick={() => navigate('/exit')}
                    className="flex flex-col items-center justify-center gap-4 flex-1 min-h-[160px] bg-[#ff4d4d] hover:bg-[#e64545] text-white rounded-2xl shadow-lg active:scale-95 transition-transform duration-75"
                >
                    <span className="material-symbols-outlined text-5xl font-bold">upload</span>
                    <div className="text-center">
                        <span className="block text-2xl font-extrabold tracking-wider uppercase">SALIDA</span>
                        <span className="block text-sm font-semibold opacity-80 uppercase">(BAJA / TRASLADO)</span>
                    </div>
                </button>
            </main>

            {/* MetaText / Footer Component */}
            <footer className="p-6 mt-auto">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-[#61896b] dark:text-[#a3c9ad] text-sm font-medium">
                        <span className="material-symbols-outlined text-base">sync</span>
                        <p>Sincronizado</p>
                    </div>
                    <p className="text-[#61896b] dark:text-[#a3c9ad]/50 text-xs font-normal opacity-70">
                        V 2.5.0 • Mobile Web
                    </p>
                </div>
            </footer>

            {/* Bottom Safe Area Spacer (for mobile notch/home bars) */}
            <div className="h-4"></div>
        </div>
    )
}
