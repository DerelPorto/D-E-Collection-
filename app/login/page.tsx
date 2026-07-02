"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Key, Mail, Lock, User, AlertCircle, Check, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Status states
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Read error query parameters if any (e.g. from dashboard redirect)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'unauthorized') {
            setErrorMsg("Acceso denegado: Su usuario no está activo o sus credenciales cambiaron.");
        } else if (params.get('error') === 'error') {
            setErrorMsg("Ocurrió un error inesperado al verificar su sesión.");
        }
    }, []);

    // Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email || !password) {
            setErrorMsg("Por favor, rellene todos los campos.");
            return;
        }

        setLoading(true);
        try {
            // Verify user exists in public.User table with matching email and password
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .eq('is_active', true)
                .single();

            if (userError || !userData) {
                setErrorMsg("Credenciales incorrectas o usuario no activo.");
                setLoading(false);
                return;
            }

            // Save user data to localStorage
            localStorage.setItem('jarvis_admin_user', JSON.stringify(userData));

            setSuccessMsg("¡Sesión iniciada correctamente! Redirigiendo...");
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);

        } catch (err: any) {
            setErrorMsg(err.message || "Error al conectar con el servidor.");
            setLoading(false);
        }
    };

    // Handle Registration (Invited Admin Password Setup)
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email || !password || !confirmPassword) {
            setErrorMsg("Por favor, rellene todos los campos.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 4) {
            setErrorMsg("La contraseña debe tener al menos 4 caracteres.");
            return;
        }

        setLoading(true);
        try {
            // Verify if email exists in public.User table
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();

            if (userError || !userData) {
                setErrorMsg("Este correo electrónico no está autorizado como administrador de ningún Tenant. Contacte al propietario del negocio.");
                setLoading(false);
                return;
            }

            // Set the password directly on the User row
            const { error: updateError } = await supabase
                .from('User')
                .update({ password: password })
                .eq('id', userData.id);

            if (updateError) {
                setErrorMsg(`Error al configurar contraseña: ${updateError.message}`);
                setLoading(false);
                return;
            }

            setSuccessMsg("¡Contraseña configurada con éxito! Ya puede iniciar sesión.");
            setIsRegistering(false);
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setErrorMsg(err.message || "Error de red al registrar el acceso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060606] text-neutral-100 flex items-center justify-center font-sans px-4 selection:bg-amber-500 selection:text-neutral-950">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="w-full max-w-md">
                {/* Logo and title */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-4"
                    >
                        <Bot className="w-7 h-7 text-neutral-950 stroke-[2]" />
                    </motion.div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-transparent bg-clip-text">
                        J.A.R.V.I.S. Portal
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1 font-medium tracking-wide">
                        CONSOLA DE ADMINISTRACIÓN MULTI-INQUILINO (DB AUTH)
                    </p>
                </div>

                {/* Login/Signup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-900 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    {/* Visual Gold glow border */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

                    <AnimatePresence mode="wait">
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-3"
                            >
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </motion.div>
                        )}

                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 text-xs flex items-start gap-3"
                            >
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{successMsg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-neutral-400 tracking-wider block mb-2">
                                CORREO ELECTRÓNICO
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@comercio.com"
                                    className="w-full bg-neutral-950/60 border border-neutral-850 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 outline-none transition-all placeholder:text-neutral-600"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-neutral-400 tracking-wider block mb-2">
                                CONTRASEÑA
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-950/60 border border-neutral-850 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 outline-none transition-all placeholder:text-neutral-600"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {isRegistering && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-400 tracking-wider block mb-2">
                                        CONFIRMAR CONTRASEÑA
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-neutral-950/60 border border-neutral-850 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 outline-none transition-all placeholder:text-neutral-600"
                                            required={isRegistering}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-3 px-4 rounded-xl text-xs tracking-wider transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 mt-6"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isRegistering ? (
                                "CONFIGURAR CONTRASEÑA"
                            ) : (
                                "ACCEDER A LA CONSOLA"
                            )}
                        </button>
                    </form>

                    {/* Toggle login/register */}
                    <div className="mt-8 text-center border-t border-neutral-900 pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setErrorMsg(null);
                                setSuccessMsg(null);
                            }}
                            className="text-[11px] font-bold text-amber-500/80 hover:text-amber-400 tracking-wider transition-colors cursor-pointer outline-none uppercase"
                        >
                            {isRegistering ? "¿Ya tienes una cuenta? Iniciar Sesión" : "¿Primer inicio de sesión? Registrar contraseña"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
