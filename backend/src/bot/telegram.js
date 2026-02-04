import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { technicians, addPendingTechnician, pendingTechnicians } from '../data/mockData.js';

dotenv.config();

let bot = null;

// Order completion checklist message
const COMPLETION_CHECKLIST = `
✅ Pastikan Sudah Melakukan:
• Update di @asobanten_bot
• COC
• Request Rating 10
• To check
• BA ID
• Update G-Form
`;

// Admin/Supervisor chat IDs for approval notifications
const getAdminChatIds = () => {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS ? process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => id.trim()) : [];
    const supervisorIds = process.env.SUPERVISOR_TELEGRAM_IDS ? process.env.SUPERVISOR_TELEGRAM_IDS.split(',').map(id => id.trim()) : [];
    return [...adminIds, ...supervisorIds];
};

export const initTelegramBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token || token === 'your_bot_token_here') {
        console.log('⚠️  Telegram Bot Token not configured - bot features disabled');
        console.log('💡 To enable: set TELEGRAM_BOT_TOKEN in .env file');
        return;
    }

    try {
        bot = new TelegramBot(token, { polling: true });

        // Handle polling errors gracefully
        bot.on('polling_error', (error) => {
            console.error('Telegram polling error:', error.message);
        });

        bot.on('error', (error) => {
            console.error('Telegram bot error:', error.message);
        });

        console.log('🤖 Telegram Bot starting...');

        // /start command - Auto Registration
        bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const username = msg.from.username || null;
            const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() || 'Unknown';

            // Check if already registered as technician
            const existingTech = technicians.find(t => t.telegramChatId === chatId);
            if (existingTech) {
                await bot.sendMessage(chatId,
                    `✅ Anda sudah terdaftar sebagai teknisi!\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `👤 Nama: ${existingTech.name}\n` +
                    `🆔 ID: ${existingTech.id}\n` +
                    `📍 Area: ${existingTech.area}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Ketik /help untuk melihat daftar perintah.`
                );
                return;
            }

            // Check if already pending
            const existingPending = pendingTechnicians.find(t => t.telegramChatId === chatId);
            if (existingPending) {
                await bot.sendMessage(chatId,
                    `⏳ Registrasi Anda sedang menunggu approval.\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🆔 ID: ${existingPending.id}\n` +
                    `📅 Terdaftar: ${new Date(existingPending.registeredAt).toLocaleString('id-ID')}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Mohon tunggu admin untuk menyetujui registrasi Anda.`
                );
                return;
            }

            // Auto-register as pending
            const result = addPendingTechnician(chatId, username, fullName);

            if (result.success) {
                // Send confirmation to technician
                await bot.sendMessage(chatId,
                    `📝 Registrasi Diterima!\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🆔 ID Anda: ${result.data.id}\n` +
                    `👤 Nama: ${fullName}\n` +
                    `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `⏳ Status: Menunggu Approval Admin\n\n` +
                    `Anda akan menerima notifikasi setelah admin menyetujui registrasi.`
                );

                // Notify admins
                const adminIds = getAdminChatIds();
                for (const adminId of adminIds) {
                    try {
                        await bot.sendMessage(adminId,
                            `🆕 REGISTRASI TEKNISI BARU\n\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                            `🆔 ID: ${result.data.id}\n` +
                            `👤 Nama: ${fullName}\n` +
                            `📱 Username: @${username || 'N/A'}\n` +
                            `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                            `⏳ Menunggu approval di Dashboard\n` +
                            `Buka menu Technicians > Pending Approvals`
                        );
                    } catch (err) {
                        console.error(`Failed to notify admin ${adminId}:`, err.message);
                    }
                }
            } else {
                await bot.sendMessage(chatId, `ℹ️ ${result.message}`);
            }
        });

        // Legacy: Registration with Technician ID (for existing technicians)
        bot.onText(/^TX-\d+$/i, async (msg) => {
            const chatId = msg.chat.id;
            const techId = msg.text.toUpperCase();
            const tech = technicians.find(t => t.id === techId);

            if (tech) {
                tech.telegramChatId = chatId;
                await bot.sendMessage(chatId,
                    `✅ Telegram Terhubung!\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `👤 Nama: ${tech.name}\n` +
                    `🆔 ID: ${tech.id}\n` +
                    `📍 Area: ${tech.area}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Anda akan menerima notifikasi order di sini.\n` +
                    `Ketik /help untuk melihat daftar perintah.`
                );
            } else {
                await bot.sendMessage(chatId,
                    `❌ ID Teknisi tidak ditemukan.\n\n` +
                    `Jika Anda teknisi baru, cukup ketik /start untuk mendaftar otomatis.`
                );
            }
        });

        // /help command
        bot.onText(/\/help/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `📋 Daftar Perintah:\n\n` +
                `/start - Registrasi ke sistem\n` +
                `/myorders - Lihat order aktif\n` +
                `/otw - Update status OTW\n` +
                `/arrived - Update status tiba\n` +
                `/done - Selesaikan order\n` +
                `/report - Statistik harian\n` +
                `/help - Daftar perintah`
            );
        });

        // /myorders command
        bot.onText(/\/myorders/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `📦 Order Aktif Anda:\n\n` +
                `1. #ORD-4501 - INDIHOME\n` +
                `   📍 Jl. Kemang Raya No. 45\n` +
                `   Status: 🟡 ON PROGRESS\n\n` +
                `2. #ORD-4502 - ORBIT\n` +
                `   📍 Jl. Sudirman No. 12\n` +
                `   Status: ⏳ PENDING`
            );
        });

        // /otw command
        bot.onText(/\/otw/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `🚗 Status Updated: OTW\n\n` +
                `Order: #ORD-4501\n` +
                `Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB\n\n` +
                `Silakan kirim lokasi Anda saat tiba.`
            );
        });

        // /arrived command
        bot.onText(/\/arrived/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `📍 Status Updated: ARRIVED\n\n` +
                `Order: #ORD-4501\n` +
                `Waktu Tiba: ${new Date().toLocaleTimeString('id-ID')} WIB\n` +
                `Lokasi: ✅ Terverifikasi\n\n` +
                `Silakan lakukan pekerjaan.\n` +
                `Ketik /done setelah selesai.`
            );
        });

        // /done command
        bot.onText(/\/done/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `✅ ORDER SELESAI\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Order: #ORD-4501\n` +
                `Status: ✅ PS DONE\n` +
                `Waktu Selesai: ${new Date().toLocaleTimeString('id-ID')} WIB\n` +
                `Durasi: 1 jam 15 menit\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📊 Statistik Hari Ini:\n` +
                `• Completed: 3 orders\n` +
                `• Revenue Points: 450 pts\n` +
                `• Avg Time: 52 menit\n` +
                COMPLETION_CHECKLIST +
                `\nLanjutkan kerja bagus! 🌟`
            );
        });

        // /report command
        bot.onText(/\/report/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(chatId,
                `📊 Laporan Harian\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `✅ Completed: 5 orders\n` +
                `🔄 In Progress: 1 order\n` +
                `⏳ Pending: 2 orders\n\n` +
                `💰 Revenue Points: 750 pts\n` +
                `⏱️ Avg Handling: 48 menit\n` +
                `📈 SLA Compliance: 98%`
            );
        });

        // Callback query handler for buttons
        bot.on('callback_query', async (callbackQuery) => {
            const chatId = callbackQuery.message.chat.id;
            const data = callbackQuery.data;

            if (data.startsWith('accept_')) {
                const orderId = data.replace('accept_', '');
                await bot.sendMessage(chatId,
                    `✅ Order #${orderId} DITERIMA\n\n` +
                    `Status: 🟡 ON PROGRESS\n\n` +
                    `Langkah selanjutnya:\n` +
                    `1. Ketik /otw saat berangkat ke lokasi\n` +
                    `2. Ketik /arrived saat tiba di lokasi\n` +
                    `3. Ketik /done setelah selesai\n\n` +
                    `Semangat! 💪`
                );
            } else if (data.startsWith('reject_')) {
                const orderId = data.replace('reject_', '');
                await bot.sendMessage(chatId,
                    `Mohon berikan alasan penolakan untuk Order #${orderId}:`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🚗 Jarak Terlalu Jauh', callback_data: `reason_distance_${orderId}` }],
                                [{ text: '📅 Jadwal Bentrok', callback_data: `reason_schedule_${orderId}` }],
                                [{ text: '🤒 Sakit/Izin', callback_data: `reason_sick_${orderId}` }],
                                [{ text: '🔧 Handle Order Lain', callback_data: `reason_busy_${orderId}` }]
                            ]
                        }
                    }
                );
            } else if (data.startsWith('reason_')) {
                await bot.sendMessage(chatId,
                    `❌ Order ditolak.\n` +
                    `Order akan di-assign ke petugas lain.\n\n` +
                    `Terima kasih atas konfirmasinya.`
                );
            }

            await bot.answerCallbackQuery(callbackQuery.id);
        });

        console.log('✅ Telegram Bot initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Telegram bot:', error.message);
        console.log('💡 Server will continue without Telegram bot features');
    }
};

