const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// ======================
// CONFIG
// ======================

let vipUsers = [6248743831];
let users = {};

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ======================
// IA (HUGGING FACE)
// ======================

async function gerarResposta(prompt, systemPrompt) {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                inputs: `${systemPrompt}\n\nPergunta: ${prompt}\nResposta:`
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`
                }
            }
        );

        if (!response.data || !response.data[0]) {
            console.log("Resposta inválida:", response.data);
            return "❌ Erro na IA.";
        }

        return response.data[0].generated_text;

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

    // COMANDOS

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

    // mensagem normal
    return responderIA(msg, "Você é um assistente inteligente que ajuda com renda, vendas e dúvidas.");
});

// ======================
// FUNÇÃO PRINCIPAL
// ======================

async function gerarResposta(prompt, systemPrompt) {
    try {
        const response = await axios.post(
            "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                inputs: `${systemPrompt}\n\nPergunta: ${prompt}\nResposta:`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`
                }
            }
        );

        if (!response.data || !response.data[0]) {
            return "❌ Erro na IA.";
        }

        return response.data[0].generated_text;

    } catch (error) {
        console.log("ERRO IA:", error.response?.data || error.message);
        return "❌ Erro ao gerar resposta.";
    }
}

if (!isVIP) users[userId].count++;

try {
    await bot.sendMessage(chatId, "🤖 Pensando...");

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