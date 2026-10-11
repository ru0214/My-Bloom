export interface AppTheme {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  dotColor: string;
  primary: string;
  from: string;
  to: string;
  border: string;
  bgMain: string;
  bgCard: string;
  textMain: string;
  textSub: string;
  shadow: string;
}

export const APP_THEMES: AppTheme[] = [
  // ==========================================
  // 【色系 1：粉紅浪漫系列】(1 - 4)
  // ==========================================
  // 1. 淺粉 (櫻花浪漫粉)
  {
    id: 'pink',
    name: '淺粉',
    subtitle: '櫻花浪漫粉',
    emoji: '🌸',
    dotColor: '#FF85A0',
    primary: '#FF85A0',
    from: '#FFAFC2',
    to: '#FFCCD5',
    border: '#FFE0E9',
    bgMain: '#FFF8FA',
    bgCard: '#FFF0F5',
    textMain: '#592736',
    textSub: '#8A4F60',
    shadow: 'rgba(255, 175, 194, 0.25)',
  },
  // 2. 櫻雪 (櫻雪淡胭粉)
  {
    id: 'cherry_blossom',
    name: '櫻雪',
    subtitle: '櫻雪淡胭粉',
    emoji: '🍧',
    dotColor: '#F06292',
    primary: '#F06292',
    from: '#F48FB1',
    to: '#F8BBD0',
    border: '#FCE4EC',
    bgMain: '#FCF7F9',
    bgCard: '#FAF0F4',
    textMain: '#5E2037',
    textSub: '#8C4662',
    shadow: 'rgba(240, 98, 146, 0.25)',
  },
  // 3. 草莓 (草莓歐蕾甜)
  {
    id: 'strawberry_milk',
    name: '草莓',
    subtitle: '草莓歐蕾甜',
    emoji: '🍓',
    dotColor: '#FF6B8B',
    primary: '#FF6B8B',
    from: '#FF94AB',
    to: '#FFCCD7',
    border: '#FFE0E7',
    bgMain: '#FFF7F9',
    bgCard: '#FFF0F3',
    textMain: '#5A1F2D',
    textSub: '#8C4355',
    shadow: 'rgba(255, 107, 139, 0.25)',
  },
  // 4. 玫瑰 (優雅玫瑰粉)
  {
    id: 'rose',
    name: '玫瑰',
    subtitle: '優雅玫瑰粉',
    emoji: '🌹',
    dotColor: '#D97793',
    primary: '#D97793',
    from: '#EAA0B5',
    to: '#F7CBD6',
    border: '#F3D7E0',
    bgMain: '#FCF6F8',
    bgCard: '#F9EBEF',
    textMain: '#542838',
    textSub: '#82495E',
    shadow: 'rgba(217, 119, 147, 0.25)',
  },

  // ==========================================
  // 【色系 2：蜜桃橘杏珊瑚系列】(5 - 8)
  // ==========================================
  // 5. 珊瑚 (元氣珊瑚粉)
  {
    id: 'coral',
    name: '珊瑚',
    subtitle: '元氣珊瑚粉',
    emoji: '🪸',
    dotColor: '#FF8A80',
    primary: '#FF8A80',
    from: '#FFAB91',
    to: '#FFCCBC',
    border: '#FFE0D6',
    bgMain: '#FFF8F6',
    bgCard: '#FFF0EC',
    textMain: '#5E3023',
    textSub: '#8A5243',
    shadow: 'rgba(255, 138, 128, 0.25)',
  },
  // 6. 蜜桃 (蜜桃元氣橘)
  {
    id: 'peach',
    name: '蜜桃',
    subtitle: '蜜桃元氣橘',
    emoji: '🍑',
    dotColor: '#FF9A76',
    primary: '#FF9A76',
    from: '#FFBA9E',
    to: '#FFDFC9',
    border: '#FFE4D4',
    bgMain: '#FFF9F5',
    bgCard: '#FFF3EB',
    textMain: '#5C3524',
    textSub: '#8C5943',
    shadow: 'rgba(255, 154, 118, 0.25)',
  },
  // 7. 西柚 (晨曦西柚橙)
  {
    id: 'grapefruit',
    name: '西柚',
    subtitle: '晨曦西柚橙',
    emoji: '🍊',
    dotColor: '#FF9052',
    primary: '#FF9052',
    from: '#FFAE80',
    to: '#FFD9C0',
    border: '#FFE3D1',
    bgMain: '#FFF9F6',
    bgCard: '#FFF3ED',
    textMain: '#5D311D',
    textSub: '#8C573E',
    shadow: 'rgba(255, 144, 82, 0.25)',
  },
  // 8. 柔杏 (柔嫩杏桃粉)
  {
    id: 'apricot',
    name: '柔杏',
    subtitle: '柔嫩杏桃粉',
    emoji: '🥧',
    dotColor: '#FF8E6E',
    primary: '#FF8E6E',
    from: '#FFAA8E',
    to: '#FFD6C6',
    border: '#FFE2D7',
    bgMain: '#FFFAF7',
    bgCard: '#FFF4EE',
    textMain: '#582E1E',
    textSub: '#88503D',
    shadow: 'rgba(255, 142, 110, 0.25)',
  },

  // ==========================================
  // 【色系 3：奶油暖黃系列】(9 - 12)
  // ==========================================
  // 9. 奶黃 (舒芙蕾奶黃)
  {
    id: 'custard',
    name: '奶黃',
    subtitle: '舒芙蕾奶黃',
    emoji: '🍮',
    dotColor: '#F5BA42',
    primary: '#F5BA42',
    from: '#F9D57A',
    to: '#FDEEAF',
    border: '#FDF2C2',
    bgMain: '#FFFDF7',
    bgCard: '#FFFCEE',
    textMain: '#584112',
    textSub: '#876727',
    shadow: 'rgba(245, 186, 66, 0.25)',
  },
  // 10. 淺黃 (奶油小清新)
  {
    id: 'lemon',
    name: '淺黃',
    subtitle: '奶油小清新',
    emoji: '🍋',
    dotColor: '#E5A93C',
    primary: '#E5A93C',
    from: '#F3C769',
    to: '#FBE5A8',
    border: '#FDEECA',
    bgMain: '#FFFDF5',
    bgCard: '#FFF9E6',
    textMain: '#564016',
    textSub: '#82662F',
    shadow: 'rgba(229, 169, 60, 0.25)',
  },
  // 11. 暖陽 (溫暖蜂蜜黃)
  {
    id: 'honey',
    name: '暖陽',
    subtitle: '溫暖蜂蜜黃',
    emoji: '🍯',
    dotColor: '#F0B342',
    primary: '#F0B342',
    from: '#F7CB6A',
    to: '#FDEBB3',
    border: '#FCEFCF',
    bgMain: '#FFFDF7',
    bgCard: '#FFFBF0',
    textMain: '#5A4315',
    textSub: '#89692A',
    shadow: 'rgba(240, 179, 66, 0.25)',
  },
  // 12. 酪黃 (暖油布蕾)
  {
    id: 'butter',
    name: '酪黃',
    subtitle: '暖油布蕾',
    emoji: '🧈',
    dotColor: '#D8B23E',
    primary: '#D8B23E',
    from: '#E8CA6A',
    to: '#F6E4A0',
    border: '#FAEEC0',
    bgMain: '#FCFBF5',
    bgCard: '#FAF7E8',
    textMain: '#504113',
    textSub: '#7C6629',
    shadow: 'rgba(216, 178, 62, 0.25)',
  },

  // ==========================================
  // 【色系 4：清新草木綠系列】(13 - 16)
  // ==========================================
  // 13. 若草 (抹茶清香綠)
  {
    id: 'matcha',
    name: '若草',
    subtitle: '抹茶清香綠',
    emoji: '🍵',
    dotColor: '#6CAE75',
    primary: '#6CAE75',
    from: '#96D09E',
    to: '#C8E9CD',
    border: '#D9F0DC',
    bgMain: '#F6FBF7',
    bgCard: '#EEF8F0',
    textMain: '#234929',
    textSub: '#48724F',
    shadow: 'rgba(108, 174, 117, 0.25)',
  },
  // 14. 嫩草 (開心果嫩綠)
  {
    id: 'pistachio',
    name: '嫩草',
    subtitle: '開心果嫩綠',
    emoji: '🌱',
    dotColor: '#7BB369',
    primary: '#7BB369',
    from: '#A2D393',
    to: '#D0EFC7',
    border: '#DFF4D7',
    bgMain: '#F8FCF6',
    bgCard: '#F1F9EE',
    textMain: '#28471D',
    textSub: '#4F7341',
    shadow: 'rgba(123, 179, 105, 0.25)',
  },
  // 15. 淺綠 (薄荷自然綠)
  {
    id: 'mint',
    name: '淺綠',
    subtitle: '薄荷自然綠',
    emoji: '🌿',
    dotColor: '#52B788',
    primary: '#52B788',
    from: '#84D4A4',
    to: '#BAECC8',
    border: '#D5EFE0',
    bgMain: '#F5FBF7',
    bgCard: '#EDF8F1',
    textMain: '#1F4A34',
    textSub: '#417258',
    shadow: 'rgba(82, 183, 136, 0.25)',
  },
  // 16. 灰綠 (鼠尾草青)
  {
    id: 'sage',
    name: '灰綠',
    subtitle: '鼠尾草優雅青',
    emoji: '🍃',
    dotColor: '#72987E',
    primary: '#72987E',
    from: '#9DBBA7',
    to: '#CDE0D4',
    border: '#DCE8E1',
    bgMain: '#F7FAF8',
    bgCard: '#EFF4F0',
    textMain: '#2A4033',
    textSub: '#4F6C5A',
    shadow: 'rgba(114, 152, 126, 0.25)',
  },

  // ==========================================
  // 【色系 5：湖水粉青藍系列】(17 - 20)
  // ==========================================
  // 17. 淺青 (湖水粉青)
  {
    id: 'aqua',
    name: '淺青',
    subtitle: '湖水粉青',
    emoji: '🌊',
    dotColor: '#4DB6AC',
    primary: '#4DB6AC',
    from: '#80CBC4',
    to: '#B2DFDB',
    border: '#CDEEEA',
    bgMain: '#F5FBFA',
    bgCard: '#EDF8F6',
    textMain: '#184742',
    textSub: '#39706A',
    shadow: 'rgba(77, 182, 172, 0.25)',
  },
  // 18. 蒂芙尼 (夢幻粉青綠)
  {
    id: 'tiffany',
    name: '蒂芙尼',
    subtitle: '夢幻粉青綠',
    emoji: '💎',
    dotColor: '#3DB8A8',
    primary: '#3DB8A8',
    from: '#76D9CB',
    to: '#B2EFE6',
    border: '#C6F4ED',
    bgMain: '#F5FBFA',
    bgCard: '#ECF8F6',
    textMain: '#16463E',
    textSub: '#376F64',
    shadow: 'rgba(61, 184, 168, 0.25)',
  },
  // 19. 冰川 (冰川薄荷青)
  {
    id: 'glacier',
    name: '冰川',
    subtitle: '冰川薄荷青',
    emoji: '🧊',
    dotColor: '#49B6C6',
    primary: '#49B6C6',
    from: '#7DD4E2',
    to: '#BBEAF0',
    border: '#CEF0F5',
    bgMain: '#F5FBFC',
    bgCard: '#ECF7FA',
    textMain: '#174249',
    textSub: '#386872',
    shadow: 'rgba(73, 182, 198, 0.25)',
  },
  // 20. 海沫 (清透海沫藍)
  {
    id: 'seafoam',
    name: '海沫',
    subtitle: '清透海沫藍',
    emoji: '🫧',
    dotColor: '#4EA8C5',
    primary: '#4EA8C5',
    from: '#81C8E0',
    to: '#BEE5F2',
    border: '#D3EEF7',
    bgMain: '#F5FAFC',
    bgCard: '#ECF6FA',
    textMain: '#183F4D',
    textSub: '#3A677A',
    shadow: 'rgba(78, 168, 197, 0.25)',
  },

  // ==========================================
  // 【色系 6：晴空蔚藍系列】(21 - 24)
  // ==========================================
  // 21. 粉藍 (冰川嬰兒藍)
  {
    id: 'baby_blue',
    name: '粉藍',
    subtitle: '冰川嬰兒藍',
    emoji: '❄️',
    dotColor: '#70A9E5',
    primary: '#70A9E5',
    from: '#9BC5F3',
    to: '#CEE2FA',
    border: '#DAE9FC',
    bgMain: '#F6F9FD',
    bgCard: '#EFF5FD',
    textMain: '#1F3C5E',
    textSub: '#456488',
    shadow: 'rgba(112, 169, 229, 0.25)',
  },
  // 22. 淺藍 (雲朵晴空藍)
  {
    id: 'sky',
    name: '淺藍',
    subtitle: '雲朵晴空藍',
    emoji: '☁️',
    dotColor: '#64B5F6',
    primary: '#64B5F6',
    from: '#90CAF9',
    to: '#C3E3FA',
    border: '#D2EAFB',
    bgMain: '#F5FAFE',
    bgCard: '#EDF6FD',
    textMain: '#1C4164',
    textSub: '#406A91',
    shadow: 'rgba(100, 181, 246, 0.25)',
  },
  // 23. 繡球 (蔚藍繡球花)
  {
    id: 'hydrangea',
    name: '繡球',
    subtitle: '蔚藍繡球花',
    emoji: '🩵',
    dotColor: '#5C90D2',
    primary: '#5C90D2',
    from: '#8BB4E8',
    to: '#C5DCFA',
    border: '#D5E5FB',
    bgMain: '#F6FAFE',
    bgCard: '#EEF5FD',
    textMain: '#1E3658',
    textSub: '#436186',
    shadow: 'rgba(92, 144, 210, 0.25)',
  },
  // 24. 霧藍 (沉靜晨霧藍)
  {
    id: 'fog_blue',
    name: '霧藍',
    subtitle: '沉靜晨霧藍',
    emoji: '🌫️',
    dotColor: '#6888A8',
    primary: '#6888A8',
    from: '#94B0CE',
    to: '#C8D7E6',
    border: '#D8E2ED',
    bgMain: '#F6F8FA',
    bgCard: '#EFF2F6',
    textMain: '#24374A',
    textSub: '#4A5F74',
    shadow: 'rgba(104, 136, 168, 0.25)',
  },

  // ==========================================
  // 【色系 7：香芋薰衣草紫系列】(25 - 28)
  // ==========================================
  // 25. 芋泥 (香芋柔紫)
  {
    id: 'taro',
    name: '芋泥',
    subtitle: '香芋柔紫',
    emoji: '🍠',
    dotColor: '#9FA8DA',
    primary: '#9FA8DA',
    from: '#C5CAE9',
    to: '#E0E4F7',
    border: '#E7EAFA',
    bgMain: '#F8F9FD',
    bgCard: '#F2F4FC',
    textMain: '#333A62',
    textSub: '#58608F',
    shadow: 'rgba(159, 168, 218, 0.25)',
  },
  // 26. 淺紫 (薰衣草夢幻)
  {
    id: 'lavender',
    name: '淺紫',
    subtitle: '薰衣草夢幻',
    emoji: '🪻',
    dotColor: '#B39DDB',
    primary: '#B39DDB',
    from: '#CE93D8',
    to: '#E1BEE7',
    border: '#EADBF3',
    bgMain: '#FAF7FC',
    bgCard: '#F4EDF9',
    textMain: '#452A59',
    textSub: '#6E4D88',
    shadow: 'rgba(179, 157, 219, 0.25)',
  },
  // 27. 丁香 (紫丁香粉)
  {
    id: 'lilac',
    name: '丁香',
    subtitle: '紫丁香粉',
    emoji: '🔮',
    dotColor: '#BA68C8',
    primary: '#BA68C8',
    from: '#CE93D8',
    to: '#E8C5EE',
    border: '#F0D6F4',
    bgMain: '#FAF6FB',
    bgCard: '#F5ECF7',
    textMain: '#4C2454',
    textSub: '#784883',
    shadow: 'rgba(186, 104, 200, 0.25)',
  },
  // 28. 紫晶 (晶瑩葡萄紫)
  {
    id: 'amethyst',
    name: '紫晶',
    subtitle: '晶瑩葡萄紫',
    emoji: '🍇',
    dotColor: '#A864B8',
    primary: '#A864B8',
    from: '#C68DD4',
    to: '#E5C0F0',
    border: '#EDD3F5',
    bgMain: '#FAF6FB',
    bgCard: '#F6EDF8',
    textMain: '#482052',
    textSub: '#72427E',
    shadow: 'rgba(168, 100, 184, 0.25)',
  },

  // ==========================================
  // 【色系 8：溫暖奶茶大地系列】(29 - 32)
  // ==========================================
  // 29. 奶茶 (溫暖伯爵奶茶)
  {
    id: 'milktea',
    name: '奶茶',
    subtitle: '溫暖伯爵奶茶',
    emoji: '🧋',
    dotColor: '#B38B6D',
    primary: '#B38B6D',
    from: '#CDB49E',
    to: '#E5D5C5',
    border: '#EAE0D7',
    bgMain: '#FBF8F5',
    bgCard: '#F5EEE8',
    textMain: '#4C3B2E',
    textSub: '#745E4C',
    shadow: 'rgba(179, 139, 109, 0.25)',
  },
  // 30. 燕麥 (燕麥香草霜)
  {
    id: 'warm_vanilla',
    name: '燕麥',
    subtitle: '燕麥香草霜',
    emoji: '🌾',
    dotColor: '#C49A70',
    primary: '#C49A70',
    from: '#DDBFA2',
    to: '#EFE0D0',
    border: '#F2E8DC',
    bgMain: '#FDFBFA',
    bgCard: '#F8F4EF',
    textMain: '#4F3B28',
    textSub: '#795E45',
    shadow: 'rgba(196, 154, 112, 0.25)',
  },
  // 31. 拿鐵 (太妃栗子拿鐵)
  {
    id: 'latte',
    name: '拿鐵',
    subtitle: '太妃栗子拿鐵',
    emoji: '☕',
    dotColor: '#9E775B',
    primary: '#9E775B',
    from: '#BA977F',
    to: '#DEC7B5',
    border: '#E7D8CB',
    bgMain: '#FAF7F5',
    bgCard: '#F3EDE7',
    textMain: '#422F21',
    textSub: '#6B513E',
    shadow: 'rgba(158, 119, 91, 0.25)',
  },
  // 32. 焦糖 (焦糖烤布丁)
  {
    id: 'caramel_cream',
    name: '焦糖',
    subtitle: '焦糖烤布丁',
    emoji: '🍮',
    dotColor: '#B88258',
    primary: '#B88258',
    from: '#D4A682',
    to: '#ECD2BD',
    border: '#F0DEC8',
    bgMain: '#FAF7F4',
    bgCard: '#F4ECE4',
    textMain: '#4B331F',
    textSub: '#77583D',
    shadow: 'rgba(184, 130, 88, 0.25)',
  },
];

export function getThemeById(themeId?: string): AppTheme {
  const found = APP_THEMES.find((t) => t.id === themeId);
  return found || APP_THEMES[0];
}

export function applyTheme(themeId?: string): void {
  const theme = getThemeById(themeId);
  const root = document.documentElement;

  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-from', theme.from);
  root.style.setProperty('--theme-to', theme.to);
  root.style.setProperty('--theme-border', theme.border);
  root.style.setProperty('--theme-bg-main', theme.bgMain);
  root.style.setProperty('--theme-bg-card', theme.bgCard);
  root.style.setProperty('--theme-text-main', theme.textMain);
  root.style.setProperty('--theme-text-sub', theme.textSub);
  root.style.setProperty('--theme-shadow', theme.shadow);

  root.setAttribute('data-theme', theme.id);
  document.body.style.backgroundColor = theme.bgMain;
  document.body.style.color = theme.textMain;

  // Update theme-color meta tag if present
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.bgMain);
  }
}