// Send order notification to technician
export const sendOrderNotification = async (techChatId, order) => {
    if (!bot || !techChatId) return false;

    const message =
        `🆕 ORDER BARU #${order.id}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 Produk: ${order.product}\n` +
        `🏷️ Tipe: ${order.orderType}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 Customer: ${order.customer}\n` +
        `📞 Telepon: ${order.phone}\n` +
        `🏠 Alamat:\n   ${order.address}\n   ${order.area}\n\n` +
        `📍 Koordinat: ${order.coordinates.lat}, ${order.coordinates.lng}\n` +
        `🗺️ Google Maps: https://maps.google.com/?q=${order.coordinates.lat},${order.coordinates.lng}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 Jadwal: ${order.schedule}\n` +
        `⏰ Waktu: ${order.scheduleTime} WIB\n` +
        `⚡ Prioritas: ${order.priority === 'HIGH' ? '🔴 HIGH' : order.priority === 'NORMAL' ? '🟡 NORMAL' : '🟢 LOW'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⏳ Respon dalam 15 menit`;

    try {
        await bot.sendMessage(techChatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ TERIMA', callback_data: `accept_${order.id}` },
                        { text: '❌ TOLAK', callback_data: `reject_${order.id}` }
                    ]
                ]
            }
        });
        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
};

