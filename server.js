// server.js - Backend para IMPERARE (Vercel + Local)
// Versão 5.0 - Otimizado para Serverless com fallback de memória

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
            'https://server-eta-five-15.vercel.app',
            undefined
        ];
        if (!origin || allowed.includes(origin) || !isProduction) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// DIRETÓRIOS E FICHEIROS DE DADOS (ADAPTADO PARA VERCEL)
// ============================================================

const DATA_DIR = path.join(__dirname, 'data');
const LOGS_DIR = path.join(__dirname, 'logs');
const BACKUP_DIR = path.join(__dirname, 'backups');

const TEAM_FILE = path.join(DATA_DIR, 'team.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const LOG_FILE = path.join(LOGS_DIR, 'server.log');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Dados em memória como fallback (Vercel)
let memoryTeamData = [];
let memoryPropertiesData = [];

// ============================================================
// DADOS PADRÃO (FALLBACK)
// ============================================================

const DEFAULT_TEAM = [
    {
        id: 1,
        name: 'Thiago Silva',
        role: 'Fundador & CEO',
        photo: 'https://ui-avatars.com/api/?name=Thiago+Silva&background=c9a96e&color=fff&size=128',
        bio: 'Fundador da IMPERARE com mais de 20 anos de experiência.',
        status: 'active',
        order: 1,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Diogo Costa',
        role: 'Sócio & Diretor Comercial',
        photo: 'https://ui-avatars.com/api/?name=Diogo+Costa&background=c9a96e&color=fff&size=128',
        bio: 'Sócio e diretor de projetos, especialista em arquitetura.',
        status: 'active',
        order: 2,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Ana Ferreira',
        role: 'Arquiteta Sénior',
        photo: 'https://ui-avatars.com/api/?name=Ana+Ferreira&background=c9a96e&color=fff&size=128',
        bio: 'Arquiteta especializada em projetos residenciais de alto padrão.',
        status: 'active',
        order: 3,
        createdAt: new Date().toISOString()
    }
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
        description: 'Espetacular apartamento T3 com vista panorâmica para o mar. Localizado num dos bairros mais exclusivos de Lisboa.',
        features: ['Piscina', 'Garagem', 'Vista Mar', 'Ar Condicionado'],
        photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop'],
        featured: true,
        order: 1,
        createdAt: new Date().toISOString()
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
        description: 'Deslumbrante villa de luxo com piscina privativa e amplos espaços exteriores. Ideal para quem procura privacidade e conforto.',
        features: ['Piscina Privativa', 'Jardim', 'Vista Mar', 'Garagem'],
        photos: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop'],
        featured: true,
        order: 2,
        createdAt: new Date().toISOString()
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
        description: 'Exclusiva cobertura com amplo terraço e vista para a cidade do Porto. Acabamentos de luxo e design contemporâneo.',
        features: ['Terraço', 'Vista Cidade', 'Ar Condicionado', 'Garagem'],
        photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop'],
        featured: false,
        order: 3,
        createdAt: new Date().toISOString()
    }
];

// ============================================================
// FUNÇÕES SEGURAS DE LEITURA/ESCRITA
// ============================================================

