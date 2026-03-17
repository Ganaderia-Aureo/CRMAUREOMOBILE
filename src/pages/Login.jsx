import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            navigate('/')
        } catch (error) {
            console.error("Login Error:", error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111813] dark:text-white min-h-screen flex items-center justify-center p-4">
            {/* Mobile Container Simulation for Desktop */}
            <div className="w-full max-w-[440px] bg-white dark:bg-[#1a2e20] shadow-2xl rounded-xl overflow-hidden flex flex-col min-h-[800px] border border-[#dbe6df] dark:border-[#2a3f30]">

                {/* Header / Logo Section */}
                <div className="pt-16 pb-12 flex flex-col items-center px-10">
                    <img src="/logo.png" alt="Ganadería Áureo" className="size-28 mb-6 object-contain" />
                    <h1 className="text-3xl font-bold tracking-tight text-center">Ganadería Áureo</h1>
                    <p className="text-[#608a6e] mt-2 text-lg">Acceso para Campo</p>
                </div>

                {/* Form Section */}
                <div className="px-8 flex-1 flex flex-col gap-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="flex flex-col w-full">
                        <label className="flex flex-col w-full">
                            <p className="text-[#111813] dark:text-gray-200 text-lg font-semibold leading-normal pb-3">Correo Electrónico</p>
                            <input
                                type="email"
                                className="form-input fat-finger-input flex w-full rounded-xl text-[#111813] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-2 border-[#dbe6df] dark:border-[#2a3f30] bg-white dark:bg-[#102216] h-16 placeholder:text-[#608a6e] px-5 text-xl font-normal"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col w-full">
                        <label className="flex flex-col w-full">
                            <p className="text-[#111813] dark:text-gray-200 text-lg font-semibold leading-normal pb-3">Contraseña</p>
                            <div className="flex w-full items-stretch relative">
                                <input
                                    type="password"
                                    className="form-input fat-finger-input flex w-full rounded-xl text-[#111813] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-2 border-[#dbe6df] dark:border-[#2a3f30] bg-white dark:bg-[#102216] h-16 placeholder:text-[#608a6e] px-5 pr-14 text-xl font-normal"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#608a6e] flex items-center justify-center p-2">
                                    <span className="material-symbols-outlined text-3xl">visibility</span>
                                </button>
                            </div>
                        </label>
                    </div>

                    {/* Recordarme (Fat Finger Checkbox) */}
                    <div className="py-2">
                        <label className="flex items-center gap-x-4 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input type="checkbox" className="fat-finger-checkbox rounded-lg border-[#dbe6df] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none transition-colors" />
                            </div>
                            <p className="text-[#111813] dark:text-gray-200 text-xl font-medium select-none">Recordarme</p>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full h-16 bg-primary text-white rounded-xl text-2xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-spin material-symbols-outlined text-3xl">progress_activity</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-3xl">login</span>
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 mt-auto flex flex-col items-center gap-4">
                    <a href="#" className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                        ¿Olvidaste tu contraseña?
                    </a>
                    <div className="mt-4 pt-6 border-t border-[#f0f5f1] dark:border-[#2a3f30] w-full text-center">
                        <p className="text-[#608a6e] text-sm font-medium">Versión PWA 2.4.0 - Ganadería Áureo</p>
                    </div>
                </div>

                {/* Decorative Image Context (Visual Aid) */}
                <div className="px-8 pb-8">
                    <div className="w-full h-24 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent z-10"></div>
                        {/* Using a placeholder color since I don't have the image file, but keeping the structure */}
                        <div className="w-full h-full bg-[#102216] bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1545465961-d0db3b3c3c3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")' }}>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
