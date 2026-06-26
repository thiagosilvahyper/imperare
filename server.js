// server.js - Backend para IMPERARE (Vercel + Local)
// Versão 5.0 - Otimizado para Serverless

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`⚡ Vercel: ${isVercel ? 'SIM' : 'NÃO'}`);

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors({
    origin: function(origin, callback) {
        const allowed = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://localhost:5501',
            'http://localhost:5502',
            'http://127.0.0.1:5500',
            'https://imperare.vercel.app',
            'https://imperare-git-main.vercel.app',
            undefined
        ];
        if (!origin || allowed.includes(origin) || !isProduction) {
            callback(null, true);
        } else {
            callback(null, true); // Permitir todos em produção também
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// CONSTANTES E FUNÇÕES DE ARQUIVO (COM FALLBACK)
// ============================================================

// No Vercel, usamos /tmp para armazenamento temporário
const DATA_DIR = isVercel ? '/tmp/data' : path.join(__dirname, 'data');
const LOGS_DIR = isVercel ? '/tmp/logs' : path.join(__dirname, 'logs');
const TEAM_FILE = path.join(DATA_DIR, 'team.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// Dados padrão (fallback quando não há arquivos)
const DEFAULT_TEAM = [
    { id: 1, name: 'Thiago Silva', role: 'Fundador & CEO', photo: 'https://ui-avatars.com/api/?name=Thiago+Silva&background=c9a96e&color=fff&size=128', status: 'active', bio: 'Fundador da IMPERARE com mais de 20 anos de experiência.' },
    { id: 2, name: 'Diogo Costa', role: 'Sócio & Diretor Comercial', photo: 'https://ui-avatars.com/api/?name=Diogo+Costa&background=c9a96e&color=fff&size=128', status: 'active', bio: 'Sócio e diretor de projetos.' },
    { id: 3, name: 'Ana Ferreira', role: 'Arquiteta Sénior', photo: 'https://ui-avatars.com/api/?name=Ana+Ferreira&background=c9a96e&color=fff&size=128', status: 'active', bio: 'Arquiteta especializada em projetos residenciais.' }
];

const DEFAULT_PROPERTIES = [
    {
        id: 1,
        title: 'Apartamento T3 com Vista Mar',
        location: 'Lisboa',
        price: 450000,
        priceFormatted: '€450.000',
        area: 120,
        type: 'Apartamento',
        bedrooms: 3,
        bathrooms: 2,
        finish: 'luxo',
        appreciation: '+12%',
        pricePerSqm: '€4.800',
        status: 'disponivel',
        description: 'Espetacular apartamento T3 com vista panorâmica para o mar.',
        features: ['Piscina', 'Garagem', 'Vista Mar'],
        photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop'],
        featured: true
    },
    {
        id: 2,
        title: 'Villa de Luxo com Piscina',
        location: 'Algarve',
        price: 890000,
        priceFormatted: '€890.000',
        area: 280,
        type: 'Villa',
        bedrooms: 4,
        bathrooms: 3,
        finish: 'premium',
        appreciation: '+18%',
        pricePerSqm: '€6.200',
        status: 'disponivel',
        description: 'Deslumbrante villa de luxo com piscina privativa.',
        features: ['Piscina Privativa', 'Jardim', 'Vista Mar'],
        photos: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop'],
        featured: true
    },
    {
        id: 3,
        title: 'Cobertura com Terraço',
        location: 'Porto',
        price: 320000,
        priceFormatted: '€320.000',
        area: 95,
        type: 'Cobertura',
        bedrooms: 2,
        bathrooms: 2,
        finish: 'luxo',
        appreciation: '+15%',
        pricePerSqm: '€3.900',
        status: 'em_lancamento',
        description: 'Exclusiva cobertura com amplo terraço.',
        features: ['Terraço', 'Vista Cidade'],
        photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop'],
        featured: false
    }
];

// Funções de leitura/escrita com fallback
function ensureDir(dir) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (e) {
        console.log('⚠️ Não foi possível criar diretório:', dir);
    }
}

function readJSON(file, defaultValue) {
    try {
        ensureDir(path.dirname(file));
        if (!fs.existsSync(file)) {
            // Criar arquivo com valor padrão se não existir
            writeJSON(file, defaultValue);
            return defaultValue;
        }
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erro ao ler arquivo:', error);
        return defaultValue;
    }
}

function writeJSON(file, data) {
    try {
        ensureDir(path.dirname(file));
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Erro ao escrever arquivo:', error);
        return false;
    }
}

// ============================================================
// DADOS INICIAIS
// ============================================================

// Carregar dados com fallback
let teamData = readJSON(TEAM_FILE, DEFAULT_TEAM);
let propertiesData = readJSON(PROPERTIES_FILE, DEFAULT_PROPERTIES);

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function getNextId(data) {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.id || 0)) + 1;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================

const API_KEYS = {
    'admin': 'imperare2024',
    'api': 'imperare-api-key-2024'
};

function authenticate(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !Object.values(API_KEYS).includes(apiKey)) {
        return res.status(401).json({ error: 'Chave API inválida' });
    }
    next();
}

// ============================================================
// ROTAS PÚBLICAS
// ============================================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        version: '5.0',
        environment: process.env.NODE_ENV || 'development',
        vercel: isVercel,
        team: teamData.length,
        properties: propertiesData.length
    });
});

