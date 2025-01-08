import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Rating from '@mui/material/Rating';
import TablePagination from '@mui/material/TablePagination';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { collection, getDocs, deleteDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Feedback {
  id: string;
  name: string;
  email: string;
  title: string;
  thoughts: string;
  commentsOpen: boolean;
  rating: number;
  createdAt?: any;
  updatedAt?: any;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  borderRadius: '8px',
};

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Feedback | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedThoughts, setSelectedThoughts] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'feedbacks'));
        const feedbackList = querySnapshot.docs.map((feedbackDoc) => ({
          id: feedbackDoc.id,
          ...feedbackDoc.data(),
        })) as Feedback[];
        setFeedbacks(feedbackList);
        setFilteredFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    // Apply search filter
    const filtered = feedbacks.filter(
      (feedback) =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [searchTerm, feedbacks]);

  useEffect(() => {
    // Filter by date range
    const filtered = feedbacks.filter((feedback) => {
      const createdAt = feedback.createdAt?.toDate();
      if (startDate && createdAt && createdAt < new Date(startDate)) {
        return false;
      }
      if (endDate && createdAt && createdAt > new Date(endDate)) {
        return false;
      }
      return true;
    });
    setFilteredFeedbacks(filtered);
  }, [startDate, endDate, feedbacks]);

  const handleSort = (field: keyof Feedback) => {
    const isAsc = sortBy === field && sortDirection === 'asc';
    setSortBy(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
    const sorted = [...filteredFeedbacks].sort((a, b) => {
      if (a[field] < b[field]) return isAsc ? -1 : 1;
      if (a[field] > b[field]) return isAsc ? 1 : -1;
      return 0;
    });
    setFilteredFeedbacks(sorted);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    navigate('/add-feedback');
  };

  const handleUpdate = (id: string) => {
    navigate(`/update-feedback/${id}`);
  };

  const handleDelete = async () => {
    if (selectedFeedbackId) {
      try {
        await deleteDoc(firestoreDoc(db, 'feedbacks', selectedFeedbackId));
        setFeedbacks((prevFeedbacks) =>
          prevFeedbacks.filter((feedback) => feedback.id !== selectedFeedbackId)
        );
        toast.success('Feedback successfully deleted!');
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Error deleting feedback. Please try again.');
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedFeedbackId(null);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedFeedbackId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFeedbackId(null);
  };

  const openDetailsModal = (thoughts: string) => {
    setSelectedThoughts(thoughts);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedThoughts('');
  };

  const csvHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Title', key: 'title' },
    { label: 'Thoughts', key: 'thoughts' },
    { label: 'Comments Open', key: 'commentsOpen' },
    { label: 'Rating', key: 'rating' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];

  const paginatedFeedbacks = filteredFeedbacks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Feedbacks
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="contained" onClick={handleAdd}>
          Add Feedback
        </Button>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: '300px' }}
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <CSVLink
          data={feedbacks}
          headers={csvHeaders}
          filename="feedbacks.csv"
          className="btn btn-primary"
        >
          <Button variant="outlined">Download CSV</Button>
        </CSVLink>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    'name',
                    'email',
                    'title',
                    'rating',
                    'commentsOpen',
                    'createdAt',
                    'updatedAt',
                  ].map((field) => (
                    <TableCell key={field}>
                      <TableSortLabel
                        active={sortBy === field}
                        direction={sortDirection}
                        onClick={() => handleSort(field as keyof Feedback)}
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.email}</TableCell>
                    <TableCell>{feedback.title}</TableCell>
                    <TableCell>
                      <Rating value={feedback.rating} readOnly />
                    </TableCell>
                    <TableCell>{feedback.commentsOpen ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {feedback.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {feedback.updatedAt?.toDate().toLocaleDateString() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleUpdate(feedback.id)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteModal(feedback.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredFeedbacks.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Grid>
      </Grid>

      {/* Delete Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="delete-modal-title" variant="h6">
            Are you sure?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Yes
            </Button>
            <Button variant="outlined" onClick={closeDeleteModal}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
        aria-labelledby="details-modal-title"
        aria-describedby="details-modal-description"
      >
        <Box sx={{ ...modalStyle, width: 500 }}>
          <Typography id="details-modal-title" variant="h6" sx={{ mb: 2 }}>
            Thoughts Details
          </Typography>
          <Box
            id="details-modal-description"
            dangerouslySetInnerHTML={{ __html: selectedThoughts }}
            sx={{ textAlign: 'left' }}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={closeDetailsModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </DashboardContent>
  );
}
