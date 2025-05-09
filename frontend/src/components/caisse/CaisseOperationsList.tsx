import { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Text, Flex, Select, Input, Button,
  HStack, Spinner, Center, Heading
} from '@chakra-ui/react';
import { getCaisseOperations } from '../../services/caisseService';
import { CaisseOperation, PaginatedResponse } from '../../types/Caisse';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface CaisseOperationsListProps {
  caisseId: number;
}

const CaisseOperationsList = ({ caisseId }: CaisseOperationsListProps) => {
  const [operations, setOperations] = useState<CaisseOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationData, setPaginationData] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [page, setPage] = useState(1);
  const [operationType, setOperationType] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOperations();
  }, [caisseId, page, operationType, dateRange]);

  const fetchOperations = async () => {
    setIsLoading(true);
    try {
      const filters = {
        caisse: caisseId,
        operation_type: operationType || undefined,
        start_date: dateRange.startDate || undefined,
        end_date: dateRange.endDate || undefined,
        search: searchTerm || undefined,
      };

      const response: PaginatedResponse<CaisseOperation> = await getCaisseOperations(page, filters);
      setOperations(response.results);
      setPaginationData({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOperations();
  };

  const getOperationBadgeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'green';
      case 'WITHDRAWAL':
        return 'red';
      case 'SALE':
        return 'blue';
      case 'PURCHASE_PAYMENT':
        return 'orange';
      case 'ADJUSTMENT':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Cash Register Operations</Heading>
      
      <HStack spacing={4} mb={4} flexWrap="wrap">
        <Select 
          placeholder="Operation Type" 
          value={operationType}
          onChange={(e) => setOperationType(e.target.value)}
          minW="180px"
        >
          <option value="">All Operations</option>
          <option value="DEPOSIT">Deposits</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="SALE">Sales</option>
          <option value="PURCHASE_PAYMENT">Purchase Payments</option>
          <option value="ADJUSTMENT">Adjustments</option>
        </Select>
        
        <Input 
          type="date" 
          placeholder="Start Date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
        />
        
        <Input 
          type="date" 
          placeholder="End Date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
        />
        
        <Input 
          placeholder="Search description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Button colorScheme="blue" onClick={handleSearch}>
          Search
        </Button>
      </HStack>

      {isLoading ? (
        <Center p={10}>
          <Spinner size="xl" />
        </Center>
      ) : operations.length === 0 ? (
        <Center p={10}>
          <Text>No operations found</Text>
        </Center>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Balance After</Th>
                  <Th>Description</Th>
                  <Th>Performed By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {operations.map((operation) => (
                  <Tr key={operation.id}>
                    <Td>{formatDate(operation.timestamp)}</Td>
                    <Td>
                      <Badge colorScheme={getOperationBadgeColor(operation.operation_type)}>
                        {operation.operation_type_display}
                      </Badge>
                    </Td>
                    <Td color={Number(operation.amount) >= 0 ? 'green.500' : 'red.500'} fontWeight="bold">
                      {Number(operation.amount) >= 0 ? '+' : ''}{Number(operation.amount).toFixed(2)}
                    </Td>
                    <Td>{Number(operation.balance_after).toFixed(2)}</Td>
                    <Td>{operation.description || '-'}</Td>
                    <Td>{operation.performed_by_username || 'System'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Flex justifyContent="space-between" mt={4} alignItems="center">
            <Text color="gray.600">
              Showing {operations.length} of {paginationData.count} operations
            </Text>
            <HStack>
              <Button
                leftIcon={<ChevronLeftIcon />}
                onClick={() => setPage(page - 1)}
                isDisabled={!paginationData.previous}
                size="sm"
              >
                Previous
              </Button>
              <Text mx={2}>Page {page}</Text>
              <Button
                rightIcon={<ChevronRightIcon />}
                onClick={() => setPage(page + 1)}
                isDisabled={!paginationData.next}
                size="sm"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default CaisseOperationsList;
