document.addEventListener('DOMContentLoaded', () => {
    // Charger le token depuis les variables d'environnement
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [2.3522, 48.8566], // Paris par défaut
        zoom: 14
    });

    // Gérer les images manquantes pour les styles personnalisés
    map.on('styleimagemissing', (e) => {
        const id = e.id;
        if (id === 'rectangle-yellow-5' || id === 'rectangle-yellow-6') {
            map.loadImage('/images/rectangle-yellow.png', (error, image) => {
                if (error) {
                    console.error('Erreur lors du chargement de l’image de secours:', error);
                    return;
                }
                map.addImage(id, image, { sdf: true });
            });
        }
    });

    // Marqueur pour la localisation actuelle
    let userMarker = new mapboxgl.Marker({ color: 'blue' });

    // Fonction pour créer une room avec la localisation
    function createRoomWithLocation(latitude, longitude) {
        fetch('/rooms/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Room créée avec succès:", data);
            const userCoordinates = [longitude, latitude];
            map.setCenter(userCoordinates);
            userMarker.setLngLat(userCoordinates).addTo(map);
        })
        .catch(error => console.error('Erreur lors de la création de la room:', error));
    }

    // Fonction déclenchée lors du clic sur le bouton de création de room
    document.getElementById('createRoomBtn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    createRoomWithLocation(latitude, longitude);
                },
                (error) => {
                    console.error("Erreur de géolocalisation:", error.message);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            alert("Géolocalisation refusée par l'utilisateur.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert("La position n'est pas disponible.");
                            break;
                        case error.TIMEOUT:
                            alert("Le délai de demande de géolocalisation a expiré.");
                            break;
                        default:
                            alert("Une erreur de géolocalisation inconnue s'est produite.");
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
        } else {
            console.log("La géolocalisation n'est pas prise en charge par ce navigateur.");
        }
    });
});
