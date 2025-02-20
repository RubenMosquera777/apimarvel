import axios from "axios";
import Pelicula from "../models/Pelicula.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_KEY = "911260688fd59a1280dd774f7d0e358f";
const PRIVATE_KEY = "5da1dae59c2f0abb37d7677f8c51c0b7f6ca1804";
const IMG_DIR = path.join(__dirname, "../img"); // Carpeta donde se guardarán las imágenes

// Crear la carpeta img si no existe
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

// para descargar imágenes y guardarlas localmente
const descargarImagen = async (url, nombreArchivo) => {
  try {
    const response = await axios({
      url,
      responseType: "arraybuffer",
    });
    const filePath = path.join(IMG_DIR, nombreArchivo);
    fs.writeFileSync(filePath, response.data);
    return `img/${nombreArchivo}`; // Ruta relativa
  } catch (error) {
    console.error("Error al descargar la imagen:", error);
    return "img/default.jpg"; // Imagen por defecto en caso de error
  }
};

// Llenar la base de datos con películas desde Marvel y descargar imágenes
export const llenarPeliculasDesdeMarvel = async () => {
  
  try {
    const ts = new Date().getTime().toString();
    const hash = crypto.createHash("md5").update(ts + PRIVATE_KEY + PUBLIC_KEY).digest("hex");

    const response = await axios.get(`https://gateway.marvel.com/v1/public/comics`, {
      params: { ts, apikey: PUBLIC_KEY, hash },
    });

    const peliculas = await Promise.all(response.data.data.results.map(async (comic) => {
      const imageUrl = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
      const imageName = `${crypto.createHash("md5").update(imageUrl).digest("hex")}.${comic.thumbnail.extension}`;
      const localImagePath = await descargarImagen(imageUrl, imageName);

      return {
        titulo: comic.title,
        imagen: localImagePath,
        descripcion: comic.description,
        formato: comic.format,
        creador: comic.creators.items.map((c) => c.name).join(", "),
        fecha: comic.dates.find((date) => date.type === "onsaleDate")?.date,
      };
    }));

    await Pelicula.insertMany(peliculas);
    console.log("Películas de Marvel guardadas correctamente.");
  } catch (error) {
    console.error("Error al obtener y guardar los datos de Marvel:", error);
  }
  
};  