// Send bulk message to multiple technicians
export const sendBulkMessage = async (chatIds, message) => {
    if (!bot) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;

    for (const chatId of chatIds) {
        try {
            await bot.sendMessage(chatId, message);
            success++;
        } catch (error) {
            failed++;
        }
    }

    return { success, failed };
};

// Send order notifications to multiple technicians at once
export const sendBulkOrderNotifications = async (technicianOrders) => {
    if (!bot) return { success: 0, failed: 0, details: [] };

    let success = 0;
    let failed = 0;
    const details = [];

    for (const { technician, orders } of technicianOrders) {
        if (!technician.telegramChatId) {
            failed++;
            details.push({ techId: technician.id, status: 'no_chat_id' });
            continue;
        }

        for (const order of orders) {
            try {
                const message =
                    `🆕 ORDER ASSIGNED #${order.id}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `📦 Produk: ${order.product}\n` +
                    `🏷️ Tipe: ${order.orderType}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `👤 Customer: ${order.customer}\n` +
                    `📞 Telepon: ${order.phone}\n` +
                    `🏠 Alamat:\n   ${order.address}\n   ${order.area}\n\n` +
                    `📍 Koordinat: ${order.coordinates?.lat || '-'}, ${order.coordinates?.lng || '-'}\n` +
                    `🗺️ Google Maps: https://maps.google.com/?q=${order.coordinates?.lat || 0},${order.coordinates?.lng || 0}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `📅 Jadwal: ${order.schedule}\n` +
                    `⏰ Waktu: ${order.scheduleTime || 'ASAP'} WIB\n` +
                    `⚡ Prioritas: ${order.priority === 'HIGH' ? '🔴 HIGH' : order.priority === 'NORMAL' ? '🟡 NORMAL' : '🟢 LOW'}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `⏳ Mohon segera proses order ini`;

                await bot.sendMessage(technician.telegramChatId, message, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ TERIMA', callback_data: `accept_${order.id}` },
                                { text: '❌ TOLAK', callback_data: `reject_${order.id}` }
                            ]
                        ]
                    }
                });
                success++;
                details.push({ techId: technician.id, orderId: order.id, status: 'sent' });
            } catch (error) {
                failed++;
                details.push({ techId: technician.id, orderId: order.id, status: 'error', error: error.message });
            }
        }
    }

    return { success, failed, details };
};

