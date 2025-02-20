import mongoose from "mongoose";

const peliculaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  imagen: { type: String, required: true }, // Ruta local en lugar de URL
  descripcion: { type: String, default: "Descripción no disponible" },
  formato: { type: String, default: "Formato no disponible" },
  creador: { type: String, default: "No disponible" },
  fecha: { type: String, default: "Fecha no disponible" },
  trailer: { type: String, default: "https://www.youtube.com/watch?v=jEm8FKcVLV4" }, 
});

const Pelicula = mongoose.model("Pelicula", peliculaSchema);
export default Pelicula;
