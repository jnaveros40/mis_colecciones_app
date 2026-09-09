-- Tabla principal: Figuras
CREATE TABLE figuras (
    id SERIAL PRIMARY KEY,
    codigo_interno VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    serie VARCHAR(255),
    marca VARCHAR(255),
    fabricante VARCHAR(255),
    escala VARCHAR(50),
    altura_cm DECIMAL(5,2),
    fecha_lanzamiento DATE,
    fecha_compra DATE,
    precio_compra DECIMAL(10,2),
    moneda VARCHAR(10) DEFAULT 'COP',
    tienda VARCHAR(255),
    condicion VARCHAR(50),
    empaque VARCHAR(50),
    ubicacion VARCHAR(255),
    foto_url TEXT,
    accesorios_completos VARCHAR(20),
    venderia VARCHAR(20),
    valor_sentimental VARCHAR(20),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla secundaria: Accesorios
CREATE TABLE accesorios (
    id SERIAL PRIMARY KEY,
    figura_id INTEGER NOT NULL REFERENCES figuras(id) ON DELETE CASCADE,
    nombre_accesorio VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    estado VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_figuras_nombre ON figuras(nombre);
CREATE INDEX idx_figuras_serie ON figuras(serie);
CREATE INDEX idx_figuras_marca ON figuras(marca);
CREATE INDEX idx_figuras_codigo ON figuras(codigo_interno);
CREATE INDEX idx_accesorios_figura_id ON accesorios(figura_id);
CREATE INDEX idx_accesorios_estado ON accesorios(estado);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_figuras_updated_at BEFORE UPDATE ON figuras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accesorios_updated_at BEFORE UPDATE ON accesorios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vistas útiles

-- Vista: Figuras con conteo de accesorios
CREATE VIEW figuras_con_accesorios AS
SELECT 
    f.*,
    COUNT(a.id) as total_accesorios,
    COUNT(CASE WHEN a.estado = 'Faltante' THEN 1 END) as accesorios_faltantes
FROM figuras f
LEFT JOIN accesorios a ON f.id = a.figura_id
GROUP BY f.id;

-- Vista: Accesorios faltantes por figura
CREATE VIEW accesorios_faltantes AS
SELECT 
    f.codigo_interno,
    f.nombre as nombre_figura,
    f.serie,
    a.nombre_accesorio,
    a.tipo,
    a.notas
FROM accesorios a
JOIN figuras f ON a.figura_id = f.id
WHERE a.estado = 'Faltante'
ORDER BY f.codigo_interno;