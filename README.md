# WhatsApp Chatbot para Salão de Beleza

Este projeto é um chatbot para WhatsApp que auxilia no agendamento de serviços em um salão de beleza. Ele permite aos clientes consultar valores de serviços e solicitar agendamentos com diferentes profissionais.

## Funcionalidades

- Exibe uma lista de serviços e seus valores.
- Permite agendamentos com profissionais do salão.
- Redireciona para contato direto no WhatsApp da profissional de manicure.
- Pergunta a disponibilidade do cliente antes de registrar um agendamento.

## Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal)

## Como Instalar e Executar

### 1. Instale o Node.js e npm (caso ainda não tenha instalado)

```sh
sudo apt update && sudo apt install nodejs npm -y
```

Verifique se a instalação foi bem-sucedida:

```sh
node -v
npm -v
```

### 2. Clone o repositório

```sh
git clone https://github.com/dgkeven/whatsapp-chatbot.git
cd whatsapp-chatbot
```

### 3. Instale as dependências do projeto

```sh
npm install
```

### 4. Execute o chatbot

```sh
node chatbot.js
```

### 5. Escaneie o QR Code

Assim que rodar o bot, um QR Code será exibido no terminal. Use o WhatsApp no celular para escaneá-lo (WhatsApp Web).

## Como Usar

- Envie **"Serviços"** para visualizar a lista de serviços e valores.
- Envie **"Agendar"** para iniciar o processo de agendamento.
- Para agendar um serviço, siga as etapas guiadas pelo bot.
- Para serviços de **Manicure**, o bot fornecerá o contato da profissional.
- Envie **"Cancelar"** para encerrar o processo de agendamento.

## Estrutura do Projeto

```
whatsapp-chatbot/
│── chatbot.js    # Arquivo principal do bot
│── package.json  # Dependências do projeto
│── README.md     # Documentação
```

## 📄 Licença

Este projeto é open-source e pode ser adaptado conforme suas necessidades. Nenhuma informação sensível é armazenada sem consentimento.

## Desenvolvido por

Keven Mendes

🚀 Bom uso!
