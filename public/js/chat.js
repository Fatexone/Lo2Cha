document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const roomId = document.getElementById('roomId').value;
    const userId = document.getElementById('userId').value;
    const messagesList = document.getElementById('messages');
    const chatForm = document.getElementById('chatForm');
    const msgInput = document.getElementById('msgInput');

    // Charger les messages sauvegardés lorsqu'on rejoint la room
    fetch(`/rooms/${roomId}/messages`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            if (Array.isArray(messages)) {
                messages.forEach(displayMessage);
            } else {
                console.error("Les messages ne sont pas sous forme de tableau :", messages);
            }
        })
        .catch(error => console.error("Erreur lors du chargement des messages :", error));

    // Rejoindre la room via Socket.IO
    socket.emit('joinRoom', roomId);

    // Écouter les messages entrants
    socket.on('chatMessage', (msg) => {
        console.log('Message reçu :', msg);
        displayMessage(msg);
    });

    // Soumettre le formulaire de chat
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageContent = msgInput.value.trim();
        if (messageContent) {
            const messageData = {
                content: messageContent,
                roomId: roomId,
                senderId: userId
            };
            socket.emit('chatMessage', messageData);
            msgInput.value = '';
        }
    });

    // Fonction pour afficher les messages
    function displayMessage(msg) {
        const messageItem = document.createElement('li');
        messageItem.classList.add('message-item');
        messageItem.dataset.messageId = msg._id;

        const timestamp = formatDate(msg.createdAt || Date.now());
        messageItem.innerHTML = `
            <span class="timestamp">${timestamp}</span> - 
            <strong>${msg.sender?.username || 'Anonyme'}</strong>: 
            ${msg.content}
        `;

        messagesList.appendChild(messageItem);
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    // Fonction pour formater la date et l'heure
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleString(undefined, options);
    }
});
