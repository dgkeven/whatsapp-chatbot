const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Profissionais e serviços disponíveis
const profissionais = {
    "Designer de sobrancelha": ["Sabrina", "Maíra"],
    "Manicure": ["Arielly"],
    "Produção maquiagem e penteado": ["Sabrina", "Maíra", "Juliana"]
};

const servicos = [
    { nome: 'Designer de sobrancelha', valor: 'R$ 38,00', tempo: '30 min' },
    { nome: 'Designer de sobrancelha + buço', valor: 'R$ 48,00', tempo: '30 min' },
    { nome: 'Designer de sobrancelha com coloração ou henna', valor: 'R$ 48,00', tempo: '40 min' },
    { nome: 'Designer de sobrancelha com coloração ou henna + buço', valor: 'R$ 58,00', tempo: '40 min' },
    { nome: 'Buço', valor: 'R$ 18,00' },
    { nome: 'Maquiagem eventos (madrinhas, formandas)', valor: 'R$ 170,00', tempo: '50 min' },
    { nome: 'Maquiagem para fotos (segunda a sexta)', valor: 'R$ 130,00', tempo: '45 min' },
    { nome: 'Penteado', valor: 'R$ 100,00 a R$ 150,00', tempo: '1h' },
    { nome: 'Brow lamination', valor: 'R$ 120,00', tempo: '1h' },
    { nome: 'Lifting de cílios', valor: 'R$ 130,00', tempo: '1h30' },
    { nome: 'Depilação a Laser', valor: 'a partir de R$ 80,00', tempo: '20 min (combos e áreas a consultar)' },
    { nome: 'Pacotes de noiva', valor: 'Consultar' }
];

const agendamentos = {}; // Objeto para armazenar as escolhas do cliente

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot está pronto!');
});

client.on('message', async msg => {
    const chatId = msg.from;

    if (msg.body.toLowerCase() === 'serviços') {
        client.sendMessage(chatId, `Aqui estão nossos serviços disponíveis:
${servicos.map(s => `${s.nome} - ${s.valor} (${s.tempo || 'Tempo variável'})`).join('\n')}`);
        return;
    }

    if (!agendamentos[chatId]) {
        agendamentos[chatId] = { etapa: 0 };
    }
    
    const etapa = agendamentos[chatId].etapa;

    if (msg.body.toLowerCase() === 'cancelar') {
        delete agendamentos[chatId];
        return client.sendMessage(chatId, 'Agendamento cancelado. Se precisar de algo, só chamar!');
    }

    switch (etapa) {
        case 0:
            client.sendMessage(chatId, `Olá! Seja bem-vinda ao Sabrina Fiorese Studio de Beleza! Escolha uma opção:
                1 - Agendar um serviço
                2 - Ver serviços e valores`);
            agendamentos[chatId].etapa = 1;
            break;

        case 1:
            if (msg.body === '2') {
                client.sendMessage(chatId, `Aqui estão nossos serviços disponíveis:
${servicos.map(s => `${s.nome} - ${s.valor} (${s.tempo || 'Tempo variável'})`).join('\n')}`);
                delete agendamentos[chatId];
            } else if (msg.body === '1') {
                client.sendMessage(chatId, `Escolha a categoria da profissional:
${Object.keys(profissionais).map((p, i) => `${i + 1} - ${p}`).join('\n')}`);
                agendamentos[chatId].etapa = 2;
            } else {
                client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
            }
            break;
        
        case 2:
            const categoriaIndex = parseInt(msg.body) - 1;
            const categorias = Object.keys(profissionais);
            if (categoriaIndex >= 0 && categoriaIndex < categorias.length) {
                agendamentos[chatId].categoria = categorias[categoriaIndex];
                if (agendamentos[chatId].categoria === "Manicure") {
                    client.sendMessage(chatId, "Para agendamentos de manicure, entre em contato diretamente com Arielly pelo WhatsApp: https://wa.me/5528999895626");
                    delete agendamentos[chatId];
                } else {
                    client.sendMessage(chatId, `Ótimo! Escolha a profissional:
${profissionais[categorias[categoriaIndex]].map((p, i) => `${i + 1} - ${p}`).join('\n')}`);
                    agendamentos[chatId].etapa = 3;
                }
            } else {
                client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
            }
            break;
        
        case 3:
            const profIndex = parseInt(msg.body) - 1;
            const listaProfissionais = profissionais[agendamentos[chatId].categoria];
            if (profIndex >= 0 && profIndex < listaProfissionais.length) {
                agendamentos[chatId].profissional = listaProfissionais[profIndex];
                client.sendMessage(chatId, `Escolha o serviço:
${servicos.map((s, i) => `${i + 1} - ${s.nome} (${s.valor}, ${s.tempo})`).join('\n')}`);
                agendamentos[chatId].etapa = 4;
            } else {
                client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
            }
            break;
    }
});

client.initialize();
