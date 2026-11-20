export const sharedFormErrors = {
  required: 'Энэ талбарыг бөглөнө үү.',
  email: 'Зөв и-мэйл хаяг оруулна уу.',
  phone: 'Утасны дугаар буруу байна.',
  consent: 'Үргэлжлүүлэхийн тулд зөвшөөрөл өгнө үү.',
  rateLimited: 'Олон удаа илгээлээ. Түр хүлээгээд дахин оролдоно уу.',
  unavailable: 'Үйлчилгээ түр сааталтай байна. Удахгүй дахин оролдоно уу.',
  passwordMin: 'Нууц үг дор хаяж 8 тэмдэгттэй байна.',
  codeFormat: '6 оронтой баталгаажуулах код оруулна уу.',
  invalidCredentials: 'И-мэйл эсвэл нууц үг буруу байна.',
  invalidCode: 'Баталгаажуулах код буруу эсвэл хугацаа дууссан байна.',
  verificationRequired: 'Нэвтрэхийн өмнө и-мэйл хаягаа баталгаажуулна уу.',
  serverError: 'Алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.',
};

export const formMeta = {
  submitting: 'Илгээж байна...',
  honeypotLabel: 'Вэбсайт',
  backHome: 'Нүүр хуудас руу буцах',
  openNextStep: 'Дахин илгээх',
};

export const bookCallCopy = {
  eyebrow: 'УУЛЗАЛТ',
  title: ['Танилцуулга ', { em: 'уулзалт' }, ' товлох'],
  lede: '15 минутын танилцуулга дуудлагаар таны суваг болон зорилтод тохирсон нийлүүлэлтийн бүтцийг ярилцана.',
  submit: 'Уулзалт товлох',
  successTitle: 'Хүсэлт хүлээн авлаа.',
  successBody: 'Ажлын нэг өдрийн дотор и-мэйлээр цагийн баталгаажуулалт илгээнэ.',
  fields: {
    fullName: { label: 'Нэр', placeholder: 'Таны бүтэн нэр' },
    email: { label: 'И-мэйл', placeholder: 'name@company.mn' },
    phone: { label: 'Утас', placeholder: '+976 9000 0000' },
    company: { label: 'Компани', placeholder: 'Байгууллагын нэр' },
    preferredWindow: {
      label: 'Тохиромжтой цаг',
      placeholder: 'Цагийн бүс сонгох',
      options: [
        { value: 'morning', label: 'Өглөө (09:00–12:00)' },
        { value: 'afternoon', label: 'Өдөр (12:00–16:00)' },
        { value: 'evening', label: 'Орой (16:00–19:00)' },
      ],
    },
    consent: 'Миний холбоо барих мэдээллийг зөвхөн уулзалт товлох зорилгоор ашиглахыг зөвшөөрч байна.',
  },
};

export const getStartedCopy = {
  eyebrow: 'ХАНДАЛТ',
  title: ['Өөрийн ', { em: 'студийг' }, ' эхлүүлэх'],
  lede: 'Өөрөө удирдах curation студид хандах эрхийн хүсэлт илгээнэ үү.',
  submit: 'Хандах эрх хүсэх',
  successTitle: 'Хүсэлт бүртгэгдлээ.',
  successBody: 'Хандалтын мэдээллийг ажлын нэг өдрийн дотор и-мэйлээр илгээнэ.',
  fields: {
    company: { label: 'Компани', placeholder: 'Байгууллагын нэр' },
    fullName: { label: 'Нэр', placeholder: 'Таны бүтэн нэр' },
    email: { label: 'И-мэйл', placeholder: 'name@company.mn' },
    phone: { label: 'Утас', placeholder: '+976 9000 0000' },
    role: {
      label: 'Үүрэг',
      placeholder: 'Үүрэг сонгох',
      options: [
        { value: 'media_agency', label: 'Медиа агентлаг' },
        { value: 'direct_advertiser', label: 'Шууд сурталчлагч' },
        { value: 'publisher', label: 'Нийтлэгч' },
        { value: 'ad_tech', label: 'Ad Tech' },
      ],
    },
    monthlyVolume: {
      label: 'Сарын хэмжээ',
      placeholder: 'Хэмжээ сонгох',
      options: [
        { value: 'under_10m', label: '10M хүртэл' },
        { value: '10m_to_100m', label: '10M–100M' },
        { value: 'over_100m', label: '100M+' },
      ],
    },
    consent: 'Crystal Koi үйлчилгээний нөхцөл болон нууцлалын бодлогыг зөвшөөрч байна.',
  },
};

