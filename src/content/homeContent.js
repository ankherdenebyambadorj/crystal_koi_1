// Stats are sample figures; replace them with real numbers before launch.
export const studio = {
  headline: [
    'Програматик худалдан авагч бүрт зориулсан',
    { br: true },
    { accent: 'өөрөө удирддаг сонгон бүрдүүлэлтийн студи' },
  ],
  lede: 'Үнийн санал тавихаасаа өмнө нийлүүлэлтээ хэлбэржүүл. Нэг тайван ажлын орчноос хувийн deal-ээ багцалж, таамаглаж, эхлүүлээрэй.',
  primaryCta: 'Үнэгүй эхлэх',
  secondaryCta: 'Уулзалт товлох',
  stats: [
    { value: '2.4 тэрбум', caption: ['өдөр бүр хэлбэржүүлдэг', 'bid request'] },
    { value: '48 сек', caption: ['брифээс deal ID үүсэх', 'дундаж хугацаа'] },
    { value: '120+', caption: ['нийлүүлэлтийн түнш', 'нэг ажлын орчинд'] },
    { value: '0%', caption: ['худалдан авагчийн талын', 'нэмэлт шимтгэл'] },
  ],
};

export const dashboard = {
  ariaLabel: 'Бүтээгдэхүүний самбарын жишээ',
  breadcrumb: ['Deal-үүд', 'Хаврын стриминг багц'],
  search: 'Deal хайх',
  liveChip: 'Идэвхтэй',
  avatar: 'PM',
  sidebar: {
    workspace: 'АЖЛЫН ОРЧИН',
    library: 'САН',
    items: [
      { label: 'Гүйцэтгэл', active: true },
      { label: 'Deal-үүд', count: '24' },
      { label: 'Таамаглал' },
      { label: 'Баг' },
    ],
    libraryItems: [
      { label: 'Аудиторууд', count: '38' },
      { label: 'Контекст', count: '61' },
      { label: 'Домэйн оноо' },
      { label: 'CTV багцууд', count: '12' },
    ],
  },
  title: 'Deal-ийн гүйцэтгэл',
  trend: '▲ 18.4% өмнөх үеэс',
  ranges: [
    { value: 7, label: '7х' },
    { value: 30, label: '30х' },
    { value: 90, label: '90х' },
  ],
  newDeal: '+ Шинэ deal',
  kpis: [
    { label: 'Зарцуулалт', value: '$184.2K', delta: '+12%' },
    { label: 'Хожилтын хувь', value: '29.6%', delta: '+3.1pt' },
    { label: 'eCPM', value: '$9.42', delta: '−4%', neutral: true },
    { label: 'Идэвхтэй deal', value: '24', delta: '+5' },
  ],
  chartTitle: 'Зарцуулалт ба хожилтын хувь',
  legend: ['Зарцуулалт', 'Хожилтын хувь'],
  mixTitle: 'Форматын харьцаа',
  mix: [
    { label: 'CTV', value: 38 },
    { label: 'Display', value: 27 },
    { label: 'Онлайн бичлэг', value: 19 },
    { label: 'Аудио', value: 10 },
    { label: 'DOOH', value: 6 },
  ],
  tableHead: ['Deal', 'Суваг', 'Доод үнэ', 'Хожилт', 'Төлөв'],
  rows: [
    { name: 'Хаврын стриминг багц', channel: 'CTV', floor: '$18.50', winRate: '31.2%', status: 'live' },
    { name: 'Авто худалдан авагчдын аудитор', channel: 'Display', floor: '$4.80', winRate: '27.9%', status: 'live' },
    { name: 'Тайван цагийн аудио', channel: 'Аудио', floor: '$6.20', winRate: '—', status: 'forecasting' },
  ],
  status: { live: 'Идэвхтэй', forecasting: 'Таамаглал' },
};

