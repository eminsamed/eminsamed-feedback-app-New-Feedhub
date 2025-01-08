import { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { toast } from 'react-toastify';

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

export default function Users() {
  const [users, setUsers] = useState<{ email: string; uid: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();

        // Firestore'dan kullanıcıları al
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map((userDoc) => ({
          email: userDoc.data().email,
          uid: userDoc.id, // userDoc.id gives the document ID
        }));

        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const openDeleteModal = (uid: string) => {
    setSelectedUserId(uid);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  // const handleDelete = async () => {
  //   if (selectedUserId) {
  //     try {
  //       const db = getFirestore();
  //       await deleteDoc(firestoreDoc(db, 'users', selectedUserId));
  //       setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== selectedUserId));
  //       toast.success('User successfully deleted!');
  //     } catch (error) {
  //       console.error('Error deleting user:', error);
  //       toast.error('Error deleting user. Please try again.');
  //     } finally {
  //       closeModal();
  //     }
  //   }
  // };

  const handleDelete = async () => {
    if (selectedUserId) {
      try {
        const db = getFirestore();
        const auth = getAuth();

        // Delete user document from Firestore
        await deleteDoc(firestoreDoc(db, 'users', selectedUserId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== selectedUserId));

        // Delete user from Firebase Authentication
        const user = auth.currentUser;
        if (user && user.uid === selectedUserId) {
          await deleteUser(user);
        }

        toast.success('User successfully deleted!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error deleting user. Please try again.');
      } finally {
        closeModal();
      }
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 3 } }}>
        Users
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>UID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.uid}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteModal(user.uid)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6">
            Are you sure you want to delete this user?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Yes
            </Button>
            <Button variant="outlined" onClick={closeModal}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </DashboardContent>
  );
}
