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

const servicos = {
    "Designer de sobrancelha": [
        { nome: 'Designer de sobrancelha', valor: 'R$ 38,00' },
        { nome: 'Designer de sobrancelha + buço', valor: 'R$ 48,00' },
        { nome: 'Designer de sobrancelha com coloração ou henna', valor: 'R$ 48,00' },
        { nome: 'Designer de sobrancelha com coloração ou henna + buço', valor: 'R$ 58,00' },
        { nome: 'Buço', valor: 'R$ 18,00' },
        { nome: 'Brow lamination', valor: 'R$ 120,00' },
        { nome: 'Lifting de cílios', valor: 'R$ 130,00' },
        { nome: 'Reconstrução de Sobrancelha', valor: 'Consultar' }
    ],
    "Produção maquiagem e penteado": [
        { nome: 'Maquiagem eventos (madrinhas, formandas)', valor: 'R$ 170,00' },
        { nome: 'Maquiagem para fotos (segunda a sexta)', valor: 'R$ 130,00' },
        { nome: 'Penteado', valor: 'R$ 100,00 a R$ 150,00' }
    ],
    "Serviços Especiais": [
        { nome: 'Depilação a Laser', valor: 'a partir de R$ 80,00 (combos e áreas a consultar)' },
        { nome: 'Pacotes de noiva', valor: 'Consultar' }
    ]
};

const agendamentos = {}; // Objeto para armazenar as escolhas do cliente

// Função exportada para ser chamada pela API
export async function processMessage(chatId, message) {
    if (!agendamentos[chatId]) {
        agendamentos[chatId] = { etapa: 0 };
    }

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Bot está pronto!');
    });

    client.on('message', async msg => {
        const chatId = msg.from;

        // Se a mensagem foi enviada pelo próprio operador, encerra o atendimento automaticamente
        if (!msg.fromMe && agendamentos[chatId]) {
            agendamentos[chatId].operadorAtendeu = false; // Garante que o cliente ainda está sendo atendido
        }

        if (msg.fromMe && agendamentos[chatId]) {
            // Mensagem enviada pelo operador → Encerra o atendimento automaticamente
            delete agendamentos[chatId];
            console.log(`Atendimento encerrado manualmente para ${chatId}`);
            return;
        }

        if (msg.body.toLowerCase() === 'serviços') {
            client.sendMessage(chatId, `Aqui estão nossos serviços disponíveis:\n${Object.keys(servicos).map(categoria => {
                return `\n${categoria}:\n${servicos[categoria].map(s => `${s.nome} - ${s.valor}`).join('\n')}`;
            }).join('\n')
                }`);
            return;
        }


        if (msg.body.toLowerCase() === 'produtos') {
            client.sendMessage(chatId, 'Confira nossos produtos no Instagram: https://www.instagram.com/filfioreff/#');
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

        if (msg.body.toLowerCase() === 'remarcar' || msg.body.toLowerCase() === 'consultar agendamento') {
            client.sendMessage(chatId, 'Para remarcar ou consultar seu agendamento, aguarde que entraremos em contato.');
            return;
        }

        switch (etapa) {
            case 0:
                client.sendMessage(chatId, `Olá! Seja bem - vinda ao Sabrina Fiorese Studio de Beleza!
Escolha uma opção:
1 - Agendar um serviço
2 - Ver serviços e valores
3 - Ver produtos
4 - Consultar ou remarcar agendamento`);
                agendamentos[chatId].etapa = 1;
                break;

            case 1:
                if (msg.body === '2') {
                    client.sendMessage(chatId, `Aqui estão nossos serviços disponíveis:
${Object.keys(servicos).map(categoria =>
                        `\n${categoria}:\n${servicos[categoria].map(s => `${s.nome} - ${s.valor}`).join('\n')}`
                    ).join('\n')}`);
                    delete agendamentos[chatId];
                } else if (msg.body === '1') {
                    client.sendMessage(chatId, `Escolha a categoria da profissional:
${Object.keys(profissionais).map((p, i) => `${i + 1} - ${p}`).join('\n')}
Digite "Voltar" para retornar.`);
                    agendamentos[chatId].etapa = 2;
                } else if (msg.body === '3') {
                    client.sendMessage(chatId, 'Confira nossos produtos no Instagram: https://www.instagram.com/filfioreff/#');
                    delete agendamentos[chatId];
                } else if (msg.body === '4') {
                    client.sendMessage(chatId, 'Aguarde por gentileza, em breve alguém irá retornar com a disponibilidade.');
                    delete agendamentos[chatId];
                } else {
                    client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
                }
                break;

            case 2:
                const categoriaIndex = parseInt(msg.body) - 1;
                const categorias = Object.keys(profissionais);

                if (categoriaIndex >= 0 && categoriaIndex < categorias.length) {
                    agendamentos[chatId].categoria = categorias[categoriaIndex];
                    const profissionaisDisponiveis = profissionais[agendamentos[chatId].categoria];

                    if (profissionaisDisponiveis.length === 1) {
                        encaminharParaProfissional(chatId, profissionaisDisponiveis[0]);
                    } else {
                        client.sendMessage(chatId, `Escolha a profissional desejada para ${agendamentos[chatId].categoria}:\n` +
                            profissionaisDisponiveis.map((prof, i) => `${i + 1} - ${prof}`).join('\n') +
                            `\nDigite o número correspondente.`);
                        agendamentos[chatId].etapa = 3;
                    }
                } else {
                    client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
                }
                break;


            case 3:
                const profissionalIndex = parseInt(msg.body) - 1;
                const profissionaisEscolhidos = profissionais[agendamentos[chatId].categoria];

                if (profissionalIndex >= 0 && profissionalIndex < profissionaisEscolhidos.length) {
                    const profissional = profissionaisEscolhidos[profissionalIndex];
                    encaminharParaProfissional(chatId, profissional);
                } else {
                    client.sendMessage(chatId, 'Escolha inválida. Tente novamente.');
                }
                break;

            case 4: // Nova etapa para capturar a disponibilidade do cliente
                agendamentos[chatId].disponibilidade = msg.body;
                client.sendMessage(chatId, "Obrigado! Sabrina entrará em contato com você em breve.");
                delete agendamentos[chatId]; // Remove o agendamento após registrar a resposta
                break;
        }
    });

    function encaminharParaProfissional(chatId, profissional) {
        if (profissional === "Sabrina") {
            // Se o cliente escolher a Sabrina, perguntamos a disponibilidade
            client.sendMessage(chatId, "Por favor, informe sua disponibilidade (dia e horário desejado).");
            agendamentos[chatId].etapa = 4;
        } else {
            const contatos = {
                "Maíra": "https://wa.me/5528999435647",
                "Juliana": "https://wa.me/5528999551316",
                "Arielly": "https://wa.me/5528999895626"
            };

            if (contatos[profissional]) {
                client.sendMessage(chatId, `Para agendamentos com ${profissional}, entre em contato pelo WhatsApp: ${contatos[profissional]}`);
            } else {
                client.sendMessage(chatId, "Profissional não encontrada. Tente novamente.");
            }
        }
    }
}


client.initialize();