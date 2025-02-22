import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Importar para obtener la ruta correcta

import { 
    llenarPeliculasDesdeMarvel, 
    obtenerPeliculas, 
    agregarPelicula, 
    actualizarPelicula, 
    eliminarPelicula,  
    obtenerPeliculaPorId 
} from '../controllers/peliculasController.js';

const router = express.Router();

// Obtener la ruta absoluta del directorio "peliculas_backend"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../img"); // Asegura que esté dentro de peliculas_backend

// Crear la carpeta "img" si nopara no tener error
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para guardar imágenes en "peliculas_backend/img"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Guarda en la carpeta correcta
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Mantener el nombre original con timestamp
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por imagen
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes en formato JPEG, JPG, PNG o GIF"));
    }
});

// Rutas
router.get('/', obtenerPeliculas);
router.post('/', upload.single("imagen"), agregarPelicula);
router.put('/:id', upload.single("imagen"), actualizarPelicula);
router.delete('/:id', eliminarPelicula);
router.get('/llenar', llenarPeliculasDesdeMarvel);
router.get('/:id', obtenerPeliculaPorId);

export default router;
