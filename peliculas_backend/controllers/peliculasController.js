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



export const obtenerPeliculas = async (req, res) => {
  try {
    const peliculas = await Pelicula.find();
    res.json(peliculas);
  } catch (error) {
    console.error("Error al obtener las películas:", error);
    res.status(500).json({ error: "Error al obtener las películas." });
  }
};

export const agregarPelicula = async (req, res) => {
  try {
      console.log("Datos recibidos en req.body:", req.body);
      console.log("Archivo recibido en req.file:", req.file);

      const { titulo, descripcion, formato, creador, fecha, trailer } = req.body;

      if (!req.file) {
          console.error("Error: No se recibió una imagen.");
          return res.status(400).json({ error: "La imagen es obligatoria" });
      }

      if (!titulo || !descripcion || !formato || !creador || !fecha) {
          console.error("Error: Faltan datos obligatorios.");
          return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      const nuevaPelicula = new Pelicula({
          titulo,
          descripcion,
          formato,
          creador,
          fecha,
          imagen: `/img/${req.file.filename}`,
          trailer: trailer || undefined 
      });

      await nuevaPelicula.save();
      console.log("Película guardada con éxito:", nuevaPelicula);
      res.status(201).json(nuevaPelicula);
  } catch (error) {
      console.error("Error al agregar la película:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
};




export const actualizarPelicula = async (req, res) => {
  try {
      const id = req.params.id;
      const pelicula = await Pelicula.findById(id);

      if (!pelicula) {
          return res.status(404).json({ error: "Película no encontrada" });
      }

      // Si se sube una nueva imagen, reemplazar la anterior
      if (req.file) {
          const nuevaRutaImagen = `/img/${req.file.filename}`;
          const imagenAnterior = pelicula.imagen ? path.join(__dirname, "../", pelicula.imagen) : null;

          // Borrar la imagen anterior si exisia
          if (imagenAnterior && fs.existsSync(imagenAnterior)) {
              fs.unlinkSync(imagenAnterior);
          }

          pelicula.imagen = nuevaRutaImagen; // Asignar la nueva imagen
      }

      // Actualizar otros campos si estan en el body
      if (req.body.titulo) pelicula.titulo = req.body.titulo;
      if (req.body.descripcion) pelicula.descripcion = req.body.descripcion;
      if (req.body.formato) pelicula.formato = req.body.formato;
      if (req.body.creador) pelicula.creador = req.body.creador;
      if (req.body.fecha) pelicula.fecha = req.body.fecha;

      await pelicula.save();
      res.status(200).json({ mensaje: "Pelicula actualizada correctamente", pelicula });
  } catch (error) {
      console.error("Error al actualizar la pelicula:", error);
      res.status(500).json({ error: "Error al actualizar la película" });
  }
};



export const obtenerPeliculaPorId = async (req, res) => {
  try {
      const pelicula = await Pelicula.findById(req.params.id);
      if (!pelicula) {
          return res.status(404).json({ error: "Pelicula no encontrada" });
      }
      res.json(pelicula);
  } catch (error) {
      console.error("Error al obtener la película:", error);
      res.status(500).json({ error: "Error al obtener la película." });
  }
};


// Eliminar una película por ID
export const eliminarPelicula = async (req, res) => {
  try {
    const pelicula = await Pelicula.findById(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: "Película no encontrada" });
    }

    // Eliminar la imagen asociada
    const imagePath = path.join(__dirname, "../", pelicula.imagen);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Pelicula.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pelicula eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la pelicula:", error);
    res.status(500).json({ error: "Error al eliminar la película." });
  }
};