export const contactCopy = {
  eyebrow: 'ХОЛБОО БАРИХ',
  title: ['Багтай ', { em: 'холбогдох' }],
  lede: 'Асуулт, түншлэлийн санал эсвэл техникийн дэмжлэгийн талаар бидэнд мессеж илгээнэ үү.',
  submit: 'Мессеж илгээх',
  successTitle: 'Мессеж илгээгдлээ.',
  successBody: 'Таны зурвасыг хүлээн авлаа. Удахгүй хариу өгнө.',
  directTitle: 'Шууд холбоо',
  addressLabel: 'Хаяг',
  phoneLabel: 'Утас',
  fields: {
    fullName: { label: 'Нэр', placeholder: 'Таны бүтэн нэр' },
    email: { label: 'И-мэйл', placeholder: 'name@company.mn' },
    phone: { label: 'Утас (заавал биш)', placeholder: '+976 9000 0000' },
    company: { label: 'Компани (заавал биш)', placeholder: 'Байгууллагын нэр' },
    topic: {
      label: 'Сэдэв',
      placeholder: 'Сэдэв сонгох',
      options: [
        { value: 'general', label: 'Ерөнхий асуулт' },
        { value: 'partnership', label: 'Түншлэл' },
        { value: 'support', label: 'Техникийн дэмжлэг' },
      ],
    },
    message: { label: 'Мессеж', placeholder: 'Төсөл эсвэл асуултаа товч бичнэ үү...' },
    consent: 'Миний мэдээллийг хүсэлтэд хариу өгөх зорилгоор боловсруулахыг зөвшөөрч байна.',
  },
};

export const optOutCopy = {
  eyebrow: 'НУУЦЛАЛ',
  title: ['Хэмжилтээс ', { em: 'татгалзах' }],
  lede: 'Тодорхой и-мэйл хаягаар ирэх бүртгэл болон холбогдох боловсруулалтыг зогсоох хүсэлт илгээнэ үү.',
  submit: 'Хүсэлт илгээх',
  successTitle: 'Татгалзах хүсэлтийг бүртгэлээ.',
  successBody: 'Хүсэлтийг хүлээн авсан тул боловсруулалтыг шалгаж баталгаажуулна.',
  fields: {
    email: { label: 'И-мэйл', placeholder: 'name@company.mn' },
    reason: { label: 'Шалтгаан (заавал биш)', placeholder: 'Нэмэлт тайлбар бичих боломжтой...' },
  },
};

