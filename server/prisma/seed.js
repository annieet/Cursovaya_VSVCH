import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, OrderStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

/** Типы декоративных работ (аналог DecorationType): базовая ставка за работу в прайсе. */
const serviceNames = [
  ['Декорирование стразами премиум', 'Swarovski и аналоги, укладка по эскизу', 120],
  ['Ручная вышивка бисером и пайетками', 'По рисунку или монограмма', 95],
  ['Роспись по ткани акрилом', 'Устойчивые краски, фиксация', 85],
  ['Термотрансфер и принт', 'Плёнка, DTF, кастом-принт', 55],
  ['Аппликация и нашивки', 'Кожа, замша, патчи', 70],
  ['Декор шнуровкой и люверсами', 'Укрепление, фурнитура', 65],
  ['Реставрация декора', 'Восстановление вышивки, подклейка страз', 50],
  ['Персонализация вышивкой нитками', 'Имя, логотип, мелкий орнамент', 75],
  ['Комплексный кастом изделия', 'Несколько техник в одном заказе', 150],
  [
    'Корпоратив: тираж с брендированием',
    'Фартуки, форма для кофейни/бара: принт, термонаклейки, логотип по макету',
    110,
  ],
];

const colors = ['прозрачный', 'серебро', 'золото', 'чёрный', 'красный', 'бирюза', 'белый', 'мульти'];
const materials = [
  'стразы',
  'бисер',
  'нитки',
  'краска текстильная',
  'пайетки',
  'термоплёнка',
  'фурнитура',
  'клей текстильный',
];

/** Понятные складские наименования вместо обезличенных "Материал №N". */
const supplyNamePool = {
  стразы: [
    'Стразы Crystal SS16',
    'Стразы AB-эффект SS20',
    'Стразы микс размеров',
    'Термостразы серебро',
    'Стразы для контурного декора',
    'Стразы для логотипов',
  ],
  бисер: [
    'Бисер японский 11/0',
    'Бисер стеклянный прозрачный',
    'Бисер перламутровый',
    'Бисер металлик',
    'Бисер для вышивки монограмм',
    'Бисер микс оттенков',
  ],
  нитки: [
    'Нитки мулине хлопок',
    'Нить металлизированная',
    'Нить полиэстер усиленная',
    'Нить для машинной вышивки',
    'Нить декоративная люрекс',
    'Нитки оттенок графит',
  ],
  'краска текстильная': [
    'Краска по ткани акрил белая',
    'Краска по ткани акрил черная',
    'Краска по ткани акрил красная',
    'Краска контурная по ткани',
    'Краска для трафаретного принта',
    'Набор красок по ткани',
  ],
  пайетки: [
    'Пайетки плоские 4 мм',
    'Пайетки чашечки 6 мм',
    'Пайетки матовые',
    'Пайетки голографик',
    'Пайетки для вечернего декора',
    'Пайетки микс оттенков',
  ],
  термоплёнка: [
    'Термоплёнка PU матовая',
    'Термоплёнка PU глянцевая',
    'Термоплёнка флок',
    'Термоплёнка глиттер',
    'Термоплёнка для логотипов',
    'Термоплёнка термостойкая',
  ],
  фурнитура: [
    'Люверсы металлические',
    'Заклепки декоративные',
    'Кнопки пришивные',
    'Карабины для аксессуаров',
    'Шнур декоративный',
    'Блочки усиленные',
  ],
  'клей текстильный': [
    'Клей текстильный прозрачный',
    'Клей для страз термофикс',
    'Клей гель для ткани',
    'Клей точечной фиксации',
    'Клей усиленной фиксации',
    'Клей для аппликаций',
  ],
};

const supplyPriceRanges = {
  стразы: [1.2, 7.5],
  бисер: [2.0, 8.5],
  нитки: [3.0, 10.0],
  'краска текстильная': [8.0, 24.0],
  пайетки: [1.5, 6.5],
  термоплёнка: [12.0, 32.0],
  фурнитура: [2.5, 14.5],
  'клей текстильный': [4.0, 16.0],
};

