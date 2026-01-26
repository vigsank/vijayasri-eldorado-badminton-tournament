import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    VStack, FormControl, FormLabel, Select, Button, useToast
} from '@chakra-ui/react';

const ChangePlayersModal = ({ match, isOpen, onClose, allPlayers }) => {
    const [p1, setP1] = useState(match.player1);
    const [p2, setP2] = useState(match.player2);
    const toast = useToast();

    useEffect(() => {
        setP1(match.player1);
        setP2(match.player2);
    }, [match]);

    const handleSave = async () => {
        try {
            await fetch('/api/matches/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: match.id,
                    player1: p1,
                    player2: p2
                })
            });
            toast({ title: "Players updated", status: "success" });
            onClose();
        } catch (err) {
            toast({ title: "Error updating players", status: "error" });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'md' }}>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent bg="gray.800" color="white" border="1px solid" borderColor="jazzy.neon" m={{ base: 0, md: 4 }}>
                <ModalHeader fontSize={{ base: 'lg', md: 'xl' }}>Change Players</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6} px={{ base: 4, md: 6 }}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Player 1</FormLabel>
                            {/* In a real huge app, this should be an async search select. 
                                For now, input text is fine as admin might type "Winner A" or exact name.
                                Actually user asked for Dropdowns. passing all players might be heavy but ok for small tournament.
                            */}
                            <Select
                                value={p1}
                                onChange={(e) => setP1(e.target.value)}
                                color="white"
                                bg="whiteAlpha.100"
                                size={{ base: 'lg', md: 'md' }}
                            >
                                {allPlayers.map((p, i) => (
                                    <option key={i} value={p.name} style={{ color: 'black' }}>{p.name}</option>
                                ))}
                                {/* Add option to keep current if not in list */}
                                {!allPlayers.find(ap => ap.name === p1) && <option value={p1} style={{ color: 'black' }}>{p1}</option>}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Player 2</FormLabel>
                            <Select
                                value={p2}
                                onChange={(e) => setP2(e.target.value)}
                                color="white"
                                bg="whiteAlpha.100"
                                size={{ base: 'lg', md: 'md' }}
                            >
                                {allPlayers.map((p, i) => (
                                    <option key={i} value={p.name} style={{ color: 'black' }}>{p.name}</option>
                                ))}
                                {!allPlayers.find(ap => ap.name === p2) && <option value={p2} style={{ color: 'black' }}>{p2}</option>}
                            </Select>
                        </FormControl>

                        <Button
                            variant="jazzy"
                            w="full"
                            onClick={handleSave}
                            mt={4}
                            size={{ base: 'lg', md: 'md' }}
                            py={{ base: 6, md: 4 }}
                        >
                            Update Players
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ChangePlayersModal;
