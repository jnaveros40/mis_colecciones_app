-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS coleccion_usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Catálogos independientes (CRU - Activo/Inactivo)
CREATE TABLE IF NOT EXISTS coleccion_universos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES coleccion_usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coleccion_lineas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES coleccion_usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coleccion_marcas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES coleccion_usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coleccion_fabricantes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES coleccion_usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla principal de Figuras
CREATE TABLE IF NOT EXISTS coleccion_figuras (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES coleccion_usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    universo_id INTEGER REFERENCES coleccion_universos(id) ON DELETE SET NULL,
    linea_id INTEGER REFERENCES coleccion_lineas(id) ON DELETE SET NULL,
    baf BOOLEAN DEFAULT false,
    marca_id INTEGER REFERENCES coleccion_marcas(id) ON DELETE SET NULL,
    fabricante_id INTEGER REFERENCES coleccion_fabricantes(id) ON DELETE SET NULL,
    anio INTEGER,
    precio DECIMAL(10,2) DEFAULT 0,
    tamano_pulgadas DECIMAL(5,2),
    descripcion TEXT,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Desactivar RLS para evitar problemas de permisos
ALTER TABLE coleccion_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_universos DISABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_lineas DISABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_marcas DISABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_fabricantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE coleccion_figuras DISABLE ROW LEVEL SECURITY;
