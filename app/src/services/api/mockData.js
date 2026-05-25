
export const mockUser = {
    id: 1,
    username: 'Portfolio Guest',
    email: 'guest@example.com',
    role: 'admin',
    name: 'Portfolio Visitor'
};

export const mockTransformers = [
    { id: 1, numero_serie: 'TR-2024-001', puissance: 100, tension: '20kV/400V', type: 'Distribution', date_fabrication: '2024-01-15', client: 'EDF' },
    { id: 2, numero_serie: 'TR-2024-002', puissance: 160, tension: '20kV/400V', type: 'Distribution', date_fabrication: '2024-02-10', client: 'Senelec' },
    { id: 3, numero_serie: 'TR-2024-003', puissance: 250, tension: '20kV/400V', type: 'Puissance', date_fabrication: '2024-03-05', client: 'Sonelgaz' },
];

export const mockPVs = [
    { id: 1, transformerId: 1, type: 'Routine', date: '2024-01-20', conforme: true, operateur: 'M. Ali' },
    { id: 2, transformerId: 2, type: 'Type', date: '2024-02-15', conforme: true, operateur: 'J. Doe' },
];

export const mockStock = [
    { id: 1, designation: 'Huile minérale', quantite: 5000, unite: 'L' },
    { id: 2, designation: 'Cuivre ETP', quantite: 1200, unite: 'Kg' },
    { id: 3, designation: 'Tôle magnétique', quantite: 800, unite: 'Kg' },
];

export const mockNonConformities = [
    { id: 1, title: 'Fuite huile couvercle', severity: 'Moyenne', status: 'En cours', date: '2024-05-10' },
];

export const mockStudies = [
    { id: 1, name: 'Optimisation Pertes 160kVA', designer: 'Ing. Sarah', status: 'Terminé' },
];

export const mockFactures = [
    { id: 1, number: 'FAC-2024-001', client: 'EDF', amount: 15000, status: 'Payé' },
];

export const mockStats = {
    totalTransformers: 1250,
    conformityRate: 98.5,
    productionEfficiency: 92,
    activeOrders: 12
};

export const mockConformityTrend = [
    { month: 'Jan', rate: 97 },
    { month: 'Feb', rate: 98 },
    { month: 'Mar', rate: 96 },
    { month: 'Apr', rate: 99 },
    { month: 'May', rate: 98.5 },
];

export const mockConformityByPower = [
    { power: '100kVA', conforme: 120, nonConforme: 2 },
    { power: '160kVA', conforme: 85, nonConforme: 1 },
    { power: '250kVA', conforme: 60, nonConforme: 0 },
    { power: '400kVA', conforme: 45, nonConforme: 3 },
];
