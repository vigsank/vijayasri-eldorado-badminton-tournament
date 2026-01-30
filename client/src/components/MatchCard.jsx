import { Badge, Box, Button, ButtonGroup, IconButton, Text, Tooltip, VStack, useDisclosure, useToast } from '@chakra-ui/react';

import AdvancementInfoModal from './AdvancementInfoModal';
import ChangePlayersModal from './ChangePlayersModal';
import { InfoIcon } from '@chakra-ui/icons';
import React from 'react';
import ScoreModal from './ScoreModal';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

const MatchCard = ({ match, isLive = false, allPlayers = [] }) => {
    const { isAdmin } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Explicit disclosure for Change Player Modal
    const {
        isOpen: isPlayerModalOpen,
        onOpen: onPlayerModalOpen,
        onClose: onPlayerModalClose
    } = useDisclosure();

    // Disclosure for Advancement Info Modal
    const {
        isOpen: isAdvancementModalOpen,
        onOpen: onAdvancementModalOpen,
        onClose: onAdvancementModalClose
    } = useDisclosure();

    const toast = useToast();

    const isCompleted = match.status === 'COMPLETED';
    const hasWinner = match.winner && match.winner !== '';

    // Check if match is semi-final or final
    const isSemiFinal = match.stage && (match.stage.toLowerCase().includes('semi') || match.stage.toLowerCase().includes('sf'));
    const isFinal = match.stage && match.stage.toLowerCase().includes('final') && !isSemiFinal;
    const isPlayoffMatch = isSemiFinal || isFinal;

    // Check if players have been advanced (not placeholders)
    const isPlaceholder = (playerName) => {
        return playerName && (
            playerName.includes('Winner') || 
            playerName.includes('Runner') || 
            playerName.includes('Rank') ||
            playerName.includes('Top Team')
        );
    };
    const hasAdvancedPlayers = isPlayoffMatch && !isPlaceholder(match.player1) && !isPlaceholder(match.player2);

    const getStageColor = (stage) => {
        if (!stage) return "gray";
        if (stage.includes('Final')) return "purple";
        if (stage.includes('Semi')) return "pink";
        if (stage.includes('League') || stage.includes('Group')) return "cyan";
        return "blue";
    };

    const updateStatus = async (newStatus) => {
        try {
            const body = { matchId: match.id, status: newStatus };

            // Auto Winner Logic if forcing completed
            if (newStatus === 'COMPLETED') {
                const p1 = parseInt(match.score?.p1 || 0);
                const p2 = parseInt(match.score?.p2 || 0);
                if (p1 > p2) body.winner = match.player1;
                else if (p2 > p1) body.winner = match.player2;
                // If 0-0 or tie, winner remains null unless manually set
            }

            await fetch('/api/matches/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            toast({ title: `Match marked as ${newStatus}`, status: "success", duration: 1500 });
        } catch {
            toast({ title: "Error updating status", status: "error" });
        }
    };

    return (
        <>
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                bg={isLive ? "whiteAlpha.100" : (isCompleted ? "whiteAlpha.50" : "whiteAlpha.50")}
                border="1px solid"
                borderColor={isCompleted ? "purple.400" : (isLive ? "jazzy.neon" : "whiteAlpha.200")}
                p={{ base: 4, md: 5 }}
                borderRadius="xl"
                position="relative"
                overflow="hidden"
                boxShadow={isCompleted ? "0 0 15px rgba(159, 122, 234, 0.3)" : (isLive ? "0 0 20px rgba(204, 255, 0, 0.2)" : "none")}
                transition={{ layout: { duration: 0.3 } }}
            >
                {/* Top Tags */}
                <Box position="absolute" top={2} right={2} display="flex" gap={1} flexWrap="wrap" maxW="60%">
                    <Badge colorScheme={getStageColor(match.stage)} variant="solid" fontSize={{ base: '0.55em', md: '0.6em' }}>
                        {match.stage}
                    </Badge>
                    {isLive && (
                        <Badge colorScheme="green" variant="solid" fontSize={{ base: '0.55em', md: '0.6em' }}>
                            LIVE
                        </Badge>
                    )}
                    {isCompleted && (
                        <Badge colorScheme="purple" variant="solid" fontSize={{ base: '0.55em', md: '0.6em' }}>
                            DONE
                        </Badge>
                    )}
                </Box>

                {/* Advancement Info Icon - Bottom Right */}
                {hasAdvancedPlayers && (
                    <Tooltip 
                        label="View how players advanced to this stage" 
                        placement="top"
                        hasArrow
                        bg="purple.600"
                    >
                        <IconButton
                            icon={<InfoIcon />}
                            position="absolute"
                            bottom={2}
                            right={2}
                            size="sm"
                            colorScheme="purple"
                            variant="ghost"
                            aria-label="Advancement Information"
                            onClick={onAdvancementModalOpen}
                            _hover={{
                                bg: "purple.700",
                                transform: "scale(1.1)"
                            }}
                            transition="all 0.2s"
                        />
                    </Tooltip>
                )}

                <Text color="gray.400" fontSize={{ base: '2xs', md: 'xs' }} mb={2} textTransform="uppercase" letterSpacing="wide" pr="40%">
                    {match.category}
                </Text>

                {/* Match Info */}
                <VStack spacing={{ base: 2, md: 3 }} align="stretch" my={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                        <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} noOfLines={1} flex={1} title={match.player1} color={match.winner === match.player1 ? "green.300" : "white"}>{match.player1}</Text>
                        <Text fontWeight="bold" fontSize={{ base: 'xl', md: '2xl' }} color={isLive ? "jazzy.neon" : "white"} minW="40px" textAlign="right">{match.score?.p1 || 0}</Text>
                    </Box>
                    <Text textAlign="center" fontSize="2xs" color="gray.500">VS</Text>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                        <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} noOfLines={1} flex={1} title={match.player2} color={match.winner === match.player2 ? "green.300" : "white"}>{match.player2}</Text>
                        <Text fontWeight="bold" fontSize={{ base: 'xl', md: '2xl' }} color={isLive ? "jazzy.neon" : "white"} minW="40px" textAlign="right">{match.score?.p2 || 0}</Text>
                    </Box>
                </VStack>

                {/* Footer / Admin Controls */}
                <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                    {isAdmin ? (
                        <VStack spacing={2}>
                            <ButtonGroup size={{ base: 'sm', md: 'xs' }} isAttached variant="outline" width="full">
                                <Button
                                    flex={1}
                                    colorScheme={match.status === 'SCHEDULED' ? 'blue' : 'gray'}
                                    onClick={() => updateStatus('SCHEDULED')}
                                >
                                    Sched
                                </Button>
                                <Button
                                    flex={1}
                                    colorScheme={match.status === 'PLAYING' ? 'green' : 'gray'}
                                    onClick={() => updateStatus('PLAYING')}
                                >
                                    Live
                                </Button>
                                <Button
                                    flex={1}
                                    colorScheme={match.status === 'COMPLETED' ? 'purple' : 'gray'}
                                    onClick={() => updateStatus('COMPLETED')}
                                >
                                    Done
                                </Button>
                            </ButtonGroup>
                            <Button size={{ base: 'md', md: 'sm' }} w="full" colorScheme="jazzy" variant="outline" onClick={onOpen} py={{ base: 5, md: 4 }}>
                                Update Score
                            </Button>
                            <Button size={{ base: 'sm', md: 'xs' }} variant="ghost" color="gray.500" onClick={onPlayerModalOpen}>
                                Change Players
                            </Button>
                        </VStack>
                    ) : (
                        <>
                            <Text fontSize="sm" color="jazzy.300">
                                📍 {match.court || "TBD"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {match.day} • {match.time}
                            </Text>
                            {isCompleted && (
                                hasWinner ? (
                                    <Text fontSize="md" fontWeight="extrabold" color="purple.300" mt={2} textTransform="uppercase" letterSpacing="widest" textAlign="center" textShadow="0 0 10px rgba(128, 0, 128, 0.4)">
                                        🏆 {match.winner}
                                    </Text>
                                ) : (
                                    <Text fontSize="sm" color="gray.500" mt={2} textAlign="center" fontStyle="italic">
                                        No Winner Declared
                                    </Text>
                                )
                            )}
                        </>
                    )}
                </Box>
            </MotionBox>

            {/* Score Modal */}
            <ScoreModal match={match} isOpen={isOpen} onClose={onClose} />

            {/* Change Players Modal */}
            <ChangePlayersModal
                match={match}
                isOpen={isPlayerModalOpen}
                onClose={onPlayerModalClose}
                allPlayers={allPlayers}
            />

            {/* Advancement Info Modal */}
            {hasAdvancedPlayers && (
                <AdvancementInfoModal
                    match={match}
                    isOpen={isAdvancementModalOpen}
                    onClose={onAdvancementModalClose}
                />
            )}
        </>
    );
};

export default MatchCard;