// Criar diretórios de forma segura
function ensureDirectories() {
    const dirs = [DATA_DIR, LOGS_DIR, BACKUP_DIR];
    dirs.forEach(dir => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Diretório criado: ${dir}`);
            }
        } catch (e) {
            console.log(`⚠️ Não foi possível criar diretório (Vercel): ${dir}`);
        }
    });
}

// Ler JSON de forma segura
function safeReadJSON(filePath, defaultData) {
    try {
        ensureDirectories();
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        // Tenta escrever o ficheiro com dados padrão
        try {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        } catch (writeErr) {
            console.log(`⚠️ Não foi possível escrever ${path.basename(filePath)} (Vercel)`);
        }
        return defaultData;
    } catch (error) {
        console.log(`⚠️ Erro ao ler ${path.basename(filePath)}, usando dados em memória.`);
        return defaultData;
    }
}

// Escrever JSON de forma segura
function safeWriteJSON(filePath, data) {
    try {
        ensureDirectories();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.log(`⚠️ Não foi possível escrever ${path.basename(filePath)} (Vercel Read-Only)`);
        return false;
    }
}

// Função para escrever logs
function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    try {
        ensureDirectories();
        fs.appendFileSync(LOG_FILE, logMessage + '\n');
    } catch (error) {
        // Ignora erro na Vercel
    }
}

// Função para obter logs
function getLogs(limit = 100) {
    try {
        if (!fs.existsSync(LOG_FILE)) return ['📋 Sem logs disponíveis'];
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        return content.split('\n').filter(Boolean).slice(-limit);
    } catch (error) {
        return ['📋 Logs disponíveis apenas no ambiente local'];
    }
}

// ============================================================
// INICIALIZAR DADOS
// ============================================================

// Criar diretórios
ensureDirectories();

// Carregar dados com fallback
memoryTeamData = safeReadJSON(TEAM_FILE, DEFAULT_TEAM);
memoryPropertiesData = safeReadJSON(PROPERTIES_FILE, DEFAULT_PROPERTIES);

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
    'api': 'imperare-api-key-2024',
    'editor': 'imperare-editor-2024'
};

function authenticate(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !Object.values(API_KEYS).includes(apiKey)) {
        return res.status(401).json({ error: 'Chave API inválida' });
    }
    next();
}

// ============================================================
// ROTA PRINCIPAL - TESTE
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🚀 IMPERARE API Backend a funcionar com sucesso na Vercel!',
        version: '5.0.0',
        environment: process.env.NODE_ENV || 'development',
        vercel: isVercel,
        teamCount: memoryTeamData.length,
        propertiesCount: memoryPropertiesData.length,
        timestamp: new Date().toISOString()
    });
});

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
        team: memoryTeamData.length,
        properties: memoryPropertiesData.length,
        uptime: process.uptime ? Math.floor(process.uptime()) : 0
    });
});

// GET - Listar membros da equipa
app.get('/api/team', (req, res) => {
    try {
        const sorted = [...memoryTeamData].sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar equipa' });
    }
});

// GET - Listar imóveis
app.get('/api/properties', (req, res) => {
    try {
        const { status, featured, limit, location } = req.query;
        let filtered = [...memoryPropertiesData];
        
        if (status) {
            const statusList = status.split(',');
            filtered = filtered.filter(p => statusList.includes(p.status));
        }
        
        if (featured === 'true') {
            filtered = filtered.filter(p => p.featured === true);
        }
        
        if (location) {
            filtered = filtered.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
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
                total: memoryTeamData.length,
                active: memoryTeamData.filter(m => m.status === 'active').length,
                inactive: memoryTeamData.filter(m => m.status === 'inactive').length
            },
            properties: {
                total: memoryPropertiesData.length,
                available: memoryPropertiesData.filter(p => p.status === 'disponivel').length,
                sold: memoryPropertiesData.filter(p => p.status === 'vendido').length,
                reserved: memoryPropertiesData.filter(p => p.status === 'reservado').length,
                launching: memoryPropertiesData.filter(p => p.status === 'em_lancamento').length,
                featured: memoryPropertiesData.filter(p => p.featured === true).length
            },
            views: {
                total: memoryPropertiesData.reduce((sum, p) => sum + (p.views || 0), 0)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
});

// ============================================================
// ROTAS PROTEGIDAS - ADMIN
// ============================================================

app.use('/api/admin', authenticate);

// GET - Logs
app.get('/api/admin/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getLogs(limit);
    res.json({ logs, count: logs.length });
});

// DELETE - Limpar logs
app.delete('/api/admin/logs', (req, res) => {
    try {
        fs.writeFileSync(LOG_FILE, '');
        writeLog('🗑️ Logs limpos manualmente');
        res.json({ success: true, message: 'Logs limpos com sucesso' });
    } catch (error) {
        res.json({ success: true, message: 'Logs limpos (em memória)' });
    }
});

// GET - Backup
app.get('/api/admin/backup', (req, res) => {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '5.0',
            team: memoryTeamData,
            properties: memoryPropertiesData,
            totalItems: memoryTeamData.length + memoryPropertiesData.length
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
            memoryTeamData = data.team;
            safeWriteJSON(TEAM_FILE, memoryTeamData);
        }
        if (data.properties) {
            memoryPropertiesData = data.properties;
            safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
        }
        writeLog('💾 Backup restaurado');
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
    const member = memoryTeamData.find(m => m.id === parseInt(req.params.id));
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
            id: getNextId(memoryTeamData),
            name: name.trim(),
            role: role.trim(),
            photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c9a96e&color=fff&size=128`,
            bio: bio || '',
            linkedin: linkedin || '',
            status: status || 'active',
            order: memoryTeamData.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        memoryTeamData.push(newMember);
        safeWriteJSON(TEAM_FILE, memoryTeamData);
        writeLog(`👤 Membro adicionado: ${name}`);

        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar membro' });
    }
});