// Admin/Supervisor chat IDs (should be configured in .env)
const ADMIN_CHAT_IDS = process.env.ADMIN_TELEGRAM_IDS ? process.env.ADMIN_TELEGRAM_IDS.split(',') : [];
const SUPERVISOR_CHAT_IDS = process.env.SUPERVISOR_TELEGRAM_IDS ? process.env.SUPERVISOR_TELEGRAM_IDS.split(',') : [];

// Send Priority Order Warning
export const sendPriorityWarning = async (order) => {
    if (!bot) return false;

    const message =
        `⚠️ PRIORITY ORDER ALERT ⚠️\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔴 HIGH PRIORITY ORDER\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📦 Order: #${order.id}\n` +
        `👤 Customer: ${order.customer}\n` +
        `📍 Area: ${order.area || 'N/A'}\n` +
        `📞 Phone: ${order.phone}\n` +
        `🏠 Address: ${order.address}\n\n` +
        `📅 Schedule: ${order.schedule}\n` +
        `⏰ Time: ${order.scheduleTime || 'ASAP'}\n\n` +
        `⚡ Requires immediate attention!\n` +
        `Assign technician within 15 minutes.`;

    const allAdmins = [...ADMIN_CHAT_IDS, ...SUPERVISOR_CHAT_IDS];

    for (const chatId of allAdmins) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(`Failed to send priority warning to ${chatId}:`, error.message);
        }
    }

    return true;
};

// Send Stale Order Alert (orders not updated for 1 hour)
export const sendStaleOrderAlert = async (orders) => {
    if (!bot || !orders.length) return false;

    let orderList = orders.map(o =>
        `  • #${o.id} - ${o.customer} (${o.lastUpdate || 'Unknown'})`
    ).join('\n');

    const message =
        `🕐 STALE ORDER ALERT 🕐\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ Orders not updated > 1 hour\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${orderList}\n\n` +
        `📊 Total: ${orders.length} orders\n\n` +
        `Please follow up with assigned technicians.`;

    const allAdmins = [...ADMIN_CHAT_IDS, ...SUPERVISOR_CHAT_IDS];

    for (const chatId of allAdmins) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(`Failed to send stale alert to ${chatId}:`, error.message);
        }
    }

    return true;
};

// Send Order Summary to Admin/Supervisor
export const sendOrderSummary = async (summary) => {
    if (!bot) return false;

    const message =
        `📊 ORDER SUMMARY\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📅 ${summary.date || new Date().toLocaleDateString('id-ID')}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📦 Total Orders: ${summary.total || 0}\n` +
        `✅ Completed: ${summary.completed || 0}\n` +
        `🔄 In Progress: ${summary.inProgress || 0}\n` +
        `📋 In Queue: ${summary.inQueue || 0}\n` +
        `❌ Issues: ${summary.issues || 0}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👷 Technicians Active: ${summary.techsActive || 0}\n` +
        `⏱️ Avg Completion: ${summary.avgTime || 0} min\n` +
        `📈 SLA Rate: ${summary.slaRate || 0}%\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔴 High Priority: ${summary.highPriority || 0}\n` +
        `🟠 Not Updated (>1h): ${summary.staleCount || 0}`;

    const allAdmins = [...ADMIN_CHAT_IDS, ...SUPERVISOR_CHAT_IDS];

    for (const chatId of allAdmins) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(`Failed to send summary to ${chatId}:`, error.message);
        }
    }

    return true;
};

