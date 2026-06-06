-- Выполните в pgAdmin: подключитесь к серверу → Query Tool → вставьте и выполните (F5).
-- База для Prisma (имя должно совпадать с путём в DATABASE_URL после последнего /).

CREATE DATABASE salon_kastomnoy_odezdy
  WITH ENCODING = 'UTF8'
  TEMPLATE = template0;

-- Если база уже есть, будет ошибка — это нормально, пропустите или закомментируйте блок выше.
