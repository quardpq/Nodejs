const zmq = require("zeromq");
const [,, min, max] = process.argv.map(Number);
if (isNaN(min) || isNaN(max) || min >= max) {
    console.log("Usage: node game-client <min> <max>");
    process.exit(1);
}

const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;
console.log(`Загадано число: ${secretNumber}`);

const socket = new zmq.Reply();

(async () => {
    await socket.bind("tcp://127.0.0.1:3000");
    console.log("Game Client запущен и ожидает запросы на tcp://127.0.0.1:3000");

    for await (const message of socket) {
        const serverMessage = JSON.parse(message.toString());
        console.log("Сервер:", serverMessage);

        if (serverMessage.range) {
            socket.send(JSON.stringify({ range: `${min}-${max}` }));
        } else if (serverMessage.answer !== undefined) {
            const guess = serverMessage.answer;

            if (guess < secretNumber) {
                socket.send(JSON.stringify({ hint: "more" }));
            } else if (guess > secretNumber) {
                socket.send(JSON.stringify({ hint: "less" }));
            } else {
                console.log("Сервер угадал число!");
                socket.send(JSON.stringify({ hint: "correct" }));
                process.exit(0);
            }
        }
    }
})();