export const loginCopy = {
  eyebrow: 'БҮРТГЭЛ',
  title: ['Хэрэглэгчийн ', { em: 'орон зай' }],
  lede: 'Өөрийн Crystal Koi бүртгэлээр нэвтэрч эсвэл шинэ бүртгэл үүсгэж баталгаажуулна уу.',
  tabs: {
    login: 'Нэвтрэх',
    register: 'Бүртгүүлэх',
  },
  loginSubmit: 'Нэвтрэх',
  registerSubmit: 'Бүртгэл үүсгэх',
  verifyTitle: 'И-мэйл баталгаажуулалт',
  verifyHint: 'Таны и-мэйл хаягт илгээсэн 6 оронтой кодыг оруулна уу.',
  verifySubmit: 'Баталгаажуулах',
  forgotLink: 'Нууц үг мартсан уу?',
  forgotTitle: 'Нууц үг сэргээх',
  forgotHint: 'Бүртгэлтэй и-мэйл хаягаа оруулбал сэргээх код илгээнэ.',
  forgotSubmit: 'Код илгээх',
  forgotSentNote: 'Хэрэв бүртгэлтэй хаяг бол сэргээх кодыг илгээсэн. Код болон шинэ нууц үгээ оруулна уу.',
  resetSubmit: 'Нууц үг шинэчлэх',
  backToLogin: 'Нэвтрэх хэсэг рүү буцах',
  googleButton: 'Google бүртгэлээр үргэлжлүүлэх',
  alreadySignedInTitle: 'Та нэвтэрсэн байна',
  alreadySignedInAction: 'Нүүр хуудас руу очих',
  logoutLabel: 'Гарах',
  fields: {
    fullName: { label: 'Нэр', placeholder: 'Таны бүтэн нэр' },
    email: { label: 'И-мэйл', placeholder: 'name@company.mn' },
    password: { label: 'Нууц үг', placeholder: 'Дор хаяж 8 тэмдэгт' },
    code: { label: 'Баталгаажуулах код', placeholder: '6 оронтой код' },
    newPassword: { label: 'Шинэ нууц үг', placeholder: 'Дор хаяж 8 тэмдэгт' },
  },
};

export const storiesCopy = {
  eyebrow: 'АМЖИЛТЫН ТҮҮХ',
  title: ['Бодит ', { em: 'үр дүн' }, ' ба кэйсүүд'],
  lede: 'Медиа агентлаг, шууд сурталчлагч болон нийтлэгчид хэрхэн өндөр чанарын нийлүүлэлтэд хүрч байгааг үзнэ үү.',
  empty: 'Одоогоор нийтэлсэн түүх байхгүй.',
  loadError: 'Түүхүүдийг ачаалж чадсангүй. Дахин оролдоно уу.',
  retry: 'Дахин ачаалах',
};

export const partnersCopy = {
  eyebrow: 'ЭКОСИСТЕМ',
  title: ['Итгэмжлэгдсэн ', { em: 'түншүүд' }],
  lede: 'Supply, Demand, Хэмжилт болон Өгөгдлийн интеграц хийгдсэн идэвхтэй түншүүдийн жагсаалт.',
  empty: 'Одоогоор бүртгэгдсэн түнш байхгүй.',
  loadError: 'Түншүүдийн мэдээллийг ачаалж чадсангүй.',
  retry: 'Дахин оролдох',
  visitLabel: 'Вэбсайт нээх',
  categories: {
    all: 'Бүгд',
    supply: 'Нийлүүлэлт',
    demand: 'Эрэлт',
    measurement: 'Хэмжилт',
    data: 'Өгөгдөл',
  },
};

export const statusCopy = {
  eyebrow: 'СИСТЕМИЙН ТӨЛӨВ',
  title: ['Үйлчилгээний ', { em: 'бэлэн байдал' }],
  lede: 'Crystal Koi-ийн бүрэлдэхүүн хэсгүүдийн одоогийн төлөв болон сүүлийн 90 хоногийн бүртгэл.',
  emptyComponents: 'Бүртгэгдсэн систем одоогоор алга.',
  emptyIncidents: 'Сүүлийн 90 хоногт бүртгэгдсэн саатал алга.',
  incidentsHeading: 'СҮҮЛИЙН 90 ХОНОГИЙН СААТАЛ',
  loadError: 'Системийн төлөвийг ачаалж чадсангүй.',
  retry: 'Дахин ачаалах',
  overallOperational: 'Бүх систем хэвийн',
  overallDegraded: 'Зарим үйлчилгээнд саатал гарсан',
  overallOutage: 'Үйлчилгээ тасалдсан',
  componentStates: {
    operational: 'Хэвийн',
    degraded: 'Удааширсан',
    outage: 'Тасалдсан',
  },
  incidentSeverities: {
    minor: 'Бага',
    major: 'Дунд',
    critical: 'Ноцтой',
  },
  incidentStates: {
    investigating: 'Шалгаж байна',
    identified: 'Шалтгаан тодорсон',
    monitoring: 'Хянаж байна',
    resolved: 'Шийдэгдсэн',
  },
};
