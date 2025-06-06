
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message } = req.body;

        // Lógica do seu bot adaptada
        const resposta = `Resposta do chatbot para a mensagem: ${message}`;

        return res.status(200).json({ resposta });
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
}
