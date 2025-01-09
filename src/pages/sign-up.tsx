import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const db = getFirestore();

      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Add user to Firestore
      await addDoc(collection(db, 'users'), {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });

      toast.success('Sign up successful!');
      navigate('/sign-in');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ px: 3 }}>
      <Typography variant="h5">Sign Up</Typography>

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        name="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <LoadingButton
        fullWidth
        size="large"
        variant="contained"
        onClick={handleSignUp}
        loading={loading}
      >
        Sign Up
      </LoadingButton>
    </Box>
  );
}
