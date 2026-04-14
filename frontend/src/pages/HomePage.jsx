import { useEffect, useLayoutEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Stack,
  Alert,
  Paper,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useSelector } from 'react-redux';
import * as api from '../api/client.js';
import { isUiPreview } from '../lib/uiPreview.js';
import { HomeHeroCollage } from '../components/HomeHeroCollage.jsx';

/** Обводка: сначала ищем PNG (прозрачный фон → красный точнее), иначе JPG */
const ORDER_SECTION_RING_PNG = '/order-section-scribble.png';
const ORDER_SECTION_RING_JPG = '/order-section-scribble.jpg';

/** Фон главной: положите файлы в client/public/images/home-bg/ */
const HOME_BG_GRAFFITI = '/images/home-bg/graffiti-bg.png';
const HOME_BG_LEFT = '/images/home-bg/ink-left.png';
const HOME_BG_STROKE = '/images/home-bg/stroke-side.png';

/** Шаги на главной: одна высота карточки и фото на desktop */
const STEP_BLOCK_MAX_W = { xs: 360, sm: 372, md: 356 };
const STEP_ROW_HEIGHT_MD = 264;
const STEP_IMAGE_HEIGHT_XS = 208;

const orderSteps = [
  {
    title: 'Оформите заявку',
    text: 'Зарегистрируйтесь, выберите виды работ и опишите вещь: футболка, сумка, тираж фартуков для кафе — как удобно',
    image: '/images/home-steps/step-01.png',
    imageAlt: 'Оформление заказа онлайн',
  },
  {
    title: 'Согласуем макет онлайн',
    text: 'Обсудим эскиз, цвета и сроки по телефону, в мессенджере или на созвоне — часто вещь даже не нужно привозить, пока не утвердим идею Можно начать с фото сумки или футболки',
    image: '/images/home-steps/step-02.jpg',
    imageAlt: 'Согласование эскиза и макета',
  },
  {
    title: 'Передайте вещь в студию',
    text: 'Отправьте посылкой (почта, курьер) или привезите лично — как удобнее Многие клиенты высылают старую сумку, мы расписываем и отправляем обратно уже кастомную',
    image: '/images/home-steps/step-03.png',
    imageAlt: 'Коробки и отправления — передача вещи почтой или курьером',
  },
  {
    title: 'Делаем декор',
    text: 'Мастера выполняют работу в студии: стразы, вышивка, роспись, принт — что выбрали в заказе',
    image: '/images/home-steps/step-04.jpg',
    imageAlt: 'Ручная работа и декор',
  },
  {
    title: 'Получите готовое',
    text: 'Заберёте в студии или мы отправим вам посылкой — заранее согласуем способ и адрес Статус заказа смотрите в личном кабинете',
    image: '/images/home-steps/step-05.png',
    imageAlt: 'Готовая вещь в руках',
  },
];

