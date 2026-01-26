import React, { useState, useEffect, useRef } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    VStack, HStack, Text, Button, IconButton, Box, useToast, Select
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';

const ScoreModal = ({ match, isOpen, onClose }) => {
    const [score, setScore] = useState(match.score || { p1: 0, p2: 0 });
    const [winner, setWinner] = useState(match.winner || '');
    const toast = useToast();

    // We use a ref to prevent the effect from running on mount/initial match set
    // AND to debounce the API call
    const isFirstRun = useRef(true);

    useEffect(() => {
        // Reset local state when match changes
        setScore(match.score || { p1: 0, p2: 0 });
        setWinner(match.winner || '');
        isFirstRun.current = true;
    }, [match]);

    // Effect to handle Debounced API updates when score/winner changes
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const body = {
                    matchId: match.id,
                    score,
                    winner: winner === '' ? null : winner // Handle empty string as null
                };

                await fetch('/api/matches/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (err) {
                toast({ title: "Failed to save score", status: "error", duration: 2000 });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [score, winner, match.id, toast]);

    const changeScore = (player, delta) => {
        setScore(prev => {
            const currentVal = parseInt(prev[player] || 0);
            const newVal = Math.max(0, currentVal + delta);
            return { ...prev, [player]: newVal };
        });
    };

    const handleWinnerChange = (e) => {
        setWinner(e.target.value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }} isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent bg="gray.800" color="white" border="1px solid" borderColor="jazzy.neon" m={{ base: 0, md: 4 }}>
                <ModalHeader textAlign="center" fontSize={{ base: 'lg', md: 'xl' }}>UPDATE SCORE</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={8} px={{ base: 4, md: 6 }}>
                    <HStack spacing={{ base: 4, md: 8 }} justify="center" alignItems="start">
                        {/* Player 1 */}
                        <VStack spacing={{ base: 3, md: 4 }} flex={1}>
                            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" textAlign="center" noOfLines={2} h={{ base: '2.5em', md: '3em' }}>
                                {match.player1}
                            </Text>
                            <Text fontSize={{ base: '5xl', md: '6xl' }} fontWeight="bold" color="jazzy.neon">
                                {score.p1 || 0}
                            </Text>
                            <HStack spacing={3}>
                                <IconButton
                                    icon={<MinusIcon />}
                                    onClick={() => changeScore('p1', -1)}
                                    colorScheme="red"
                                    variant="outline"
                                    aria-label="Decrease P1 Score"
                                    size={{ base: 'lg', md: 'md' }}
                                />
                                <IconButton
                                    icon={<AddIcon />}
                                    onClick={() => changeScore('p1', 1)}
                                    colorScheme="green"
                                    variant="solid"
                                    size={{ base: 'lg', md: 'lg' }}
                                    aria-label="Increase P1 Score"
                                />
                            </HStack>
                        </VStack>

                        <Text fontSize={{ base: 'xl', md: '2xl' }} pt={{ base: 8, md: 10 }} color="gray.500">VS</Text>

                        {/* Player 2 */}
                        <VStack spacing={{ base: 3, md: 4 }} flex={1}>
                            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" textAlign="center" noOfLines={2} h={{ base: '2.5em', md: '3em' }}>
                                {match.player2}
                            </Text>
                            <Text fontSize={{ base: '5xl', md: '6xl' }} fontWeight="bold" color="jazzy.neon">
                                {score.p2 || 0}
                            </Text>
                            <HStack spacing={3}>
                                <IconButton
                                    icon={<MinusIcon />}
                                    onClick={() => changeScore('p2', -1)}
                                    colorScheme="red"
                                    variant="outline"
                                    aria-label="Decrease P2 Score"
                                    size={{ base: 'lg', md: 'md' }}
                                />
                                <IconButton
                                    icon={<AddIcon />}
                                    onClick={() => changeScore('p2', 1)}
                                    colorScheme="green"
                                    variant="solid"
                                    size={{ base: 'lg', md: 'lg' }}
                                    aria-label="Increase P2 Score"
                                />
                            </HStack>
                        </VStack>
                    </HStack>

                    <Box mt={{ base: 6, md: 10 }} bg="whiteAlpha.100" p={{ base: 3, md: 4 }} borderRadius="md">
                        <Text mb={2} color="gray.400" fontSize={{ base: 'xs', md: 'sm' }}>Winner Override (Auto-calculated on completion)</Text>
                        <HStack flexWrap={{ base: 'wrap', sm: 'nowrap' }} gap={2}>
                            <Text fontSize={{ base: 'sm', md: 'md' }}>🏆 Winner:</Text>
                            <Select
                                value={winner}
                                onChange={handleWinnerChange}
                                placeholder="Auto / No Winner Yet"
                                color="white"
                                borderColor="whiteAlpha.300"
                            >
                                <option value={match.player1} style={{ color: 'black' }}>{match.player1}</option>
                                <option value={match.player2} style={{ color: 'black' }}>{match.player2}</option>
                            </Select>
                        </HStack>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ScoreModal;
