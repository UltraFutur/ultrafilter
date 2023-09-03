let inputFiles = document.querySelector('#dropzone');
let previewFiles = document.querySelector('.preview');
let downloadFiles = document.querySelector('.download');

let inputColors = document.querySelectorAll('input[name="color"]');
let inputColorsSpace = document.querySelectorAll('input[name="color-space"]');

let currentFilterColor = 'rgba(235, 255, 0, 0.5)';
let currentColorSpace = 'rgb';

inputColors.forEach(inputColor => {
    inputColor.addEventListener('change', () => {
        if (inputColor.checked) {
            currentFilterColor = inputColor.value;
        }
    });
});

inputColorsSpace.forEach(inputColorSpace => {
    inputColorSpace.addEventListener('change', () => {
        if (inputColorSpace.checked) {
            currentColorSpace = inputColorSpace.value;
        }
    });
});

inputFiles.addEventListener('dragover', (e) => {
    e.preventDefault();
    inputFiles.classList.add('dragover');
});

inputFiles.addEventListener('dragleave', () => {
    inputFiles.classList.remove('dragover');
});

inputFiles.addEventListener('drop', (e) => {
    e.preventDefault();
    inputFiles.classList.remove('dragover');

    let files = e.dataTransfer.files;

    console.log('Files:', files);

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();

        reader.onload = function(e) {
            let img = new Image();

            img.onload = function() {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let container = document.createElement('div');
                container.classList.add('image-container');
                let deleteButton = document.createElement('button');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                // Convertir l'image en nuance de gris
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    let grey = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = data[i + 1] = data[i + 2] = grey;
                }

                ctx.putImageData(imageData, 0, 0);

                // Appliquer un filtre de couleur avec un mode de fusion
                ctx.globalCompositeOperation = 'color'; //mode de fusion
                ctx.fillStyle = currentFilterColor;; // couleur du filtre
                
                // Choix de l'espace colorimétrique
                if (currentColorSpace === 'rvb') {
                    ctx.fillStyle = currentFilterColor;
                } else if (currentColorSpace === 'cmjn') {
                    const RVBBlue = [0, 10, 255, 0.5];
                    const RVBYellow = [235, 255, 0, 0.5];

                    const CMJNBlue = RVBToCMJN(...RVBBlue);
                    const CMJNYellow = RVBToCMJN(...RVBYellow);

                    // Appliquer la couleur CMJN en fonction de la couleur choisie
                    if (currentFilterColor === 'blue') {
                        ctx.fillStyle = `rgba(${CMJNBlue[0] * 100}%, ${CMJNBlue[1] * 100}%, ${CMJNBlue[2] * 100}%, ${CMJNBlue[3]})`;
                    } else if (currentFilterColor === 'yellow') {
                        ctx.fillStyle = `rgba(${CMJNYellow[0] * 100}%, ${CMJNYellow[1] * 100}%, ${CMJNYellow[2] * 100}%, ${CMJNYellow[3]})`;
                    }
                }
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                container.appendChild(canvas);
                container.appendChild(deleteButton);
                previewFiles.appendChild(container);

                // Créer un bouton de suppression
                deleteButton.classList.add('delete');
                // Ajouter un écouteur d'événement pour la suppression
                deleteButton.addEventListener('click', () => {
                    container.removeChild(canvas);
                    container.removeChild(deleteButton);
                    lauchDownload();
                });

                lauchDownload();
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
});

downloadFiles.addEventListener('click', () => {

    let filteredImages = previewFiles.querySelectorAll('canvas');
    
    filteredImages.forEach((canvas, index) => {
        generateFilteredJPEG(canvas, 'image_' + (index + 1));
    });
});

// Génère un objet Blob à partir du contenu HTML
function generateFilteredJPEG(canvas) {
    let imageIndex = 1;
    const link = document.createElement('a');
    link.download = `image_${imageIndex}.jpg`;
    canvas.toBlob(blob => {
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/jpeg', 0.8);
}

// Fonction pour mettre à jour la visibilité du bouton de téléchargement
function lauchDownload() {
    let filteredImages = previewFiles.querySelectorAll('canvas');
    if (filteredImages.length > 0) {
        downloadFiles.classList.remove('hide');
        downloadFiles.classList.add('show'); // Ajoute la classe "show"
    } else {
        downloadFiles.classList.add('hide');
        downloadFiles.classList.remove('show'); // Supprime la classe "show"
    }
}

// Fonction pour télécharger une image filtrée individuellement
function downloadFilteredCanvas(canvas) {
    let imageIndex = 1;
    const link = document.createElement('a');
    link.download = `image_${imageIndex}.jpg`;
    canvas.toBlob(blob => {
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/jpeg', 0.8);
}

previewFiles.addEventListener('click', (event) => {
    const clickedElement = event.target;
    if (clickedElement.tagName === 'CANVAS') {
        downloadFilteredCanvas(clickedElement);
    }
});

// Conversion des couleurs en CMJN
function RVBToCMJN(r, v, b, a) {
    const c = 1 - r / 255;
    const m = 1 - v / 255;
    const j = 1 - b / 255;
    const n = Math.min(c, m, j);
    
    if (n === 1) {
        return [0, 0, 0, 1]; // Noir pur
    }
    
    return [
        (c - n) / (1 - n),
        (m - n) / (1 - n),
        (j - n) / (1 - n),
        n
    ];
}