export function HomePage() {
  const user = useSelector((s) => s.auth.user);
  const [orderRing, setOrderRing] = useState({ show: false, src: '' });
  const [appts, setAppts] = useState([]);
  const [viewportInnerW, setViewportInnerW] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.clientWidth : 0,
  );
  const staff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useLayoutEffect(() => {
    const sync = () => setViewportInnerW(document.documentElement.clientWidth);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    if (!user || staff || isUiPreview()) return;
    api
      .api('/appointments?from=' + new Date().toISOString())
      .then(setAppts)
      .catch(() => {});
  }, [user, staff]);

  useEffect(() => {
    const png = new Image();
    png.onload = () => setOrderRing({ show: true, src: ORDER_SECTION_RING_PNG });
    png.onerror = () => {
      const jpg = new Image();
      jpg.onload = () => setOrderRing({ show: true, src: ORDER_SECTION_RING_JPG });
      jpg.onerror = () => setOrderRing({ show: false, src: '' });
      jpg.src = ORDER_SECTION_RING_JPG;
    };
    png.src = ORDER_SECTION_RING_PNG;
  }, []);

  const next = appts[0];

  return (
    <Box component="article" sx={{ position: 'relative' }}>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={HOME_BG_GRAFFITI}
          alt=""
          draggable={false}
          sx={{
            position: 'absolute',
            right: { xs: '-16%', sm: '-10%', md: '-6%' },
            top: { xs: '9%', md: '13%' },
            width: { xs: '118%', md: 'min(88vw, 920px)' },
            maxWidth: 1180,
            height: 'auto',
            opacity: { xs: 0.17, md: 0.2 },
            mixBlendMode: 'multiply',
            userSelect: 'none',
          }}
        />
        <Box
          component="img"
          src={HOME_BG_LEFT}
          alt=""
          draggable={false}
          sx={{
            position: 'absolute',
            left: { xs: '-10%', sm: '-6%', md: '-4%' },
            top: { xs: '6%', md: '5%' },
            width: { xs: 'min(88vw, 420px)', sm: 'min(52vw, 480px)', md: 'min(44vw, 580px)' },
            maxWidth: 620,
            height: 'auto',
            opacity: { xs: 0.26, md: 0.33 },
            mixBlendMode: 'multiply',
            userSelect: 'none',
          }}
        />
        <Box
          component="img"
          src={HOME_BG_STROKE}
          alt=""
          draggable={false}
          sx={{
            position: 'absolute',
            right: { xs: '2%', md: '4%' },
            bottom: { xs: '8%', md: '12%' },
            width: { xs: 90, sm: 120, md: 160 },
            height: 'auto',
            opacity: { xs: 0.17, md: 0.2 },
            mixBlendMode: 'multiply',
            transform: 'scaleX(-1) rotate(12deg)',
            userSelect: 'none',
          }}
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {!staff && next && !isUiPreview() && (
        <Alert severity="info" sx={{ mb: 3 }} icon={false}>
          У вас запланирован визит: {new Date(next.startAt).toLocaleString('ru-RU')} — {next.kind}
        </Alert>
      )}

      {/* clientWidth ≈ видимая ширина; maxWidth:100% ломало — обрезало до узкой колонки main и давало серый зазор */}
      <Box
        sx={{
          width: viewportInnerW > 0 ? `${viewportInnerW}px` : '100vw',
          minWidth: viewportInnerW > 0 ? `${viewportInnerW}px` : undefined,
          maxWidth: 'none',
          boxSizing: 'border-box',
          marginLeft:
            viewportInnerW > 0 ? `calc(50% - ${viewportInnerW / 2}px)` : 'calc(50% - 50vw)',
          marginRight:
            viewportInnerW > 0 ? `calc(50% - ${viewportInnerW / 2}px)` : 'calc(50% - 50vw)',
        }}
      >
      <Paper
        elevation={0}
        sx={{
          p: 0,
          mb: 4,
          borderRadius: 0,
          border: 'none',
          borderBottom: '1px solid rgba(26,26,26,0.08)',
          overflowX: 'visible',
          overflowY: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: 'none',
          position: 'relative',
          width: '100%',
        }}
      >
        <HomeHeroCollage />
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 5, lg: 6, xl: 8 },
            py: { xs: 3, md: 4 },
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid rgba(26,26,26,0.08)',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 22, color: 'secondary.main' }} />
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Почему AlterEgo
            </Typography>
          </Stack>

          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontSize: { xs: '1.35rem', sm: '1.65rem', md: '2rem' },
              maxWidth: 820,
              width: '100%',
              mx: 'auto',
              color: 'primary.main',
              lineHeight: 1.2,
              textTransform: 'none',
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            Ваша вещь — с характером: декор, который её раскрывает
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mb: 2,
              maxWidth: 680,
              width: '100%',
              mx: 'auto',
              fontWeight: 500,
              color: 'text.secondary',
              lineHeight: 1.55,
              textTransform: 'none',
              fontFamily: '"Manrope", sans-serif',
              letterSpacing: 0,
            }}
          >
            Добавим образу характер — ярко и аккуратно, чтобы вещь хотелось носить и показывать
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent="center"
            sx={{ mb: 3, gap: 1 }}
          >
            <Chip label="Кастом под себя" color="secondary" variant="outlined" sx={{ bgcolor: 'rgba(193,18,31,0.06)' }} />
            <Chip label="Корпоратив и мерч" variant="outlined" />
            <Chip label="Мастер-классы" variant="outlined" />
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            <Button component={RouterLink} to="/orders/new" variant="contained" color="secondary" size="large">
              Оформить заказ
            </Button>
            <Button component={RouterLink} to="/services" variant="outlined" color="primary" size="large">
              Смотреть виды работ
            </Button>
          </Stack>
        </Box>
      </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, width: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: 'min(760px, calc(100% - 24px))',
            boxSizing: 'border-box',
            px: { xs: 4.5, sm: 7 },
            py: { xs: 4.25, sm: 5.75 },
          }}
        >
          {orderRing.show ? (
            <Box
              component="img"
              src={orderRing.src}
              alt=""
              aria-hidden
              draggable={false}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '122%',
                height: '128%',
                objectFit: 'fill',
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none',
                opacity: 0.42,
                /* без перекраски: JPG — multiply убирает белый фон; PNG — как в файле */
                mixBlendMode: orderRing.src.toLowerCase().endsWith('.png') ? 'normal' : 'multiply',
              }}
            />
          ) : null}
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'text.primary' }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 1 }}>
              Как сделать заказ
            </Typography>
            <Box component="div">
              <Typography
                variant="body1"
                component="p"
                sx={{ m: 0, lineHeight: 1.55, fontWeight: 600, color: '#000000' }}
              >
                Пять шагов — от идеи до готового результата,
              </Typography>
              <Typography
                variant="body1"
                component="p"
                sx={{ m: 0, mt: 0.75, lineHeight: 1.55, fontWeight: 600, color: '#000000' }}
              >
                который хочется носить и показывать
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Stack spacing={3} sx={{ mb: 5, alignItems: 'center' }}>
        {orderSteps.map((step, i) => (
          <Box
            key={step.title}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 2, md: 2.5 },
              alignItems: 'center',
              justifyItems: 'center',
              width: '100%',
              maxWidth: { xs: '100%', md: 732 },
              mx: { md: 'auto' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                maxWidth: STEP_BLOCK_MAX_W,
                minWidth: 0,
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  width: '100%',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  height: { xs: 'auto', md: STEP_ROW_HEIGHT_MD },
                  minHeight: { md: STEP_ROW_HEIGHT_MD },
                }}
              >
                <CardContent
                  sx={{
                    py: { xs: 1.5, md: 1.25 },
                    px: { xs: 1.75, sm: 2 },
                    flex: 1,
                    minHeight: 0,
                    overflowY: { md: 'auto' },
                    '&:last-child': { pb: { xs: 1.5, md: 1.25 } },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="span"
                    color="secondary"
                    sx={{
                      fontSize: { xs: '1.75rem', md: '1.6rem' },
                      fontWeight: 700,
                      lineHeight: 1,
                      display: 'block',
                      mb: { xs: 1, md: 0.75 },
                    }}
                  >
                    {i + 1}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ fontSize: { xs: '1.0625rem', md: '1.05rem' }, lineHeight: 1.3, mb: 0.75, display: 'block' }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.5 }}>
                    {step.text}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                maxWidth: STEP_BLOCK_MAX_W,
                minWidth: 0,
              }}
            >
              <Box
                component="figure"
                sx={{
                  m: 0,
                  width: '100%',
                  height: { xs: STEP_IMAGE_HEIGHT_XS, md: STEP_ROW_HEIGHT_MD },
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(5,5,5,0.1)',
                  bgcolor: 'grey.100',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={step.image}
                  alt={step.imageAlt}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          width: viewportInnerW > 0 ? `${viewportInnerW}px` : '100vw',
          minWidth: viewportInnerW > 0 ? `${viewportInnerW}px` : undefined,
          maxWidth: 'none',
          boxSizing: 'border-box',
          marginLeft:
            viewportInnerW > 0 ? `calc(50% - ${viewportInnerW / 2}px)` : 'calc(50% - 50vw)',
          marginRight:
            viewportInnerW > 0 ? `calc(50% - ${viewportInnerW / 2}px)` : 'calc(50% - 50vw)',
          mt: 4,
          mb: 0,
        }}
      >
        <Box
          sx={{
            py: { xs: 2.5, sm: 3 },
            px: { xs: 2, sm: 3, md: 4, lg: 5 },
            borderTop: '1px solid rgba(5,5,5,0.08)',
            bgcolor: 'background.paper',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 720, mx: 'auto', lineHeight: 1.6, px: { xs: 0, sm: 1 } }}
          >
            Остались вопросы? Связь со службой поддержки скоро появится на сайте — здесь будет форма или контакты для
            вопросов по заказу, срокам и материалам.
          </Typography>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