// Send notification to Admin only
export const sendToAdmin = async (message) => {
    if (!bot) return false;

    for (const chatId of ADMIN_CHAT_IDS) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(`Failed to send to admin ${chatId}:`, error.message);
        }
    }

    return true;
};

// Send notification to Supervisor only
export const sendToSupervisor = async (message) => {
    if (!bot) return false;

    for (const chatId of SUPERVISOR_CHAT_IDS) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(`Failed to send to supervisor ${chatId}:`, error.message);
        }
    }

    return true;
};

// Check for stale orders every hour (call this from a scheduler/cron)
export const checkStaleOrders = async (orders) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const staleOrders = orders.filter(order => {
        if (!order.lastUpdated) return false;
        const lastUpdate = new Date(order.lastUpdated);
        return lastUpdate < oneHourAgo &&
            !['PS_DONE', 'COMPLETED', 'CANCELLED'].includes(order.status);
    });

    if (staleOrders.length > 0) {
        await sendStaleOrderAlert(staleOrders);
    }

    return staleOrders;
};

// Start periodic stale order check (every 30 minutes)
let staleCheckInterval = null;

export const startStaleOrderMonitoring = (getOrdersFunc) => {
    if (staleCheckInterval) return;

    console.log('📊 Starting stale order monitoring (every 30 min)');

    staleCheckInterval = setInterval(async () => {
        try {
            const orders = await getOrdersFunc();
            await checkStaleOrders(orders);
        } catch (error) {
            console.error('Stale order check failed:', error.message);
        }
    }, 30 * 60 * 1000); // Every 30 minutes
};

export const stopStaleOrderMonitoring = () => {
    if (staleCheckInterval) {
        clearInterval(staleCheckInterval);
        staleCheckInterval = null;
        console.log('📊 Stale order monitoring stopped');
    }
};

// Notify technician when approved
export const notifyTechnicianApproval = async (technicianChatId, techData) => {
    if (!bot || !technicianChatId) return false;

    try {
        await bot.sendMessage(technicianChatId,
            `✅ REGISTRASI DISETUJUI!\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Selamat! Anda telah disetujui sebagai teknisi.\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 Nama: ${techData.name}\n` +
            `🆔 ID: ${techData.id}\n` +
            `📍 Area: ${techData.area}\n\n` +
            `Anda sekarang dapat menerima order.\n` +
            `Ketik /help untuk melihat daftar perintah.`
        );
        return true;
    } catch (error) {
        console.error('Failed to notify technician approval:', error.message);
        return false;
    }
};

// Notify technician when rejected
export const notifyTechnicianRejection = async (technicianChatId, reason) => {
    if (!bot || !technicianChatId) return false;

    try {
        await bot.sendMessage(technicianChatId,
            `❌ REGISTRASI DITOLAK\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Maaf, registrasi Anda ditolak oleh admin.\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📝 Alasan: ${reason || 'Tidak ada alasan yang diberikan'}\n\n` +
            `Silakan hubungi admin untuk informasi lebih lanjut.`
        );
        return true;
    } catch (error) {
        console.error('Failed to notify technician rejection:', error.message);
        return false;
    }
};

export default {
    initTelegramBot,
    sendOrderNotification,
    sendBulkMessage,
    sendBulkOrderNotifications,
    sendPriorityWarning,
    sendStaleOrderAlert,
    sendOrderSummary,
    sendToAdmin,
    sendToSupervisor,
    checkStaleOrders,
    startStaleOrderMonitoring,
    stopStaleOrderMonitoring,
    notifyTechnicianApproval,
    notifyTechnicianRejection
};
