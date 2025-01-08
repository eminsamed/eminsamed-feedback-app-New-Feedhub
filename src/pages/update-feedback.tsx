import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Rating from '@mui/material/Rating';
import { db } from '../firebase';

interface FormData {
  name: string;
  email: string;
  title: string;
  thoughts: string;
  commentsOpen: boolean;
  rating: number;
}

export default function UpdateFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    title: '',
    thoughts: '',
    commentsOpen: false,
    rating: 0,
  });

  const steps = ['Personal Information', 'Feedback Details'];

  // Fetch the existing feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      if (id) {
        try {
          const feedbackDoc = await getDoc(doc(db, 'feedbacks', id));
          if (feedbackDoc.exists()) {
            setFormData(feedbackDoc.data() as FormData);
          } else {
            toast.error('Feedback not found.');
            navigate('/feedbacks');
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
          toast.error('Error fetching feedback.');
        }
      }
    };

    fetchFeedback();
  }, [id, navigate]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (id) {
      try {
        const updatedData = {
          ...formData,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, 'feedbacks', id), updatedData);
        toast.success('Feedback successfully updated!');
        navigate('/feedbacks');
      } catch (error) {
        console.error('Error updating feedback:', error);
        toast.error('Error updating feedback. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ width: '80%', margin: 'auto', mt: 5 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 3 }}>
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Box>
        )}
        {activeStep === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <Typography variant="subtitle1">Your Thoughts</Typography>
            <ReactQuill
              theme="snow"
              value={formData.thoughts}
              onChange={(value) => handleChange('thoughts', value)}
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Rate Us
            </Typography>
            <Rating
              name="feedback-rating"
              value={formData.rating}
              onChange={(event, newValue) => handleChange('rating', newValue || 0)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.commentsOpen}
                  onChange={(e) => handleChange('commentsOpen', e.target.checked)}
                />
              }
              label="Allow Comments"
            />
          </Box>
        )}
        {activeStep === steps.length && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Steps Completed
            </Typography>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
          Back
        </Button>
        {activeStep < steps.length && (
          <Button onClick={handleNext} variant="contained">
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
