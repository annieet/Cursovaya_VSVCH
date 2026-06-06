import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as api from '../api/client.js';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../store/uiSlice.js';

export function OrderNewPage() {
  const theme = useTheme();
  const compactStepper = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [batchUnits, setBatchUnits] = useState(1);

  useEffect(() => {
    if (user?.role !== 'CLIENT') {
      dispatch(showSnackbar({ message: 'Новые заказы создают клиенты', severity: 'warning' }));
      nav('/orders');
    }
  }, [user, nav, dispatch]);

  useEffect(() => {
    api.api('/services').then(setServices).catch(() => {});
  }, []);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!title || !serviceId) {
      dispatch(showSnackbar({ message: 'Укажите название и выберите вид работ', severity: 'warning' }));
      return;
    }
    const srv = services.find((x) => x.id === serviceId);
    const batchQty = Math.max(1, Number(batchUnits) || 1);
    const notesWithBatch =
      batchQty > 1
        ? `${notes ? `${notes}\n` : ''}Тираж для расчета материалов: ${batchQty} ед.`
        : notes;
    const items = [
      {
        serviceId,
        supplyId: null,
        quantity: 1,
        unitPrice: Number(srv?.basePrice || 0),
      },
    ];
    try {
      const order = await api.api('/orders', {
        method: 'POST',
        body: { title, notes: notesWithBatch, deadline, items },
      });
      dispatch(showSnackbar({ message: 'Заказ создан', severity: 'success' }));
      nav(`/orders/${order.id}`);
    } catch (e) {
      dispatch(showSnackbar({ message: e.message, severity: 'error' }));
    }
  };

  if (user?.role !== 'CLIENT') return null;

  return (
    <Box component="section">
      <Typography variant="h4" gutterBottom>
        Новый заказ на декор
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Опишите свою вещь и идею декора: мастера студии выполнят работу, а готовое можно забрать или получить
        отправкой — как договоритесь. Выберите вид работы и количество изделий, материалы подбирает сотрудник на
        производстве.
      </Typography>
      <Stepper
        activeStep={step}
        alternativeLabel={compactStepper}
        sx={{
          mb: 3,
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
            lineHeight: 1.25,
            whiteSpace: { xs: 'normal', sm: 'nowrap' },
            textAlign: 'center',
          },
          '& .MuiStepConnector-root': {
            flex: { xs: '1 1 16px', sm: '1 1 auto' },
          },
        }}
      >
        <Step>
          <StepLabel>Данные</StepLabel>
        </Step>
        <Step>
          <StepLabel>Вид работы</StepLabel>
        </Step>
        <Step>
          <StepLabel>Подтверждение</StepLabel>
        </Step>
      </Stepper>

      {step === 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Название заказа"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Например: своя футболка — узор стразами, или 12 фартуков для кофейни с логотипом"
              />
              <TextField
                label="Что делаем с изделием"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Цвет вещи, желаемый рисунок, ссылка на референс, тираж для корпоратива…"
              />
              <TextField
                label="Тираж (для расчёта материалов)"
                type="number"
                value={batchUnits}
                onChange={(e) => setBatchUnits(Math.max(1, Number(e.target.value) || 1))}
                inputProps={{ min: 1, step: 1 }}
                helperText="Не умножает цену ручной работы, используется как ориентир по материалам."
              />
              <TextField
                label="Желаемая дата готовности"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={next} disabled={!title}>
                Далее
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Выберите один основной вид работы для заказа
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Материалы по заказу выбирает сотрудник на этапе производства. Это не увеличивает число видов работ в
              заказе и не дублирует стоимость услуги.
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              label="Вид работы"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} — от {s.basePrice} BYN
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button onClick={back}>Назад</Button>
              <Button variant="contained" onClick={next} disabled={!serviceId}>
                Далее
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent>
            <Typography>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {notes}
            </Typography>
            <ul>
              <li>
                {services.find((x) => x.id === serviceId)?.name}
              </li>
            </ul>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Работа мастера: <strong>{Math.round(Number(services.find((x) => x.id === serviceId)?.basePrice || 0) * 100) / 100} BYN</strong>
              {Math.max(1, Number(batchUnits) || 1) > 1 ? (
                <>
                  {' '}
                  · Тираж: <strong>{Math.max(1, Number(batchUnits) || 1)} ед.</strong>
                </>
              ) : null}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button onClick={back}>Назад</Button>
              <Button variant="contained" onClick={submit}>
                Отправить заказ
              </Button>
              <Button component={RouterLink} to="/orders" variant="text">
                Отмена
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