// PUT - Atualizar membro
app.put('/api/team/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = memoryTeamData.findIndex(m => m.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }

        const { name, role, photo, bio, linkedin, status } = req.body;
        
        if (name) memoryTeamData[index].name = name.trim();
        if (role) memoryTeamData[index].role = role.trim();
        if (photo) memoryTeamData[index].photo = photo;
        if (bio !== undefined) memoryTeamData[index].bio = bio;
        if (linkedin !== undefined) memoryTeamData[index].linkedin = linkedin;
        if (status) memoryTeamData[index].status = status;

        memoryTeamData[index].updatedAt = new Date().toISOString();
        safeWriteJSON(TEAM_FILE, memoryTeamData);
        writeLog(`✏️ Membro atualizado: ${memoryTeamData[index].name}`);

        res.json(memoryTeamData[index]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar membro' });
    }
});

// DELETE - Remover membro
app.delete('/api/team/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const member = memoryTeamData.find(m => m.id === id);
        
        if (!member) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }

        memoryTeamData = memoryTeamData.filter(m => m.id !== id);
        safeWriteJSON(TEAM_FILE, memoryTeamData);
        writeLog(`🗑️ Membro removido: ${member.name}`);

        res.json({ success: true, message: 'Membro removido', member });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover membro' });
    }
});

// ============================================================
// ROTAS PROTEGIDAS - IMÓVEIS
// ============================================================

// GET - Imóvel por ID
app.get('/api/properties/:id', authenticate, (req, res) => {
    const property = memoryPropertiesData.find(p => p.id === parseInt(req.params.id));
    if (!property) {
        return res.status(404).json({ error: 'Imóvel não encontrado' });
    }
    
    // Incrementar views
    property.views = (property.views || 0) + 1;
    safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
    
    res.json(property);
});