export const packs = {
  headline: ['Зоригтой сонго, цаашаа хар, хурдан тохируул, ', { accent: 'үнэнийг ' }, { serif: 'хяна.' }],
  lede: 'Бэлэн багцаас эхэлж, брифдээ тааруулаад, нэг deal ID-г хүссэн худалдан авалтын платформ руу илгээ.',
  primaryCta: 'Амжилтын түүх',
  secondaryCta: 'Уулзалт товлох',
  code: { file: 'bid_request.json', protocol: 'OpenRTB 2.6', deal: 'deal ck.pond.0428', ready: 'бэлэн' },
  cards: [
    {
      index: '01',
      eyebrow: 'АУДИТОРООР ДАВХАРЛАСАН',
      title: 'Бэлэн худалдан авагчдад хүр',
      body: 'Нийтлэгчийн өөрийн өгөгдөл, найдвартай аудиторийг нийлүүлэлт дээр давхарлана.',
      metricLabel: 'Хүрээний дундаж өсөлт',
      metric: '+24%',
      linkLabel: 'Эдгээр deal-ийг авах',
      to: '/product/curation',
    },
    {
      index: '02',
      eyebrow: 'CTV БАГЦУУД',
      title: 'Үзэж буй дэлгэцүүд',
      body: 'Тодорхой контекст, жанрт тохируулсан стриминг нөөц.',
      metricLabel: 'Үзэж дуусгах хувь',
      metric: '96%',
      linkLabel: 'Эдгээр deal-ийг авах',
      to: '/channels/ctv',
    },
    {
      index: '03',
      eyebrow: 'ГҮЙЦЭТГЭЛ',
      title: 'Хөрвүүлэлтээ өсгө',
      body: 'Таны чухалчилдаг KPI руу чиглүүлэхээр сонгосон байршлууд.',
      metricLabel: 'CPA-ийн дундаж өөрчлөлт',
      metric: '−17%',
      linkLabel: 'Эдгээр deal-ийг авах',
      to: '/product/forecasts',
    },
  ],
  steps: [
    { lead: 'Багцаа сонгоод тохируул', text: 'Аудитор, контекст, чанарын дүрмээ давхарлана.' },
    { lead: 'Таамаглалаа хар', text: 'Хүрээ, доод үнэ, үнийн саналын зөвлөмжийг урьдчилан харна.' },
    { lead: 'Deal ID-г секундэд үүсгэ', text: 'Аль ч худалдан авалтын платформ дээр минутын дотор ажиллуул.' },
  ],
};

export const uses = {
  headline: ['Нийлүүлэлттэй ', { serif: 'харьцдаг' }, ' хүн бүрт зориулсан.'],
  lede: 'Нэг ажлын орчин, дөрвөн орох хаалга. Баг бүр хэрэгтэй хяналтаа авна, илүү зүйлгүйгээр.',
  tag: 'ХЭРЭГЛЭЭНИЙ ТОХИОЛДОЛ',
  linkLabel: 'Одоо үзэх',
  cards: [
    {
      title: 'Медиа агентлаг',
      body: 'Сонгон бүрдүүлэлтгүй програматик бол зүгээр л шуугиан. Сувгаа өөрөө эзэмш, эс бөгөөс суваг чамайг эзэмшинэ.',
      chips: ['Олон хэрэглэгч', 'Маржийн хяналт'],
      to: '/use-cases/media-agency',
    },
    {
      title: 'Шууд сурталчлагч',
      body: 'Нийлүүлэлтийг хутгахгүй, хэлбэржүүлбэл брэнд хождог. Хэрэггүйг хас, чухлыг үлдээ.',
      chips: ['Брэнд хамгаалалт', 'Үр дүн KPI'],
      to: '/use-cases/direct-advertiser',
    },
    {
      title: 'Нийтлэгч',
      body: 'Худалдан авагчийн талын маржийг санхүүжүүлэхээ боль, өөрөө авч үлд. Завсрын алхам бүр хувь авдаг, тэдгээрийг хас.',
      chips: ['Өөрийн багц', 'Аудитор тэлэлт'],
      to: '/use-cases/publisher',
    },
    {
      title: 'Ad Tech',
      body: 'Ил тод байдал бол онцлог биш, хүчилтөрөгч юм. Манлайлагчид нөөцийг хүлээдэггүй, бүгдийг өөрсдөө хэлбэржүүлдэг.',
      chips: ['Нээлттэй API', 'White-label'],
      to: '/use-cases/ad-tech',
    },
  ],
};

export const cta = {
  headline: ['Нийлүүлэлтээ', { br: true }, { serif: 'сонгон бүрдүүлж' }, ' эхэл!'],
  lede: 'Үнэгүй эхэлнэ. Таны анхны сонгомол deal кофе чинь хөрөхөөс өмнө ажиллаж эхэлж болно.',
  primaryCta: 'Үнэгүй эхлэх',
  secondaryCta: 'Уулзалт товлох',
  note: 'Карт шаардахгүй  ·  Минутын дотор ажиллана  ·  Хүссэн үедээ цуцлана',
};

export const footerContact = {
  addressLabel: 'Хаяг',
  phoneLabel: 'Утас',
};
