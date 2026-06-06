import { Typography, Box, Card, CardContent, Button, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { getStoredToken } from '../api/client.js';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadReport(path, filename) {
  const token = getStoredToken();
  const res = await fetch(`/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Ошибка загрузки отчёта');
  const blob = await res.blob();
  downloadBlob(blob, filename);
}

export function ReportsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отчёты
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Выгрузки для администратора и дизайнеров: заказы и склад материалов (PDF и DOCX).
      </Typography>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Сводка по заказам
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              PDF: заказы с клиентами и выбранными видами декора.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => downloadReport('/reports/orders-summary.pdf', 'orders-summary.pdf')}
            >
              Скачать PDF
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Остатки материалов
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              DOCX: остатки страз, красок, ниток и расходников для декора на складе.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => downloadReport('/reports/supplies-stock.docx', 'supplies-stock.docx')}
            >
              Скачать DOCX
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
