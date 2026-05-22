import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { studentsService } from '../services/students.service';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsService.getAllStudents();
      setStudents(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Talabalirni yuklashda xato');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenDialog = (student = null) => {
    setSelectedStudent(student);
    setFormData(student || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (selectedStudent) {
        await studentsService.updateStudent(selectedStudent.id, formData);
      } else {
        await studentsService.createStudent(formData);
      }
      fetchStudents();
      handleCloseDialog();
    } catch (err) {
      setError(err?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('O\'chirish rostlaysizmi?')) {
      try {
        await studentsService.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        setError(err?.message || 'Talabani o\'chirishdagi xato');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Talabalir ({students.length})</h2>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Yangi Talaba Qo'shish
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>F.I.O</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Adresi</TableCell>
              <TableCell align="right">Harakati</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Talabalir topilmadi
                </TableCell>
              </TableRow>
            ) : (
              students.map(student => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.address}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(student)}
                      sx={{ mr: 1 }}
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(student.id)}
                    >
                      O'chirish
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedStudent ? 'Talabani Tahrirlash' : 'Yangi Talaba'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Ismi"
            value={formData.firstName || ''}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
          <TextField
            fullWidth
            label="Familiyasi"
            value={formData.lastName || ''}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Telefon"
            value={formData.phone || ''}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Adresi"
            value={formData.address || ''}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Bekor qilish</Button>
          <Button onClick={handleSave} variant="contained">
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
