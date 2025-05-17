import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, FormErrorMessage, Text
} from '@chakra-ui/react';

interface CaisseWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, description: string) => void;
  caisseName: string;
  currentBalance: number;
}

const CaisseWithdrawalModal = ({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  caisseName, 
  currentBalance 
}: CaisseWithdrawalModalProps) => {
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
    } else if (amount > currentBalance) {
      newErrors.amount = 'Amount cannot exceed current balance';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    onWithdraw(amount, description);
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
        <ModalHeader>Withdraw Funds from {caisseName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Current Balance: <strong>${currentBalance.toFixed(2)}</strong>
          </Text>
          
          <FormControl isInvalid={!!errors.amount} isRequired mb={4}>
            <FormLabel>Amount</FormLabel>
            <NumberInput min={0.01} max={currentBalance} precision={2} value={amount}>
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
            colorScheme="red" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || currentBalance <= 0}
          >
            Withdraw Funds
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CaisseWithdrawalModal;
