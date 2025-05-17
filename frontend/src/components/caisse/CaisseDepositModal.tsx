import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, FormErrorMessage
} from '@chakra-ui/react';

interface CaisseDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, description: string) => void;
  caisseName: string;
}

const CaisseDepositModal = ({ isOpen, onClose, onDeposit, caisseName }: CaisseDepositModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{
    amount?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // Validate
    const newErrors: {amount?: string} = {};
    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    onDeposit(amount, description);
    setIsSubmitting(false);
    
    // Reset form
    setAmount(0);
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    // Reset form on close
    setAmount(0);
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Funds to {caisseName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!errors.amount} isRequired mb={4}>
            <FormLabel>Amount</FormLabel>
            <NumberInput min={0.01} precision={2} value={amount}>
              <NumberInputField 
                placeholder="Enter amount" 
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </NumberInput>
            {errors.amount && <FormErrorMessage>{errors.amount}</FormErrorMessage>}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Input 
              placeholder="Enter description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="green" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Add Funds
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CaisseDepositModal;
