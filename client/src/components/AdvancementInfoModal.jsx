import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Badge,
    Box,
    Divider,
    Heading,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    useToast
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';

const AdvancementInfoModal = ({ match, isOpen, onClose }) => {
    const [advancementData, setAdvancementData] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchAdvancementInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/matches/${match.id}/advancement-info`);
            const data = await response.json();
            setAdvancementData(data);
        } catch {
            toast({
                title: 'Error fetching advancement details',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && match) {
            fetchAdvancementInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, match]);

    const renderAdvancementDetails = (playerInfo) => {
        const { name, advancementDetails } = playerInfo;
        
        if (!advancementDetails || advancementDetails.type === 'unknown') {
            return (
                <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                    <Text color="gray.400" fontSize="sm">
                        Advancement details not available yet
                    </Text>
                </Box>
            );
        }

        const { type, description, standings, match: sfMatch } = advancementDetails;

        return (
            <VStack align="stretch" spacing={3}>
                <Box p={4} bg="purple.900" borderRadius="md" border="1px solid" borderColor="purple.500">
                    <HStack spacing={2} mb={2}>
                        <Icon as={CheckCircleIcon} color="green.400" />
                        <Text fontWeight="bold" fontSize="lg" color="purple.200">
                            {name}
                        </Text>
                    </HStack>
                    <Text color="purple.100" fontSize="sm">
                        {description}
                    </Text>
                </Box>

                {type === 'semifinal-winner' && sfMatch && (
                    <Box p={4} bg="whiteAlpha.50" borderRadius="md">
                        <Heading size="sm" mb={3} color="pink.300">
                            Semi-Final Result
                        </Heading>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Text 
                                fontWeight={sfMatch.winner === sfMatch.player1 ? "bold" : "normal"}
                                color={sfMatch.winner === sfMatch.player1 ? "green.300" : "white"}
                            >
                                {sfMatch.player1}
                            </Text>
                            <Badge colorScheme="purple" fontSize="lg" px={3}>
                                {sfMatch.score?.p1 || 0}
                            </Badge>
                        </Box>
                        <Text textAlign="center" fontSize="xs" color="gray.500" my={1}>VS</Text>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Text 
                                fontWeight={sfMatch.winner === sfMatch.player2 ? "bold" : "normal"}
                                color={sfMatch.winner === sfMatch.player2 ? "green.300" : "white"}
                            >
                                {sfMatch.player2}
                            </Text>
                            <Badge colorScheme="purple" fontSize="lg" px={3}>
                                {sfMatch.score?.p2 || 0}
                            </Badge>
                        </Box>
                    </Box>
                )}

                {standings && standings.length > 0 && (
                    <Box overflowX="auto">
                        <Heading size="sm" mb={3} color="cyan.300">
                            {type.includes('group') ? `Group ${advancementDetails.group} Standings` : 'Overall Standings'}
                        </Heading>
                        
                        {/* Legend */}
                        <Box mb={3} p={2} bg="whiteAlpha.50" borderRadius="md" fontSize="xs">
                            <Text color="gray.300" mb={1} fontWeight="semibold">Column Legend:</Text>
                            <Box display="flex" flexWrap="wrap" gap={3}>
                                <Text color="gray.400"><strong>W</strong> = Wins</Text>
                                <Text color="gray.400"><strong>L</strong> = Losses</Text>
                                <Text color="gray.400"><strong>PF</strong> = Points For (scored)</Text>
                                <Text color="gray.400"><strong>PA</strong> = Points Against (conceded)</Text>
                                <Text color="gray.400"><strong>Diff</strong> = Point Difference (PF - PA)</Text>
                            </Box>
                        </Box>

                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400">Rank</Th>
                                    <Th color="gray.400">Player/Team</Th>
                                    <Th color="gray.400" isNumeric>W</Th>
                                    <Th color="gray.400" isNumeric>L</Th>
                                    <Th color="gray.400" isNumeric>PF</Th>
                                    <Th color="gray.400" isNumeric>PA</Th>
                                    <Th color="gray.400" isNumeric>Diff</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {standings.map((player, idx) => (
                                    <Tr 
                                        key={idx}
                                        bg={player.name === name ? "purple.900" : "transparent"}
                                        fontWeight={player.name === name ? "bold" : "normal"}
                                    >
                                        <Td>
                                            {idx + 1 === advancementDetails.position && (
                                                <Badge colorScheme="green" mr={1}>✓</Badge>
                                            )}
                                            {idx + 1}
                                        </Td>
                                        <Td color={player.name === name ? "green.300" : "white"}>
                                            {player.name}
                                        </Td>
                                        <Td isNumeric color="green.300">{player.won}</Td>
                                        <Td isNumeric color="red.300">{player.lost}</Td>
                                        <Td isNumeric>{player.pointsFor}</Td>
                                        <Td isNumeric>{player.pointsAgainst}</Td>
                                        <Td 
                                            isNumeric 
                                            color={player.pointDiff > 0 ? "green.300" : player.pointDiff < 0 ? "red.300" : "white"}
                                            fontWeight="bold"
                                        >
                                            {player.pointDiff > 0 ? '+' : ''}{player.pointDiff}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </VStack>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
            <ModalContent bg="gray.900" border="1px solid" borderColor="purple.500" maxH="90vh">
                <ModalHeader color="purple.300" borderBottom="1px solid" borderColor="whiteAlpha.200">
                    <HStack spacing={2}>
                        <Icon as={InfoIcon} />
                        <Text>Advancement Information</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.400" fontWeight="normal" mt={1}>
                        {match?.stage} - {match?.category}
                    </Text>
                </ModalHeader>
                <ModalCloseButton color="gray.400" />
                <ModalBody py={6}>
                    {loading ? (
                        <Box textAlign="center" py={10}>
                            <Spinner size="xl" color="purple.400" />
                            <Text mt={4} color="gray.400">Loading advancement details...</Text>
                        </Box>
                    ) : advancementData && advancementData.hasAdvancement ? (
                        <VStack spacing={6} align="stretch">
                            <Alert status="info" bg="blue.900" border="1px solid" borderColor="blue.500" borderRadius="md">
                                <AlertIcon color="blue.300" />
                                <Box>
                                    <AlertTitle color="blue.200">How Players Advanced</AlertTitle>
                                    <AlertDescription color="blue.100" fontSize="sm">
                                        This match features players who automatically advanced based on their performance in previous rounds. 
                                        The advancement follows the official tournament rules using a 3-level tie-breaker system:
                                        <br />
                                        <strong>1.</strong> Match Wins &nbsp;|&nbsp; <strong>2.</strong> Head-to-Head (if applicable) &nbsp;|&nbsp; <strong>3.</strong> Point Difference &nbsp;|&nbsp; <strong>4.</strong> Total Points Scored
                                    </AlertDescription>
                                </Box>
                            </Alert>

                            <Box>
                                <Heading size="sm" mb={3} color="jazzy.neon">
                                    Player 1 Advancement
                                </Heading>
                                {renderAdvancementDetails(advancementData.player1)}
                            </Box>

                            <Divider borderColor="whiteAlpha.300" />

                            <Box>
                                <Heading size="sm" mb={3} color="jazzy.neon">
                                    Player 2 Advancement
                                </Heading>
                                {renderAdvancementDetails(advancementData.player2)}
                            </Box>

                            <Alert status="warning" bg="orange.900" border="1px solid" borderColor="orange.500" borderRadius="md">
                                <AlertIcon color="orange.300" />
                                <Box>
                                    <AlertDescription color="orange.100" fontSize="sm">
                                        If you have any questions about the advancement calculations or standings, 
                                        please contact the tournament committee.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        </VStack>
                    ) : (
                        <Alert status="info" bg="gray.800" borderRadius="md">
                            <AlertIcon />
                            <AlertDescription>
                                Advancement information is only available for Semi-Final and Final matches.
                            </AlertDescription>
                        </Alert>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

// Helper component for horizontal stack
const HStack = ({ children, spacing, ...props }) => (
    <Box display="flex" alignItems="center" gap={spacing} {...props}>
        {children}
    </Box>
);

export default AdvancementInfoModal;