// GET - Listar membros da equipa
app.get('/api/team', (req, res) => {
    try {
        const sorted = [...teamData].sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar equipa' });
    }
});

// GET - Listar imóveis
app.get('/api/properties', (req, res) => {
    try {
        const { status, featured, limit } = req.query;
        let filtered = [...propertiesData];
        
        if (status) {
            const statusList = status.split(',');
            filtered = filtered.filter(p => statusList.includes(p.status));
        }
        
        if (featured === 'true') {
            filtered = filtered.filter(p => p.featured === true);
        }
        
        const limitNum = parseInt(limit) || 10;
        const result = filtered.slice(0, limitNum);
        
        res.json({
            data: result,
            total: filtered.length,
            limit: limitNum
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar imóveis' });
    }
});

// GET - Estatísticas
app.get('/api/stats', (req, res) => {
    try {
        res.json({
            team: {
                total: teamData.length,
                active: teamData.filter(m => m.status === 'active').length
            },
            properties: {
                total: propertiesData.length,
                available: propertiesData.filter(p => p.status === 'disponivel').length,
                sold: propertiesData.filter(p => p.status === 'vendido').length,
                launching: propertiesData.filter(p => p.status === 'em_lancamento').length
            },
            views: { total: 0 }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
});

// ============================================================
// ROTAS PROTEGIDAS - ADMIN
// ============================================================

app.use('/api/admin', authenticate);

// GET - Logs (simplificado para Vercel)
app.get('/api/admin/logs', (req, res) => {
    res.json({
        logs: ['📋 Logs disponíveis apenas no ambiente local'],
        count: 1,
        stats: { total: 1, errors: 0, warnings: 0 }
    });
});

// DELETE - Limpar logs
app.delete('/api/admin/logs', (req, res) => {
    res.json({ success: true, message: 'Logs limpos' });
});

// GET - Backup
app.get('/api/admin/backup', (req, res) => {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '5.0',
            team: teamData,
            properties: propertiesData
        };
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar backup' });
    }
});

// POST - Restaurar backup
app.post('/api/admin/backup/restore', (req, res) => {
    try {
        const data = req.body;
        if (data.team) {
            teamData = data.team;
            writeJSON(TEAM_FILE, teamData);
        }
        if (data.properties) {
            propertiesData = data.properties;
            writeJSON(PROPERTIES_FILE, propertiesData);
        }
        res.json({ success: true, message: 'Backup restaurado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao restaurar backup' });
    }
});

// ============================================================
// ROTAS PROTEGIDAS - EQUIPA
// ============================================================

// GET - Membro por ID
app.get('/api/team/:id', authenticate, (req, res) => {
    const member = teamData.find(m => m.id === parseInt(req.params.id));
    if (!member) {
        return res.status(404).json({ error: 'Membro não encontrado' });
    }
    res.json(member);
});

// POST - Adicionar membro
app.post('/api/team', authenticate, (req, res) => {
    try {
        const { name, role, photo, bio, linkedin, status } = req.body;
        
        if (!name || !role) {
            return res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
        }

        const newMember = {
            id: getNextId(teamData),
            name: name.trim(),
            role: role.trim(),
            photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c9a96e&color=fff&size=128`,
            bio: bio || '',
            linkedin: linkedin || '',
            status: status || 'active',
            order: teamData.length + 1,
            createdAt: new Date().toISOString()
        };

        teamData.push(newMember);
        writeJSON(TEAM_FILE, teamData);

        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar membro' });
    }
});

// PUT - Atualizar membro
app.put('/api/team/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = teamData.findIndex(m => m.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }

        const { name, role, photo, bio, linkedin, status } = req.body;
        
        if (name) teamData[index].name = name.trim();
        if (role) teamData[index].role = role.trim();
        if (photo) teamData[index].photo = photo;
        if (bio !== undefined) teamData[index].bio = bio;
        if (linkedin !== undefined) teamData[index].linkedin = linkedin;
        if (status) teamData[index].status = status;

        teamData[index].updatedAt = new Date().toISOString();
        writeJSON(TEAM_FILE, teamData);

        res.json(teamData[index]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar membro' });
    }
});

// DELETE - Remover membro
app.delete('/api/team/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const filtered = teamData.filter(m => m.id !== id);
        
        if (filtered.length === teamData.length) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }

        teamData = filtered;
        writeJSON(TEAM_FILE, teamData);

        res.json({ success: true, message: 'Membro removido' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover membro' });
    }
});

// ============================================================
// ROTAS PROTEGIDAS - IMÓVEIS
// ============================================================

// GET - Imóvel por ID
app.get('/api/properties/:id', authenticate, (req, res) => {
    const property = propertiesData.find(p => p.id === parseInt(req.params.id));
    if (!property) {
        return res.status(404).json({ error: 'Imóvel não encontrado' });
    }
    res.json(property);
});

// POST - Adicionar imóvel
app.post('/api/properties', authenticate, (req, res) => {
    try {
        const { title, location, price, area, type, finish, bedrooms, bathrooms, status, description, features, photos, featured } = req.body;

        if (!title || !location || !price || !area || !type || !finish) {
            return res.status(400).json({ error: 'Campos obrigatórios em falta' });
        }

        if (!photos || photos.length === 0) {
            return res.status(400).json({ error: 'Adicione pelo menos uma foto' });
        }

        const newProperty = {
            id: getNextId(propertiesData),
            title: title.trim(),
            location: location.trim(),
            price: parseFloat(price),
            priceFormatted: formatCurrency(parseFloat(price)),
            area: parseFloat(area),
            type: type.trim(),
            bedrooms: parseInt(bedrooms) || 0,
            bathrooms: parseInt(bathrooms) || 0,
            finish: finish.trim(),
            appreciation: req.body.appreciation || 'N/A',
            pricePerSqm: req.body.pricePerSqm || 'N/A',
            status: status || 'disponivel',
            description: description || '',
            features: features || [],
            photos: photos,
            featured: featured || false,
            createdAt: new Date().toISOString()
        };

        propertiesData.push(newProperty);
        writeJSON(PROPERTIES_FILE, propertiesData);

        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar imóvel' });
    }
});

// PUT - Atualizar imóvel
app.put('/api/properties/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = propertiesData.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        const updates = req.body;
        
        if (updates.title) propertiesData[index].title = updates.title.trim();
        if (updates.location) propertiesData[index].location = updates.location.trim();
        if (updates.price) {
            propertiesData[index].price = parseFloat(updates.price);
            propertiesData[index].priceFormatted = formatCurrency(parseFloat(updates.price));
        }
        if (updates.area) propertiesData[index].area = parseFloat(updates.area);
        if (updates.type) propertiesData[index].type = updates.type.trim();
        if (updates.bedrooms !== undefined) propertiesData[index].bedrooms = parseInt(updates.bedrooms);
        if (updates.bathrooms !== undefined) propertiesData[index].bathrooms = parseInt(updates.bathrooms);
        if (updates.finish) propertiesData[index].finish = updates.finish.trim();
        if (updates.status) propertiesData[index].status = updates.status;
        if (updates.description !== undefined) propertiesData[index].description = updates.description;
        if (updates.features) propertiesData[index].features = updates.features;
        if (updates.photos) propertiesData[index].photos = updates.photos;
        if (updates.featured !== undefined) propertiesData[index].featured = updates.featured;

        propertiesData[index].updatedAt = new Date().toISOString();
        writeJSON(PROPERTIES_FILE, propertiesData);

        res.json(propertiesData[index]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar imóvel' });
    }
});

// DELETE - Remover imóvel
app.delete('/api/properties/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const filtered = propertiesData.filter(p => p.id !== id);
        
        if (filtered.length === propertiesData.length) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        propertiesData = filtered;
        writeJSON(PROPERTIES_FILE, propertiesData);

        res.json({ success: true, message: 'Imóvel removido' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover imóvel' });
    }
});

// ============================================================
// ROTA PARA O FRONTEND
// ============================================================

app.get('/', (req, res) => {
    res.send('🚀 IMPERARE API - Online');
});

// ============================================================
// TRATAMENTO DE ERROS 404
// ============================================================

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// ============================================================
// EXPORTAR PARA VERCEL / INICIAR LOCAL
// ============================================================

// Exportar o app para a Vercel (serverless)
module.exports = app;

// Iniciar servidor local se não estiver na Vercel
if (!isVercel) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('🚀 IMPERARE SERVER v5.0');
        console.log('========================================');
        console.log(`📍 Servidor: http://localhost:${PORT}`);
        console.log(`👥 Equipa: ${teamData.length} membros`);
        console.log(`🏠 Imóveis: ${propertiesData.length} cadastrados`);
        console.log(`📁 Dados: ${DATA_DIR}`);
        console.log('========================================');
        console.log('✅ Servidor pronto para uso!');
    });
}