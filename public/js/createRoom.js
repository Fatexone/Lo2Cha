document.addEventListener('DOMContentLoaded', () => {
    const isPrivateCheckbox = document.getElementById('isPrivate');
    const passwordField = document.getElementById('passwordField');

    if (isPrivateCheckbox) {
        // Afficher ou masquer le champ mot de passe en fonction de la case cochée
        isPrivateCheckbox.addEventListener('change', () => {
            if (isPrivateCheckbox.checked) {
                passwordField.style.display = 'block';
            } else {
                passwordField.style.display = 'none';
            }
        });
    }

    // Validation du formulaire pour s'assurer que les champs sont bien remplis
    const form = document.getElementById('createRoomForm');
    form.addEventListener('submit', (event) => {
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const password = document.getElementById('password').value;

        // Vérifier si le nom et la description sont remplis
        if (!name || !description) {
            event.preventDefault();
            alert('Veuillez remplir le nom et la description de la room.');
        }

        // Vérifier si le mot de passe est nécessaire
        if (isPrivateCheckbox.checked && !password) {
            event.preventDefault();
            alert('Veuillez définir un mot de passe pour la room privée.');
        }
    });
});