function randomMoney(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

/** Мастер-классы: title, topic, description, durationHours, maxSeats, priceHint, daysFromNow (через сколько дней), hourStart */
const workshopTemplates = [
  ['МК: роспись футболки акрилом', 'роспись', 'Своя футболка или холст-заготовка. Узоры, надписи, фиксация краски.', 2.5, 10, 35, 5, 11],
  ['МК: вышивка на футболке', 'вышивка', 'Стежки, монограмма, мелкий декор на трикотаже.', 3, 8, 40, 7, 14],
  ['МК: вышивка на носках и мелочах', 'вышивка', 'Подарочный декор: носки, шоппер, нашивки.', 2, 12, 28, 12, 16],
  ['МК: стразы на одежде — базовый уровень', 'стразы', 'Простой орнамент, перенос эскиза на ткань.', 2, 14, 45, 14, 10],
  ['МК: термотрансфер и кастом-принт', 'принт', 'Плёнка, пресс, уход за изделием после нанесения.', 1.5, 15, 25, 19, 18],
  ['МК: аппликации и патчи', 'аппликация', 'Кожа, замша, декоративные нашивки на джинсы и куртки.', 2.5, 10, 38, 21, 11],
  ['МК: роспись сумки-тот', 'роспись', 'Работа по ткани и кожзаму, закрепление рисунка.', 3, 8, 55, 26, 15],
  ['МК: семейный день — футболки с принтом', 'принт', 'Дети и взрослые, общий мастер-класс.', 2, 20, 30, 28, 12],
  ['МК: бисер и пайетки на вечернем топе', 'вышивка', 'Точечный декор для выхода.', 3.5, 6, 90, 35, 17],
  ['МК: кастом худи — стразы + надпись', 'стразы', 'Комбинированная техника.', 2.5, 10, 50, 40, 13],
  ['МК: роспись кед текстильными красками', 'роспись', 'Подготовка поверхности и покрытие.', 2, 12, 32, 42, 16],
  ['МК: корпоративный мерч — введение', 'принт', 'Как заказать тираж фартуков/футболок с логотипом.', 1.5, 25, 0, 45, 19],
  ['МК: уход за вещью после декора', 'теория', 'Стирка, глажка, хранение изделий с вышивкой и стразами.', 1, 20, 15, 48, 10],
  ['МК: монограмма вышивкой', 'вышивка', 'Инициалы на рубашке или халате.', 2, 8, 35, 52, 14],
  ['МК: детская группа — роспись футболок', 'роспись', '6+, акрил на ткани, фартуки для детей.', 1.5, 14, 22, 55, 11],
  ['МК: стразы на джинсах', 'стразы', 'Карманы, швы, устойчивость к стирке.', 2.5, 10, 42, 60, 15],
  ['МК: смешанная техника на жилете', 'комбо', 'Вышивка + аппликация.', 3, 6, 75, 63, 12],
  ['МК: ночник — роспись текстиля для дома', 'роспись', 'Подушки, панно.', 2, 12, 33, 67, 18],
  ['МК: подарочный сертификат + мини-МК', 'принт', 'Оформление и быстрый перенос лого.', 1, 16, 20, 70, 17],
  ['МК: пайетки и люрекс', 'вышивка', 'Блёстки без «сыпучести», закрепление.', 2.5, 8, 48, 75, 16],
];

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  await prisma.workshopRegistration.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.decoSupply.deleteMany();
  await prisma.service.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@salon.local',
      passwordHash: hash,
      name: 'Администратор',
      role: Role.ADMIN,
    },
  });
  await prisma.clientProfile.create({
    data: { userId: admin.id, phone: '+375 29 000-00-01', address: 'Студия кастомизации' },
  });

  const services = [];
  for (const [name, desc, price] of serviceNames) {
    services.push(
      await prisma.service.create({
        data: {
          name,
          description: desc,
          basePrice: price,
          durationMin: 45 + Math.floor(Math.random() * 60),
        },
      })
    );
  }

  const supplies = [];
  for (let i = 0; i < 45; i++) {
    const category = materials[i % materials.length];
    const variants = supplyNamePool[category];
    const baseName = variants[i % variants.length];
    const [minPrice, maxPrice] = supplyPriceRanges[category] || [3.0, 12.0];
    supplies.push(
      await prisma.decoSupply.create({
        data: {
          name: baseName,
          color: colors[i % colors.length],
          category,
          packNote: i % 3 === 0 ? 'стандарт' : i % 3 === 1 ? 'премиум' : 'набор',
          stockQty: Math.round(5 + Math.random() * 120),
          pricePerUnit: randomMoney(minPrice, maxPrice),
          supplier: `Поставщик декора ${(i % 12) + 1}`,
        },
      })
    );
  }

  const clients = [];
  for (let i = 0; i < 55; i++) {
    const u = await prisma.user.create({
      data: {
        email: `client${i + 1}@demo.local`,
        passwordHash: hash,
        name: `Клиент ${i + 1}`,
        role: Role.CLIENT,
      },
    });
    const profile = await prisma.clientProfile.create({
      data: {
        userId: u.id,
        phone: `+37529${String(1000000 + i).slice(-7)}`,
        address: `г. Могилёв, ул. Демо ${i + 1}`,
      },
    });
    clients.push({ user: u, profile });
  }

  const workshops = [];
  for (let i = 0; i < workshopTemplates.length; i++) {
    const [title, topic, description, hours, maxSeats, priceHint, daysFromNow, hourStart] =
      workshopTemplates[i];
    const day = new Date();
    day.setDate(day.getDate() + daysFromNow);
    day.setHours(hourStart, 0, 0, 0);
    const end = new Date(day.getTime() + hours * 60 * 60 * 1000);
    workshops.push(
      await prisma.workshop.create({
        data: {
          title,
          topic,
          description,
          startAt: day,
          endAt: end,
          place: i % 2 === 0 ? 'Студия AlterEgo' : 'Зал мастер-классов',
          maxSeats,
          priceHint: priceHint > 0 ? priceHint : null,
        },
      })
    );
  }

  let regCount = 0;
  for (const w of workshops) {
    const n = 3 + (w.maxSeats % 5);
    for (let k = 0; k < n && k < clients.length; k++) {
      const idx = (w.title.length + k * 7) % clients.length;
      try {
        await prisma.workshopRegistration.create({
          data: { workshopId: w.id, userId: clients[idx].user.id },
        });
        regCount++;
      } catch {
        /* unique collision */
      }
    }
  }

  const statuses = Object.values(OrderStatus);
  let orderCount = 0;
  let itemCount = 0;
  let histCount = 0;

  const orderExamples = [
    'своя футболка — рисунок из страз',
    'сумка — роспись красками по эскизу',
    'корп: фартуки для кофейни с принтом и наклейками',
    'скучная футболка — полноценный декор стразами',
    'корп: 20 фартуков, логотип + термотрансфер',
    'худи — кастом-принт и надпись',
    'рюкзак — аппликация и роспись',
    'мерч: 40 футболок для команды (тираж)',
  ];

  for (let o = 0; o < 75; o++) {
    const c = clients[o % clients.length];
    const status = statuses[o % statuses.length];
    const service = services[o % services.length];
    const example = orderExamples[o % orderExamples.length];
    const isCorporate = /корп|мерч|тираж/i.test(example);
    const batchQty = isCorporate ? 8 + (o % 18) : 1;
    const unitPrice = Number(service.basePrice);
    const order = await prisma.order.create({
      data: {
        customerId: c.user.id,
        title: `Заказ №${1000 + o}: ${example}`,
        status,
        totalPrice: unitPrice,
        deadline: new Date(Date.now() + (o % 30) * 86400000),
        notes:
          o % 3 === 0
            ? 'Частный заказ: своя вещь, доработка под клиента'
            : o % 3 === 1
              ? `Корпоратив: согласован макет, тираж ${batchQty} ед.`
              : `Описание изделия и желаемого декора (демо)${batchQty > 1 ? `, тираж ${batchQty} ед.` : ''}`,
      },
    });
    orderCount++;

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        serviceId: service.id,
        supplyId: null,
        quantity: 1,
        unitPrice,
      },
    });
    itemCount++;

    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status, message: 'Статус при создании' },
    });
    histCount++;
    if (o % 2 === 0) {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.PRODUCTION, message: 'В работе у дизайнера-декоратора' },
      });
      histCount++;
    }
  }

  console.log(
    JSON.stringify(
      {
        users: 1 + clients.length,
        workshops: workshops.length,
        workshopRegistrations: regCount,
        services: services.length,
        decoSupplies: supplies.length,
        orders: orderCount,
        orderItems: itemCount,
        statusHistory: histCount,
        totalApprox:
          1 +
          clients.length +
          workshops.length +
          regCount +
          services.length +
          supplies.length +
          orderCount +
          itemCount +
          histCount +
          (1 + clients.length),
      },
      null,
      2
    )
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
