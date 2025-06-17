export const specialtyIcons: Record<string, string> = {
  'Tim mạch': 'fa-solid fa-heart-pulse',
  'Da liễu': 'fa-solid fa-layer-group',
  'Nhi khoa': 'fa-solid fa-child',
  'Thần kinh': 'fa-solid fa-brain',
  'Ung bướu': 'fa-solid fa-ribbon',
  'Chấn thương chỉnh hình': 'fa-solid fa-bone',
  'Mắt': 'fa-solid fa-eye',
  'Nha khoa': 'fa-solid fa-tooth',
  'Phụ sản': 'fa-solid fa-person-pregnant',
  'Tiết niệu': 'fa-solid fa-droplet',
  'Tiêu hoá': 'fa-solid fa-bacteria',
  'Nội tiết': 'fa-solid fa-vial',
  'Hô hấp': 'fa-solid fa-lungs',
  'Tâm thần': 'fa-solid fa-head-side-virus',
  'Xương khớp - miễn dịch': 'fa-solid fa-joint',
  'Tổng quát': 'fa-solid fa-stethoscope',
  'Ngoại tổng quát': 'fa-solid fa-user-doctor',
  'Nội tổng quát': 'fa-solid fa-notes-medical',
  'Tai Mũi Họng': 'fa-solid fa-ear-listen',
  'Huyết học': 'fa-solid fa-droplet',
  'Thận': 'fa-solid fa-kidneys',
  'Chẩn đoán hình ảnh': 'fa-solid fa-x-ray'
};

export function getIconClassBySpecialty(name: string): string {
  return specialtyIcons[name] || 'fa-solid fa-circle-question';
}