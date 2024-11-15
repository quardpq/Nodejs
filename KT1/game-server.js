const zmq = require("zeromq");
const socket = new zmq.Request();

(async () => {
    socket.connect("tcp://127.0.0.1:3000");
    console.log("Game Server готов к игре...");

    socket.send(JSON.stringify({ range: true }));

    let currentMin = null;
    let currentMax = null;

    for await (const message of socket) {
        const clientMessage = JSON.parse(message.toString());
        console.log("Клиент:", clientMessage);

        if (clientMessage.range) {
            const [min, max] = clientMessage.range.split("-").map(Number);
            currentMin = min;
            currentMax = max;
            makeGuess();
        } else if (clientMessage.hint) {
            if (clientMessage.hint === "more") {
                currentMin = Math.floor((currentMin + currentMax) / 2) + 1;
                makeGuess();
            } else if (clientMessage.hint === "less") {
                currentMax = Math.floor((currentMin + currentMax) / 2) - 1;
                makeGuess();
            } else if (clientMessage.hint === "correct") {
                console.log("Ура! Число отгадано.");
                process.exit(0);
            }
        }
    }

    function makeGuess() {
        const guess = Math.floor((currentMin + currentMax) / 2);
        console.log(`Попытка: ${guess}`);
        socket.send(JSON.stringify({ answer: guess }));
    }
})();
