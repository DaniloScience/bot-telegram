const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TOKEN;
const API_KEY = process.env.API_KEY;

const bot = new TelegramBot(token, { polling: true });

let vipUsers = [6248743831];
let users = {};

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ======================
// IA CORRIGIDA
// ======================

async function gerarResposta(prompt, systemPrompt) {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data.choices) {
            console.log("Resposta inválida:", response.data);
            return "❌ Erro na resposta da IA.";
        }

        return response.data.choices[0].message.content;

    } catch (error) {
        console.log("ERRO IA:", error.response?.data || error.message);
        return "❌ Erro ao gerar resposta.";
    }
}

// ======================
// BOT
// ======================

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text) return;

    if (text === "/meuid") {
        return bot.sendMessage(chatId, `🆔 Seu ID: ${userId}`);
    }

    if (text.startsWith("/renda")) {
        return responderIA(msg, "Dê uma ideia prática de renda extra simples e realista.");
    }

    if (text.startsWith("/texto")) {
        return responderIA(msg, "Crie um texto de venda persuasivo e curto.");
    }

    if (text.startsWith("/resumo")) {
        return responderIA(msg, "Resuma o texto de forma simples e direta.");
    }

    return responderIA(msg, "Você é um assistente inteligente.");
});

// ======================
// FUNÇÃO PRINCIPAL
// ======================

async function responderIA(msg, systemPrompt) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    const today = getToday();

    if (!users[userId]) {
        users[userId] = { count: 0, lastDate: today };
    }

    if (users[userId].lastDate !== today) {
        users[userId].count = 0;
        users[userId].lastDate = today;
    }

    const isVIP = vipUsers.includes(userId);

    if (!isVIP && users[userId].count >= 2) {
        return bot.sendMessage(chatId,
            "🚫 Limite atingido.\n💎 VIP: @Suporte_Assistente");
    }

    if (!isVIP) users[userId].count++;

    try {
        bot.sendMessage(chatId, "🤖 Pensando...");

        const resposta = await gerarResposta(text, systemPrompt);

        await bot.sendMessage(chatId, resposta);

    } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "❌ Erro geral.");
    }

    if (!isVIP) {
        const restantes = 2 - users[userId].count;
        bot.sendMessage(chatId, `⚡ Restam ${restantes} uso(s)`);
    } else {
        bot.sendMessage(chatId, "💎 VIP ativo");
    }
}