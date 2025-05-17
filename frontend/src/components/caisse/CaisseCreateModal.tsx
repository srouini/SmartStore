import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, FormErrorMessage, useToast
} from '@chakra-ui/react';
import { createCaisse } from '../../services/caisseService';

interface CaisseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCaisse: () => void;
}

const CaisseCreateModal = ({ isOpen, onClose, onCreateCaisse }: CaisseCreateModalProps) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const toast = useToast();

  const handleSubmit = async () => {
    // Validate
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createCaisse({ name });
      toast({
        title: 'Cash register created',
        description: `${name} has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCreateCaisse();
      
      // Reset form
      setName('');
      setErrors({});
    } catch (error) {
      toast({
        title: 'Error creating cash register',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setName('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Cash Register</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!errors.name} isRequired mb={4}>
            <FormLabel>Name</FormLabel>
            <Input 
              placeholder="Enter cash register name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CaisseCreateModal;
