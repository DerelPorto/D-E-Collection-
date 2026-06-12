"use client";

import React, { useState, useEffect } from 'react';
import { supabase, getProxyImageUrl } from '../lib/supabase';
import {
    LayoutDashboard,
    Package,
    Settings,
    Users,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Bot,
    QrCode,
    Plus,
    Trash2,
    Check,
    RefreshCw,
    Sliders,
    AlertCircle,
    UserCheck,
    Calendar,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces para tipado estricto
interface Tenant {
    id: string;
    name: string;
    admin_phone: string;
    telegram_token: string | null;
    telegram_subscribers: string | null;
    is_active: boolean;
}

interface Product {
    id: number;
    title: string;
    price: number;
    stock: number;
    description: string | null;
    is_active: boolean;
    tenant_id: string;
    Images?: { image_url: string }[] | null;
}

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
    User?: {
        name: string;
        phone: string;
    } | null;
}

export default function Dashboard() {
    // --- 📊 ESTADOS DEL SISTEMA ---
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalClientsCount, setTotalClientsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [pendingStocks, setPendingStocks] = useState<Record<number, number>>({});

    // Ajustes del formulario
    const [botName, setBotName] = useState('');
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramSubscribers, setTelegramSubscribers] = useState('');
    const [adminPhone, setAdminPhone] = useState('');

    // Estado del nuevo producto
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProdTitle, setNewProdTitle] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');
    const [newProdStock, setNewProdStock] = useState('');
    const [newProdDesc, setNewProdDesc] = useState('');
    const [newProdImage, setNewProdImage] = useState<File | null>(null);
    const [newProdImagePreview, setNewProdImagePreview] = useState<string | null>(null);

    // Categorías desde Supabase
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

    // Feedback visual (Toasts locales)
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Estado del QR de WhatsApp
    const [qrConnected, setQrConnected] = useState(false);
    const [qrGenerating, setQrGenerating] = useState(false);

    // --- 🔔 DISPARADOR DE NOTIFICACIONES TOAST ---
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // --- 🔄 CARGADORES DE DATOS Y TIEMPO REAL ---
    useEffect(() => {
        cargarTodo();

        let channelProducts: any;
        let channelRequests: any;

        const setupRealtime = async () => {
            const { data: tenantData } = await supabase
                .from('Tenants')
                .select('id')
                .eq('name', 'D&E Collection')
                .limit(1)
                .single();

            if (!tenantData) return;
            const tenantId = tenantData.id;

            channelProducts = supabase
                .channel('realtime-products')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'Products'
                    },
                    (payload: any) => {
                        // Filtrado del lado del cliente por Tenant
                        const item = payload.new || payload.old;
                        if (item && item.tenant_id !== tenantId) return;

                        console.log('⚡ Evento en Products recibido en vivo:', payload);
                        if (payload.eventType === 'INSERT') {
                            showToast(`🤖 J.A.R.V.I.S. ha publicado un nuevo producto: "${payload.new.title}"`, 'success');
                        } else if (payload.eventType === 'UPDATE') {
                            showToast(`📦 Inventario de "${payload.new.title}" actualizado.`, 'success');
                        } else if (payload.eventType === 'DELETE') {
                            showToast(`🗑️ Producto removido del catálogo.`, 'success');
                        }
                        cargarTodo();
                    }
                )
                .subscribe();

            channelRequests = supabase
                .channel('realtime-requests')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'Request'
                    },
                    (payload: any) => {
                        // Filtrado del lado del cliente por Tenant
                        const item = payload.new || payload.old;
                        if (item && item.tenant_id !== tenantId) return;

                        console.log('⚡ Evento en Request recibido en vivo:', payload);
                        if (payload.eventType === 'INSERT') {
                            showToast(`🔔 J.A.R.V.I.S. ha captado un nuevo pedido por RD$${payload.new.total}`, 'success');
                        } else if (payload.eventType === 'UPDATE') {
                            showToast(`⚖️ Pedido #${payload.new.id} actualizado a "${payload.new.status}".`, 'success');
                        }
                        cargarTodo();
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (channelProducts) supabase.removeChannel(channelProducts);
            if (channelRequests) supabase.removeChannel(channelRequests);
        };
    }, []);

    const cargarTodo = async () => {
        setLoading(true);
        try {
            // 1. Obtener inquilino por defecto 'D&E Collection'
            const { data: tenantData, error: errTenant } = await supabase
                .from('Tenants')
                .select('*')
                .eq('name', 'D&E Collection')
                .limit(1)
                .single();

            if (errTenant || !tenantData) {
                console.error("Error cargando tenant:", errTenant?.message);
                showToast("No se pudo cargar la configuración del Tenant.", "error");
                setLoading(false);
                return;
            }

            setTenant(tenantData);
            setBotName(tenantData.name);
            setTelegramToken(tenantData.telegram_token || '');
            setTelegramSubscribers(tenantData.telegram_subscribers || '');
            setAdminPhone(tenantData.admin_phone || '');

            const tenantId = tenantData.id;

            // 2. Cargar productos vinculados a este Tenant
            const { data: prodData } = await supabase
                .from('Products')
                .select('*, Images(image_url)')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });

            setProducts(prodData || []);

            // 3. Cargar solicitudes/órdenes (Request) con información del cliente
            const { data: reqData } = await supabase
                .from('Request')
                .select(`
                    id,
                    total,
                    status,
                    created_at,
                    User:user_id ( name, phone )
                `)
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });

            const formattedRequests: Order[] = (reqData || []).map((r: any) => ({
                id: r.id,
                total: r.total,
                status: r.status,
                created_at: r.created_at,
                User: r.User ? { name: r.User.name, phone: r.User.phone } : null
            }));

            setOrders(formattedRequests);

            // Calcular ingresos totales sumando órdenes
            const totalSum = formattedRequests.reduce((sum, o) => sum + o.total, 0);
            setTotalRevenue(totalSum);

            // 4. Contar clientes registrados por la IA
            const { count: clientsCount } = await supabase
                .from('User')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId);

            setTotalClientsCount(clientsCount || 0);

            // 5. Cargar categorías de productos
            const { data: catData } = await supabase
                .from('Categories')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            const fetchedCats = catData || [];
            setCategories(fetchedCats);
            if (fetchedCats.length > 0) {
                setSelectedCategoryId(fetchedCats[0].id);
            }

        } catch (e) {
            console.error("Excepción en cargador global:", e);
            showToast("Ocurrió un error al sincronizar con Supabase.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- 💾 ACCIÓN: GUARDAR AJUSTES DE INQUILINO ---
    const guardarAjustes = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setSavingSettings(true);
        try {
            const { error } = await supabase
                .from('Tenants')
                .update({
                    name: botName,
                    telegram_token: telegramToken || null,
                    telegram_subscribers: telegramSubscribers || null,
                    admin_phone: adminPhone
                })
                .eq('id', tenant.id);

            if (error) {
                showToast(`Error al guardar: ${error.message}`, "error");
            } else {
                showToast("¡Configuración del bot guardada y sincronizada en tiempo real!");
                // Sincronizar estado del bot local
                setTenant(prev => prev ? {
                    ...prev,
                    name: botName,
                    telegram_token: telegramToken,
                    telegram_subscribers: telegramSubscribers,
                    admin_phone: adminPhone
                } : null);
            }
        } catch (err) {
            showToast("No se pudo conectar con Supabase.", "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const cambiarStockPendiente = (id: number, delta: number) => {
        const prod = products.find(p => p.id === id);
        if (!prod) return;
        const currentStock = pendingStocks[id] !== undefined ? pendingStocks[id] : prod.stock;
        const newStock = currentStock + delta;
        if (newStock < 0) {
            showToast("No se puede dejar stock negativo.", "error");
            return;
        }
        setPendingStocks(prev => ({
            ...prev,
            [id]: newStock
        }));
    };

    const cancelarCambioStock = (id: number) => {
        setPendingStocks(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const guardarStock = async (id: number) => {
        const newStock = pendingStocks[id];
        if (newStock === undefined) return;

        setActionLoading(`stock_${id}`);
        try {
            const { error } = await supabase
                .from('Products')
                .update({ stock: newStock })
                .eq('id', id);

            if (error) {
                showToast(`Error actualizando stock: ${error.message}`, "error");
            } else {
                setProducts(prev =>
                    prev.map(p =>
                        p.id === id ? { ...p, stock: newStock } : p
                    )
                );
                setPendingStocks(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                showToast("Stock actualizado con éxito.");
            }
        } catch (err) {
            showToast("Error de red.", "error");
        } finally {
            setActionLoading(null);
        }
    };



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewProdImage(file);
            setNewProdImagePreview(URL.createObjectURL(file));
        }
    };

    // --- 📦 ACCIÓN: CRUD PRODUCTOS ---
    const agregarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant || !newProdTitle || !newProdPrice || !newProdStock) return;
        if (!selectedCategoryId) {
            showToast("Por favor, seleccione una categoría para el producto.", "error");
            return;
        }

        setActionLoading('add_product');
        try {
            let imageUrl = '';
            if (newProdImage) {
                const fileExt = newProdImage.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products-images')
                    .upload(filePath, newProdImage);

                if (uploadError) {
                    console.error("Error al subir imagen:", uploadError.message);
                    showToast("Error subiendo la imagen.", "error");
                    setActionLoading(null);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('products-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;
            }

            const { data: prodData, error: prodError } = await supabase
                .from('Products')
                .insert([{
                    title: newProdTitle,
                    price: parseFloat(newProdPrice),
                    stock: parseInt(newProdStock),
                    description: newProdDesc || null,
                    category_id: Number(selectedCategoryId),
                    is_active: true,
                    tenant_id: tenant.id
                }])
                .select()
                .single();

            if (prodError) {
                showToast(`Error insertando producto: ${prodError.message}`, "error");
            } else {
                if (imageUrl && prodData) {
                    const { error: imgError } = await supabase
                        .from('Images')
                        .insert([{
                            product_id: prodData.id,
                            image_url: imageUrl,
                            order: 1,
                            is_active: true
                        }]);

                    if (imgError) {
                        console.error("Error guardando imagen en DB:", imgError.message);
                        showToast("Producto creado, pero falló asociar la imagen.", "error");
                    } else {
                        prodData.Images = [{ image_url: imageUrl }];
                    }
                }

                showToast(`"${newProdTitle}" agregado con éxito al catálogo.`);
                setProducts(prev => [prodData, ...prev]);
                // Limpiar formulario
                setNewProdTitle('');
                setNewProdPrice('');
                setNewProdStock('');
                setNewProdDesc('');
                setNewProdImage(null);
                setNewProdImagePreview(null);
                setShowAddForm(false);
            }
        } catch (err) {
            showToast("Error de red creando producto.", "error");
        } finally {
            setActionLoading(null);
        }
    };



    const eliminarProducto = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este producto? Se borrará de forma permanente.")) return;

        setActionLoading(`delete_${id}`);
        try {
            const { error } = await supabase
                .from('Products')
                .delete()
                .eq('id', id)
                .eq('tenant_id', tenant?.id);

            if (error) {
                showToast("No se pudo eliminar el producto.", "error");
            } else {
                setProducts(prev => prev.filter(p => p.id !== id));
                showToast("Producto eliminado del catálogo.");
            }
        } catch (err) {
            showToast("Error de red al borrar producto.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // --- 📱 ACCIÓN: GENERAR QR (MOCKUP) ---
    const simularQR = () => {
        if (qrConnected) {
            setQrConnected(false);
            showToast("Conexión de WhatsApp desconectada.");
            return;
        }

        setQrGenerating(true);
        setTimeout(() => {
            setQrGenerating(false);
            setQrConnected(true);
            showToast("¡WhatsApp unificado con éxito! Estado: Sincronizado.");
        }, 3000);
    };

    // --- 📊 CALCULAR VENTAS SEMANALES EN VIVO ---
    const obtenerDatosSemanales = () => {
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const ventasPorDia: Record<string, number> = {
            'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0
        };

        // Agrupar y sumar el total de órdenes por día de la semana
        orders.forEach(order => {
            if (!order.created_at) return;
            const date = new Date(order.created_at);
            const nombreDia = diasSemana[date.getDay()];
            if (ventasPorDia[nombreDia] !== undefined) {
                ventasPorDia[nombreDia] += order.total;
            }
        });

        // Encontrar valor máximo para escalar la altura de las barras
        const maxVenta = Math.max(...Object.values(ventasPorDia), 1);
        const ordenDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        const hoyIdx = new Date().getDay();
        const hoyNombre = diasSemana[hoyIdx];

        return ordenDias.map(dia => {
            const totalDia = ventasPorDia[dia];
            // Escalar de 0 a 100% de la barra
            const porcentaje = Math.min(Math.round((totalDia / maxVenta) * 100), 100);

            let color = 'bg-neutral-800';
            if (dia === hoyNombre) {
                color = 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-xl shadow-amber-500/20';
            } else if (totalDia > 0) {
                color = 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-lg shadow-amber-500/10';
            }

            return {
                dia,
                val: porcentaje,
                total: totalDia,
                color
            };
        });
    };

    const datosSemanales = obtenerDatosSemanales();

    // --- ⌛ PANTALLA DE CARGA ---
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-100 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"
                />
                <p className="text-neutral-400 font-medium tracking-wide animate-pulse">Sincronizando con Supabase SaaS...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased pb-12 selection:bg-amber-500 selection:text-neutral-950">
            {/* --- TOAST PANEL --- */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-md shadow-2xl ${toastType === 'success'
                            ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
                            }`}
                    >
                        {toastType === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- NAVBAR SUPERIOR --- */}
            <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <LayoutDashboard className="w-5 h-5 text-neutral-950 font-bold" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-transparent bg-clip-text">J.A.R.V.I.S. SaaS</h1>
                        <p className="text-xs text-neutral-500 font-medium">B2B Admin Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={cargarTodo}
                        className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
                        title="Refrescar datos"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Base de Datos Conectada
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ================= SECCIÓN IZQUIERDA: MÉTRICAS Y LIVE FEED ================= */}
                <div className="lg:col-span-2 space-y-8">

                    {/* --- HEADER BIENVENIDA --- */}
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-850 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Buenos días, Administrador ✨</h2>
                            <p className="text-neutral-400 text-sm mt-1">Gestionando actualmente el comercio <span className="text-amber-500 font-semibold">{tenant?.name}</span>.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-medium text-neutral-500 block uppercase tracking-wider">Tenant ID</span>
                            <code className="text-xs text-amber-500 bg-amber-950/20 px-2.5 py-1 rounded border border-amber-900/40 font-mono mt-1 inline-block">{tenant?.id.substring(0, 8)}...</code>
                        </div>
                    </div>

                    {/* --- GRID MÉTRIAS FINANCIERAS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Tarjeta Ingresos */}
                        <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <DollarSign className="w-20 h-20 text-amber-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm font-semibold tracking-wide">Ingresos Totales IA</span>
                                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><TrendingUp className="w-4 h-4" /></span>
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-amber-500">${totalRevenue.toLocaleString()}</h3>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Facturado de forma autónoma</p>
                        </div>

                        {/* Tarjeta Pedidos */}
                        <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShoppingCart className="w-20 h-20 text-orange-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm font-semibold tracking-wide">Órdenes por Chats</span>
                                <span className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><ShoppingCart className="w-4 h-4" /></span>
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-orange-500">{orders.length}</h3>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Registradas por J.A.R.V.I.S.</p>
                        </div>

                        {/* Tarjeta Clientes */}
                        <div className="bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="w-20 h-20 text-rose-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-sm font-semibold tracking-wide">Clientes Captados</span>
                                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><Users className="w-4 h-4" /></span>
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-rose-500">{totalClientsCount}</h3>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Clientes Registrados </p>
                        </div>
                    </div>

                    {/* --- GRAFICO ANALÍTICO SIMPLIFICADO --- */}
                    <div className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold">Desempeño de Conversiones IA</h3>
                                <p className="text-xs text-neutral-500 font-medium">Ventas semanales del vendedor autónomo</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-900/30">Envío en vivo</span>
                        </div>
                        {/* Barras de Gráfico Visuales con Tailwind */}
                        <div className="flex items-end justify-between h-48 pt-6 px-4 border-b border-neutral-800">
                            {datosSemanales.map((b, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 w-10">
                                    <div className="text-[10px] text-neutral-500 font-mono font-bold">RD${b.total.toLocaleString()}</div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${b.val * 1.2}px` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                                        className={`w-4 rounded-t-md ${b.color}`}
                                    />
                                    <span className="text-xs text-neutral-400 font-medium mt-1">{b.dia}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- SECCIÓN INVENTARIO (CRUD COMPLETO) --- */}
                    <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-900 flex items-center justify-between bg-neutral-900/20">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-amber-500" />
                                    Catálogo de Productos Scoped
                                </h3>
                                <p className="text-xs text-neutral-500 font-medium mt-0.5">Gestión y control de inventario de esta boutique</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all transform active:scale-95 shadow-md shadow-amber-500/10"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                Agregar Producto
                            </button>
                        </div>

                        {/* --- FORMULARIO CREACIÓN --- */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    onSubmit={agregarProducto}
                                    className="p-6 border-b border-neutral-900 bg-neutral-900/10 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
                                >
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-neutral-400 block mb-1">Nombre del Producto</label>
                                        <input
                                            type="text"
                                            placeholder="ej. Camiseta D&E Gold Edition"
                                            value={newProdTitle}
                                            onChange={e => setNewProdTitle(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-400 block mb-1">Precio ($RD)</label>
                                        <input
                                            type="number"
                                            placeholder="ej. 1450"
                                            value={newProdPrice}
                                            onChange={e => setNewProdPrice(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-400 block mb-1">Stock Inicial</label>
                                        <input
                                            type="number"
                                            placeholder="ej. 15"
                                            value={newProdStock}
                                            onChange={e => setNewProdStock(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-neutral-400 block mb-1">Descripción Breve</label>
                                        <input
                                            type="text"
                                            placeholder="ej. Material premium, algodón 100%..."
                                            value={newProdDesc}
                                            onChange={e => setNewProdDesc(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div className="md:col-span-3 border-t border-neutral-900/60 pt-4 pb-2">
                                        <label className="text-xs font-semibold text-neutral-400 block mb-2">Imagen del Producto (Opcional)</label>
                                        <div className="flex items-center gap-4">
                                            {newProdImagePreview ? (
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-850 bg-neutral-950 flex-shrink-0 group">
                                                    <img src={newProdImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setNewProdImage(null);
                                                            setNewProdImagePreview(null);
                                                        }}
                                                        className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 font-bold text-xs"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-20 h-20 rounded-lg border border-dashed border-neutral-800 hover:border-amber-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-950 flex-shrink-0">
                                                    <Plus className="w-5 h-5 text-neutral-500" />
                                                    <span className="text-[10px] text-neutral-500 mt-1 font-medium font-mono">SUBIR</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={handleImageChange} 
                                                        className="hidden" 
                                                    />
                                                </label>
                                            )}
                                            <div className="text-xs text-neutral-500">
                                                <p className="font-semibold text-neutral-400">Seleccione una foto del producto.</p>
                                                <p className="mt-0.5">Formatos soportados: JPG, PNG, WEBP. Máx: 5MB.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-neutral-400 block mb-1">Categoría</label>
                                        <select
                                            value={selectedCategoryId}
                                            onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : '')}
                                            className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2.5 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione una categoría...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id} className="bg-neutral-950">
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={actionLoading === 'add_product'}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 text-neutral-950 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            {actionLoading === 'add_product' ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                    Confirmar Creación
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* --- TABLA PRODUCTOS --- */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-900 bg-neutral-900/10 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Detalle Producto</th>
                                        <th className="px-6 py-4">Precio</th>
                                        <th className="px-6 py-4 text-center">Stock</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-900/60 text-sm">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-medium">
                                                No hay productos cargados en el catálogo de esta tienda.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(p => {
                                            const isModified = pendingStocks[p.id] !== undefined && pendingStocks[p.id] !== p.stock;
                                            const displayStock = isModified ? pendingStocks[p.id] : p.stock;
                                            return (
                                                <tr key={p.id} className="hover:bg-neutral-900/20 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{p.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-850 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                {p.Images && p.Images.length > 0 ? (
                                                                    <img 
                                                                        src={getProxyImageUrl(p.Images[0].image_url)} 
                                                                        alt={p.title} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-neutral-600" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-neutral-200">{p.title}</div>
                                                                <div className="text-xs text-neutral-500 mt-0.5 max-w-xs truncate">{p.description || 'Sin descripción'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-neutral-300">${p.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => cambiarStockPendiente(p.id, -1)}
                                                                className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 transition-all active:scale-95 cursor-pointer"
                                                                disabled={actionLoading === `stock_${p.id}`}
                                                            >
                                                                -
                                                            </button>
                                                            <span className={`w-8 text-center font-mono font-bold transition-all duration-200 ${
                                                                isModified 
                                                                    ? 'text-amber-400 font-extrabold scale-110' 
                                                                    : displayStock === 0 
                                                                        ? 'text-rose-500' 
                                                                        : 'text-neutral-300'
                                                            }`}>
                                                                {displayStock}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => cambiarStockPendiente(p.id, 1)}
                                                                className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 transition-all active:scale-95 cursor-pointer"
                                                                disabled={actionLoading === `stock_${p.id}`}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <AnimatePresence mode="popLayout">
                                                                {isModified && (
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => guardarStock(p.id)}
                                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                                                                            disabled={actionLoading === `stock_${p.id}`}
                                                                            title="Aplicar cambios"
                                                                        >
                                                                            {actionLoading === `stock_${p.id}` ? (
                                                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                            ) : (
                                                                                <>
                                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                                    Aceptar
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => cancelarCambioStock(p.id)}
                                                                            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                                                                            disabled={actionLoading === `stock_${p.id}`}
                                                                            title="Cancelar cambios"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </AnimatePresence>
                                                            
                                                            {!isModified && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => eliminarProducto(p.id)}
                                                                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-850 hover:bg-rose-950/40 hover:border-rose-900 text-neutral-500 hover:text-rose-400 transition-all transform active:scale-95 cursor-pointer"
                                                                    disabled={actionLoading === `delete_${p.id}`}
                                                                    title="Eliminar de catálogo"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* ================= SECCIÓN DERECHA: CONFIG BOT Y QR ================= */}
                <div className="space-y-8">

                    {/* --- MODULO STATUS BOT INTEGRADOR --- */}
                    <div className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl">
                        <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                            <Bot className="w-5 h-5 text-amber-500" />
                            Integración Bot WhatsApp
                        </h3>

                        <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-900 flex flex-col items-center justify-center text-center">
                            {qrConnected ? (
                                <>
                                    <div className="w-24 h-24 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-center relative overflow-hidden shadow-lg shadow-emerald-500/10">
                                        <Check className="w-12 h-12 text-emerald-400 stroke-[2.5]" />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-sm font-bold text-neutral-200">Unified WhatsApp Live</div>
                                        <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">El bot de ventas está activo para los clientes finales.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-32 h-32 bg-neutral-900 border border-neutral-850 p-2.5 rounded-2xl relative flex items-center justify-center">
                                        {qrGenerating ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <div className="relative group cursor-pointer" onClick={simularQR}>
                                                {/* Código QR Simulado */}
                                                <QrCode className="w-28 h-28 text-neutral-300 opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-neutral-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                    <span className="text-[10px] font-bold text-amber-400 tracking-wider">ESCANEAR QR</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-sm font-bold text-neutral-300">Vincular Dispositivo</div>
                                        <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Haga clic o escanee para iniciar sesión en WhatsApp.</p>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={simularQR}
                                disabled={qrGenerating}
                                className={`w-full mt-5 py-2 rounded-lg text-xs font-bold transition-all transform active:scale-95 ${qrConnected
                                    ? 'bg-rose-950/40 border border-rose-900 text-rose-400 hover:bg-rose-900/20'
                                    : 'bg-amber-500 text-neutral-950 hover:bg-amber-600 shadow-md shadow-amber-500/10'
                                    }`}
                            >
                                {qrGenerating ? 'Estableciendo canal...' : qrConnected ? 'Desconectar Bot' : 'Generar Canal QR'}
                            </button>
                        </div>
                    </div>

                    {/* --- CONFIGURACIÓN DE AJUSTES EN SUPABASE (TENANTS) --- */}
                    <div className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl">
                        <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                            <Sliders className="w-5 h-5 text-amber-500" />
                            Ajustes del Bot (Tenants)
                        </h3>

                        <form onSubmit={guardarAjustes} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-400 block mb-1">Nombre Comercial</label>
                                <input
                                    type="text"
                                    value={botName}
                                    onChange={e => setBotName(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-400 block mb-1">Telegram Bot Token</label>
                                <input
                                    type="text"
                                    value={telegramToken}
                                    onChange={e => setTelegramToken(e.target.value)}
                                    placeholder="ej. 123456:ABC-..."
                                    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 font-mono text-xs transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-400 block mb-1">Telegram Subscribers (Chat IDs)</label>
                                <input
                                    type="text"
                                    value={telegramSubscribers}
                                    onChange={e => setTelegramSubscribers(e.target.value)}
                                    placeholder="ej. 654700152, 1633642846"
                                    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 font-mono text-xs transition-colors"
                                />
                                <span className="text-[10px] text-neutral-500 mt-1 block">IDs separados por comas para enviar alertas de venta.</span>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-400 block mb-1">Teléfono del Administrador</label>
                                <input
                                    type="text"
                                    value={adminPhone}
                                    onChange={e => setAdminPhone(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-850 px-3.5 py-2 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 text-neutral-950 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
                            >
                                {savingSettings ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Guardar
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* --- FEED RECIENTE DE COMPRAS --- */}
                    <div className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold">Órdenes Autónomas IA</h3>
                            <span className="text-[10px] text-neutral-500 font-bold">VIVO</span>
                        </div>

                        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                            {orders.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500 text-xs font-medium">
                                    No se han registrado órdenes por J.A.R.V.I.S. en esta tienda todavía.
                                </div>
                            ) : (
                                orders.map(o => (
                                    <div key={o.id} className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-900 flex items-center justify-between text-xs hover:border-neutral-800 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-neutral-200">{o.User?.name || 'Cliente de Bot'}</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">#{o.id}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                                                <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {new Date(o.created_at).toLocaleDateString('es-DO')}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {o.User?.phone || 'WA'}</span>
                                            </div>
                                        </div>

                                        <div className="text-right space-y-1">
                                            <div className="font-bold text-amber-500">${o.total.toLocaleString()}</div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block capitalize ${o.status === 'pendiente'
                                                ? 'bg-amber-950/30 text-amber-400 border border-amber-900/30'
                                                : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30'
                                                }`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
