let inputFiles = document.querySelector('#dropzone');
let previewFiles = document.querySelector('.preview');
let downloadFiles = document.querySelector('.download');

let inputColors = document.querySelectorAll('input[name="color"]');

let currentFilterColor = 'rgba(0, 10, 255, 0.5)';

inputColors.forEach(inputColor => {
    inputColor.addEventListener('change', () => {
        if (inputColor.checked) {
            currentFilterColor = inputColor.value;
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
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                previewFiles.appendChild(canvas);

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
function generateFilteredJPEG(canvas, fileName) {
    const link = document.createElement('a');
    link.download = fileName + '.jpg';
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
