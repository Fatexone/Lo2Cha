document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');

    // Vérifiez que la div pour la carte existe
    if (!mapElement) return;

    // Récupérer le token d'accès Mapbox et les données des rooms
    const mapboxAccessToken = mapElement.getAttribute('data-mapbox-token');
    const roomsData = JSON.parse(mapElement.getAttribute('data-rooms'));

    // Vérifiez que le token est bien défini
    if (!mapboxAccessToken) {
        console.error('Token d\'accès Mapbox manquant');
        return;
    }

    // Initialiser Mapbox avec le token
    mapboxgl.accessToken = mapboxAccessToken;

    // Obtenir la position actuelle de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            let userCoords = [position.coords.longitude, position.coords.latitude];

            // Initialisation de la carte Mapbox
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: userCoords, // Centrer sur la position actuelle
                zoom: 14
            });

            // Ajouter un marqueur draggable pour l'utilisateur
            const userMarker = new mapboxgl.Marker({ color: 'red', draggable: true })
                .setLngLat(userCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Déplacez-moi pour corriger votre position'))
                .addTo(map);

            // Écouter les événements de drag du marqueur
            userMarker.on('dragend', () => {
                userCoords = userMarker.getLngLat(); // Récupérer la nouvelle position
                console.log('Nouvelle position utilisateur :', userCoords);
                // Vous pouvez maintenant utiliser userCoords pour les filtres ou autres actions
            });

            // Ajouter un marqueur pour chaque room avec des coordonnées valides
            roomsData.forEach(room => {
                if (room.location && room.location.coordinates && room.location.coordinates.length === 2) {
                    const [lng, lat] = room.location.coordinates;
                    const roomMarker = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(room.name))
                        .addTo(map);
                } else {
                    console.warn('Room sans coordonnées :', room);
                }
            });
        }, error => {
            console.error('Erreur lors de l\'obtention de la localisation de l\'utilisateur :', error);
        });
    } else {
        console.error('La géolocalisation n\'est pas prise en charge par ce navigateur.');
    }
});
