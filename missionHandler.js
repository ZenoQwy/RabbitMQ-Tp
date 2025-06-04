const decodeMorse = require('./morseDictionnary');

const handlers = {
    rot13: payload =>
        payload.replace(/[a-zA-Z]/g, c =>
            String.fromCharCode(
                c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)
            )
        ),

    base64: payload =>
        Buffer.from(payload, 'base64').toString('utf-8'),

    json_extract: payload => {
        const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
    },

    morse: decodeMorse
};

function handleMission({ agent, type, payload }) {
    const handler = handlers[type];
    if (!handler) return `[${agent}] : Type de mission inconnu : ${type}`;

    try {
        const result = handler(payload);
        return `[${agent}] : ${result}`;  
    } catch (err) {
        return `[${agent}] : Erreur : ${err.message}`;
    }
}


module.exports = handleMission;