// POST - Adicionar imóvel
app.post('/api/properties', authenticate, (req, res) => {
    try {
        const { title, location, price, area, type, finish, bedrooms, bathrooms, status, description, features, photos, featured } = req.body;

        if (!title || !location || !price || !area || !type || !finish) {
            return res.status(400).json({ error: 'Campos obrigatórios: título, localização, preço, área, tipo e acabamento' });
        }

        if (!photos || photos.length === 0) {
            return res.status(400).json({ error: 'Adicione pelo menos uma foto' });
        }

        if (photos.length > 10) {
            return res.status(400).json({ error: 'Máximo de 10 fotos permitido' });
        }

        const newProperty = {
            id: getNextId(memoryPropertiesData),
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
            views: 0,
            order: memoryPropertiesData.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        memoryPropertiesData.push(newProperty);
        safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
        writeLog(`🏠 Imóvel adicionado: ${title}`);

        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar imóvel' });
    }
});

// PUT - Atualizar imóvel
app.put('/api/properties/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = memoryPropertiesData.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        const updates = req.body;
        
        if (updates.title) memoryPropertiesData[index].title = updates.title.trim();
        if (updates.location) memoryPropertiesData[index].location = updates.location.trim();
        if (updates.price) {
            memoryPropertiesData[index].price = parseFloat(updates.price);
            memoryPropertiesData[index].priceFormatted = formatCurrency(parseFloat(updates.price));
        }
        if (updates.area) memoryPropertiesData[index].area = parseFloat(updates.area);
        if (updates.type) memoryPropertiesData[index].type = updates.type.trim();
        if (updates.bedrooms !== undefined) memoryPropertiesData[index].bedrooms = parseInt(updates.bedrooms);
        if (updates.bathrooms !== undefined) memoryPropertiesData[index].bathrooms = parseInt(updates.bathrooms);
        if (updates.finish) memoryPropertiesData[index].finish = updates.finish.trim();
        if (updates.appreciation) memoryPropertiesData[index].appreciation = updates.appreciation;
        if (updates.pricePerSqm) memoryPropertiesData[index].pricePerSqm = updates.pricePerSqm;
        if (updates.status) memoryPropertiesData[index].status = updates.status;
        if (updates.description !== undefined) memoryPropertiesData[index].description = updates.description;
        if (updates.features) memoryPropertiesData[index].features = updates.features;
        if (updates.photos) {
            if (updates.photos.length > 10) {
                return res.status(400).json({ error: 'Máximo de 10 fotos permitido' });
            }
            memoryPropertiesData[index].photos = updates.photos;
        }
        if (updates.featured !== undefined) memoryPropertiesData[index].featured = updates.featured;

        memoryPropertiesData[index].updatedAt = new Date().toISOString();
        safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
        writeLog(`✏️ Imóvel atualizado: ${memoryPropertiesData[index].title}`);

        res.json(memoryPropertiesData[index]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar imóvel' });
    }
});

// DELETE - Remover imóvel
app.delete('/api/properties/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const property = memoryPropertiesData.find(p => p.id === id);
        
        if (!property) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        memoryPropertiesData = memoryPropertiesData.filter(p => p.id !== id);
        safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
        writeLog(`🗑️ Imóvel removido: ${property.title}`);

        res.json({ success: true, message: 'Imóvel removido', property });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover imóvel' });
    }
});

// POST - Reordenar imóveis
app.post('/api/properties/reorder', authenticate, (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Lista de IDs inválida' });
        }

        const ordered = ids.map(id => memoryPropertiesData.find(p => p.id === id)).filter(Boolean);

        if (ordered.length !== ids.length) {
            return res.status(400).json({ error: 'Alguns IDs não foram encontrados' });
        }

        ordered.forEach((property, index) => {
            property.order = index + 1;
            property.updatedAt = new Date().toISOString();
        });

        safeWriteJSON(PROPERTIES_FILE, memoryPropertiesData);
        writeLog('🔄 Ordem dos imóveis reordenada');

        res.json({ success: true, message: 'Ordem atualizada', properties: ordered });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao reordenar imóveis' });
    }
});

// ============================================================
// TRATAMENTO DE ERROS 404
// ============================================================

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});

// ============================================================
// EXPORTAR PARA VERCEL / INICIAR LOCAL
// ============================================================

// Exportar o app para a Vercel (serverless)
module.exports = app;

// Iniciar servidor local se não estiver na Vercel
if (!isVercel && process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('🚀 IMPERARE SERVER v5.0');
        console.log('========================================');
        console.log(`📍 Servidor: http://localhost:${PORT}`);
        console.log(`👥 Equipa: ${memoryTeamData.length} membros`);
        console.log(`🏠 Imóveis: ${memoryPropertiesData.length} cadastrados`);
        console.log(`📁 Dados: ${DATA_DIR}`);
        console.log('========================================');
        console.log('✅ Servidor pronto para uso!');
        console.log('🔑 API Key: imperare2024');
        console.log('========================================');
    });
}